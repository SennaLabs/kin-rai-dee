"use client";

import { NavigationArrowIcon, TrophyIcon } from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/ui/buttons";
import { FoodPhoto } from "@/components/ui/food-photo";
import { Screen } from "@/components/ui/screen";
import { Stars } from "@/components/ui/stars";
import { priceStr } from "@/lib/data";
import type { FinalVoteRound, Player, RankedResult, Restaurant } from "@/lib/types";

type RankedRestaurant = RankedResult & { r: Restaurant };

function mapsDirLink(r: Restaurant): string {
  const dest = encodeURIComponent(r.name + (r.addr ? " " + r.addr : ""));
  if (r.placeId)
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}&destination_place_id=${r.placeId}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}

function scoreText(row: RankedResult): string {
  return `${row.likes}/${row.voterCount} likes`;
}

function RankRow({
  row,
  winner,
  onPick,
}: {
  row: RankedRestaurant;
  winner?: boolean;
  onPick: (r: Restaurant) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "32px 70px minmax(0,1fr)",
        gap: 12,
        alignItems: "center",
        background: "#fff",
        borderRadius: 20,
        padding: 12,
        boxShadow: "var(--sh-card)",
        border: winner ? "2px solid var(--amber)" : "2px solid transparent",
      }}
    >
      <div
        className="font-display"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: winner ? "var(--amber)" : "var(--cream-3)",
          color: winner ? "var(--ink)" : "var(--ink-2)",
          fontWeight: 700,
        }}
      >
        {row.rank}
      </div>
      <button
        className="rm-tap"
        onClick={() => onPick(row.r)}
        aria-label={`ดูรายละเอียด ${row.r.name}`}
        style={{
          width: 70,
          height: 70,
          borderRadius: 16,
          overflow: "hidden",
          border: "none",
          padding: 0,
          cursor: "pointer",
          background: "transparent",
        }}
      >
        <FoodPhoto r={row.r} label={false} />
      </button>
      <div style={{ minWidth: 0 }}>
        <div
          className="font-display"
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--ink)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {row.r.name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginTop: 4,
            fontSize: 12.5,
            color: "var(--ink-3)",
            fontWeight: 600,
            flexWrap: "wrap",
          }}
        >
          <Stars value={row.r.rating} size={12} /> {row.r.rating}
          <span>·</span>
          <span>{priceStr(row.r.price)}</span>
          <span>·</span>
          <span>{row.r.dist} กม.</span>
        </div>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              color: winner ? "#8A5A00" : "var(--cta)",
              background: winner ? "rgba(255,200,69,0.24)" : "rgba(255,90,60,0.1)",
              padding: "3px 9px",
              borderRadius: 999,
            }}
          >
            {scoreText(row)} · {row.likePct}%
          </span>
          <a
            href={mapsDirLink(row.r)}
            target="_blank"
            rel="noreferrer"
            className="rm-tap"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              color: "var(--good)",
              fontSize: 12.5,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Directions <NavigationArrowIcon size={14} weight="fill" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function ResultsScreen({
  winner,
  ranked,
  players,
  onOpen,
  onAgain,
  onHome,
  onPick,
}: {
  winner: Restaurant;
  ranked: RankedRestaurant[];
  players: Player[];
  onOpen: () => void;
  onAgain: () => void;
  onHome: () => void;
  onPick: (r: Restaurant) => void;
}) {
  const winnerRow = ranked.find((row) => row.restaurantId === winner.id);

  return (
    <Screen bg="var(--cream-2)">
      <div style={{ flexShrink: 0, padding: "54px 22px 10px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div>
            <div
              className="font-display"
              style={{
                fontSize: 29,
                lineHeight: 1.05,
                fontWeight: 800,
                color: "var(--ink)",
              }}
            >
              Final ranking
            </div>
            <div style={{ marginTop: 6, fontSize: 14, color: "var(--ink-3)" }}>
              Winner: <b style={{ color: "var(--cta)" }}>{winner.name}</b>
              {winnerRow ? ` · ${scoreText(winnerRow)}` : ""}
            </div>
          </div>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "var(--amber)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink)",
              flexShrink: 0,
            }}
          >
            <TrophyIcon size={28} weight="fill" />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
          {players.map((p, i) => (
            <div key={p.id} style={{ marginLeft: i ? -9 : 0 }}>
              <Avatar p={p} size={30} />
            </div>
          ))}
          <span style={{ marginLeft: 9, fontSize: 12.5, color: "var(--ink-3)" }}>
            {players.length} voters
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "8px 18px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ranked.map((row) => (
            <RankRow
              key={row.restaurantId}
              row={row}
              winner={row.restaurantId === winner.id}
              onPick={onPick}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: "12px 24px max(20px, env(safe-area-inset-bottom))",
          display: "flex",
          flexDirection: "column",
          gap: 9,
        }}
      >
        <PrimaryButton onClick={onOpen}>ดูรายละเอียดร้านที่ชนะ</PrimaryButton>
        <button
          className="rm-tap font-display"
          onClick={onAgain}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--ink-2)",
            fontWeight: 600,
            fontSize: 14.5,
            cursor: "pointer",
            padding: 6,
          }}
        >
          Regenerate a new deck
        </button>
        <button
          className="rm-tap font-display"
          onClick={onHome}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--ink-3)",
            fontWeight: 500,
            fontSize: 13.5,
            cursor: "pointer",
            padding: 4,
          }}
        >
          Back to home
        </button>
      </div>
    </Screen>
  );
}

export function FinalVoteScreen({
  finalVote,
  options,
  players,
  myUid,
  onVote,
}: {
  finalVote: FinalVoteRound;
  options: Restaurant[];
  players: Player[];
  myUid: string;
  onVote: (restaurantId: string) => void;
}) {
  const myVote = finalVote.votes[myUid];

  return (
    <Screen bg="var(--cream)">
      <div style={{ flexShrink: 0, padding: "58px 24px 10px", textAlign: "center" }}>
        <div className="font-display" style={{ fontSize: 30, fontWeight: 800, color: "var(--ink)" }}>
          Final vote
        </div>
        <div style={{ marginTop: 6, color: "var(--ink-3)", fontSize: 14 }}>
          Tie-break round {finalVote.round} · pick exactly one restaurant
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "14px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {options.map((r) => {
            const selected = myVote === r.id;
            const votes = Object.values(finalVote.votes).filter((id) => id === r.id).length;
            return (
              <button
                key={r.id}
                className="rm-tap"
                onClick={() => onVote(r.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  width: "100%",
                  padding: 12,
                  borderRadius: 20,
                  border: selected ? "2px solid var(--coral)" : "2px solid transparent",
                  background: selected ? "rgba(255,90,60,0.07)" : "#fff",
                  boxShadow: "var(--sh-card)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ width: 74, height: 74, borderRadius: 16, overflow: "hidden", flexShrink: 0 }}>
                  <FoodPhoto r={r} label={false} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    className="font-display"
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--ink)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.name}
                  </div>
                  <div style={{ marginTop: 5, fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>
                    <Stars value={r.rating} size={12} /> {r.rating} · {priceStr(r.price)} · {r.dist} กม.
                  </div>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: selected ? "var(--cta)" : "var(--ink-3)",
                        fontWeight: 800,
                      }}
                    >
                      {votes}/{players.length} final votes
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: "12px 24px max(22px, env(safe-area-inset-bottom))",
          textAlign: "center",
          color: "var(--ink-3)",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {myVote ? "Waiting for everyone else's final vote..." : "Choose one tied restaurant."}
      </div>
    </Screen>
  );
}
