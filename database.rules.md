# Realtime Database Security Rules

Companion to [`database.rules.json`](database.rules.json). These rules harden the
live game tree (`rooms/{code}`) described in [.claude/wiki.md](.claude/wiki.md)
§3.3/§3.6 and enforced against the actual write paths in
[lib/services/room.service.ts](lib/services/room.service.ts).

Deploy with:

```bash
firebase deploy --only database
```

> Rules are the **last** line of defence, not the only one. They assume every
> request carries a Firebase Anonymous Auth token (`auth.uid`) and that
> **App Check** (reCAPTCHA Enterprise) is enforced on the database to keep bots
> from burning quota (wiki §2.7 #15 / §3.6). The Places API key never touches
> the client — it lives only in the `/api/places/*` route handlers.

## Mental model: how RTDB rules evaluate

A few facts the design leans on — getting these wrong is the usual source of
"works in the emulator, breaks in prod":

- **`.read` / `.write` cascade and are OR'd top-down.** If a rule grants access
  at any node from the root down to the target, access is granted. A `false`
  higher up never *revokes* a `true` lower down — so the root `".read": false`
  / `".write": false` are just defaults, not a lock.
- **A read is all-or-nothing at the queried path.** `onValue(rooms/$code)`
  needs read permission at `rooms/$code` itself; per-child rules can't filter a
  parent read. That's why the whole-room read is granted to members at
  `rooms/$code`, and a *separate, narrower* read is exposed at
  `meta/status` for the join/create existence check.
- **`.validate` does NOT cascade.** Every validate rule that matches written
  data must pass. `"$other": { ".validate": false }` therefore *locks the
  schema* — any key without an explicit rule is rejected.
- **`data` = pre-write, `newData` = post-write, `root` = pre-write root.**
  Multi-location `update()`s are atomic: each leaf is validated against the
  merged result.

## Identity helpers (inlined everywhere, RTDB has no functions)

| Concept | Expression |
|---|---|
| **is a member** | `root.child('rooms').child($code).child('participants').child(auth.uid).exists()` |
| **is the host** | `root.child('rooms').child($code).child('meta').child('hostId').val() === auth.uid` |
| **room status** | `root.child('rooms').child($code).child('meta').child('status').val()` |

---

## Rule-by-rule

### `rooms/$code/.read` — **only members read room data** (requirement 1)
```
auth != null && <is a member>
```
The app subscribes to the entire `rooms/$code` node in one `onValue`
([room.service.ts `subscribeToRoom`](lib/services/room.service.ts)), so read is
granted at the room level — but only to a user who already has a
`participants/{uid}` entry. Non-members can't slurp the deck, likes, presence,
or location.

### `rooms/$code/meta/status/.read` — joinable-check escape hatch
```
auth != null
```
Joining and creating need to know "does this code exist / is it still in
`lobby`?" *before* you're a member. Exposing **only** `meta/status` (not the
whole `meta`) lets any signed-in user run that check while keeping the host's
chosen location (`meta/filters.lat/lng`), `hostId`, and counts private to
members. `create()` and `join()` read exactly this path.

### `rooms/$code/.write` — **host tears down the room**
```
auth != null && !newData.exists() && <is the host>
```
The only whole-room write anyone may do is **delete it** (`newData` gone), and
only the host. The last person to leave is always the host (host migration
keeps a host present; a non-host leaving never empties the room), so this
covers `leave()`'s empty-room cleanup and recycles the 4-char code (wiki §2.7
#8). Because the grant requires `!newData.exists()`, it never accidentally
authorises child writes (a like, a deck, etc. all have `newData`).

### `rooms/$code/meta/.write` — **host owns the lifecycle** (requirement 5)
```
auth != null && (
  (!data.exists() && newData.child('hostId').val() === auth.uid)  // create
  || data.child('hostId').val() === auth.uid                       // host edits
)
```
- **Create**: allowed only when the room doesn't exist yet *and* the new
  `hostId` is the caller — you can't create a room owned by someone else.
- **Edits**: only the current host may touch `meta` (start game, restart,
  migrate). This grant cascades to `meta/*`, which is fine — managing your own
  room's metadata is the host's job, and every field is still schema-validated
  below. A voter or outsider gets nothing here.

### `rooms/$code/meta/status/.write` — controlled state transitions
```
auth != null && (
  <is the host>
  || (newData.val() === 'matched' && <match exists> && <is a member>)
)
```
The host drives `lobby → active` (start) and back to `active` (restart). The
extra clause lets **any member** flip the room to `matched` — but *only* once a
`match/` node has actually been declared. This matches `declareMatch()`: the
winning client (not necessarily the host) sets the match via transaction, then
sets `status: 'matched'`. No one can jump the room to `matched` without a real
match. `.validate` pins the value to the four legal states.

### `rooms/$code/meta/hostId/.validate` — host must be a real participant
```
newData.isString() && (newData.val() === auth.uid
  || root.child('.../participants/' + newData.val()).exists())
```
On create the host is the caller; on migration the new host must already be a
participant. Prevents pointing `hostId` at a stranger.

### `meta/createdAt`, `expiresAt`, `voterCount`, `deckSize` — typed & sane
Numbers only; `createdAt <= now` (it's a server timestamp), `expiresAt > now`
(a future TTL), counts `>= 0`. Cheap guards against garbage being written into
the room header.

### `meta/roster/$uid/.validate` — roster = real participants
```
newData.isBoolean() && newData.val() === true
  && root.child('.../participants/' + $uid).exists()
```
The locked voter set may only contain `true` flags for people who are actually
in the room (wiki §2.3).

### `meta/filters/*` — bounded, schema-locked settings
Each field is range-checked (`lat∈[-90,90]`, `lng∈[-180,180]`,
`0 < radiusKm ≤ 50`, `priceMin/Max ∈ [1,4]`, `openNow` boolean, cuisine strings
≤ 40 chars). `"$other": { ".validate": false }` rejects any unexpected key, so a
client can't smuggle extra data into the room header.

### `participants/$uid/.write` — **you only write yourself** (requirement 3)
```
auth != null && $uid === auth.uid && (
  data.exists()                                   // update/leave your own entry
  || !<meta exists>                               // host self-add during create
  || <status> === 'lobby'                         // join is lobby-only
)
```
- `$uid === auth.uid` is the core: **no one can create, edit, or remove another
  member** — not even the host. (Host migration moves only `meta/hostId`; the
  displayed host is derived from `meta.hostId`, so no cross-member write is
  needed.)
- New entries are gated to `status === 'lobby'`, which enforces the late-join
  rejection (wiki §2.7 #3) at the database layer, not just in app code.
- Existing entries (`data.exists()`) can always be updated/removed by their
  owner — that's `ready` toggles, `connected` presence + `onDisconnect`, and
  leaving.

Field validations cap `name`/`emoji` length, force booleans for
`host`/`ready`/`connected`, and `"$other": false` locks the shape.

### `deck/.write` — host-built, immutable to voters
```
auth != null && <is the host>
```
Only the host writes the shared deck (once at start, again on restart — wiki
§2.3). Voters can read it (via the room read) but never alter it, so everyone
swipes the same cards in the same order. Each entry must at least carry a string
`id` and `name`.

### `likes/.write` (parent) — host-only reset
```
auth != null && !newData.exists() && <is the host>
```
The only write at the `likes` *collection* level is clearing it (`null`) on
start/restart. This deliberately does **not** let the host fabricate likes — it
can only delete.

### `likes/$restaurantId/$uid` — **you only cast your own vote** (requirement 2)
```
.write:   auth != null && $uid === auth.uid && <is a member>
          && <status> === 'active'
.validate: newData.isNumber() && newData.val() <= now
```
A like is keyed by the voter's own uid; `$uid === auth.uid` makes
vote-stuffing for someone else impossible. Votes are only accepted while the
round is `active`, and the value must be a server timestamp (`<= now`).

### `progress/.write` + `progress/$uid` — own cursor only
Same shape as likes: host can reset the whole node; each player writes only
their own resume cursor, validated as a non-negative number.

### `match/.write` — **match only via the expected transaction** (requirement 4)
```
auth != null && (
  (!newData.exists() && <is the host>)                  // host clears on restart
  || (!data.exists() && newData.exists()                // first-writer-wins create
      && <is a member> && <status> === 'active')
)
```
The create branch requires `!data.exists()` — so the match can be written **at
most once** and never overwritten (the winner is final). This is the rules-layer
twin of the `runTransaction` in `declareMatch()`: even if two clients race, only
the first commit satisfies `!data.exists()`. A match can only be declared by a
member while the round is `active`. The host may clear it (`null`) to start a new
round.

Validation makes a forged match impossible:
- `restaurantId` must be a string **and** correspond to a restaurant that has
  real likes (`likes/{restaurantId}` exists).
- every entry in `likers/{uid}` must be `true` **and** that uid must actually
  have liked `restaurantId` (`likes/{restaurantId}/{uid}` exists).

So you cannot declare a match for a restaurant nobody liked, nor list likers who
never voted. `"$other": false` keeps the node to exactly
`{restaurantId, at, likers}`.

> **Residual trust (by design, MVP):** the rules verify each declared liker
> *did* like the restaurant, but cannot cheaply verify that *all connected
> voters* did (presence is dynamic). The client transaction enforces the full
> unanimity test; a Cloud Function backstop is the Phase-2 hardening (wiki §3.4).

---

## App changes required by these rules

The rules made one previously-legal pattern illegal, so
[room.service.ts](lib/services/room.service.ts) was adjusted:

- **`leave()` now reads the room *before* removing the caller** (you must still
  be a member to read it) and performs removal + host migration in one atomic
  `update()`. Host migration writes only `meta/hostId` — it no longer flips
  another participant's `host` flag (that flag was vestigial; the host is
  derived from `meta.hostId`), keeping "no cross-member writes" intact.
- **`create()` / `join()` read `meta/status`** (the publicly-readable node)
  instead of the whole `meta`, so the existence/lobby check works for
  not-yet-members without exposing the room's location.

## Suggested test matrix (Rules emulator / unit tests)

| Attempt | Expected |
|---|---|
| Non-member reads `rooms/$code` | ❌ denied |
| Non-member reads `rooms/$code/meta/status` | ✅ allowed |
| Member reads full room | ✅ allowed |
| Write `likes/$rid/$otherUid` | ❌ denied |
| Write own `likes/$rid/$me` while `active` | ✅ allowed |
| Write own like while `lobby`/`matched` | ❌ denied |
| Edit another `participants/$uid` | ❌ denied |
| Join (`participants/$me`) while `active` | ❌ denied |
| Non-host writes `deck` / `meta` | ❌ denied |
| Declare a 2nd `match` over an existing one | ❌ denied |
| Declare `match` for a restaurant with no likes | ❌ denied |
| `match.likers` includes a non-liker | ❌ denied |
