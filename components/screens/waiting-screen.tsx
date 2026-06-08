"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/utils/cn";
import type { Player } from "@/lib/types";

type WaitingScreenProps = {
  players: Player[];
  /** locked-roster voter uids we wait on */
  voters: string[];
  /** uid → cards swiped so far */
  progress: Record<string, number>;
  deckSize: number;
  myUid: string;
  reduced: boolean;
};

export function WaitingScreen({
  players,
  voters,
  progress,
  deckSize,
  myUid,
  reduced,
}: WaitingScreenProps) {
  const rows = voters
    .map((uid) => {
      const p = players.find((pl) => pl.id === uid);
      if (!p) return null;
      const cursor = Math.min(progress[uid] ?? 0, deckSize);
      return { p, cursor, done: cursor >= deckSize };
    })
    .filter((r): r is { p: Player; cursor: number; done: boolean } => r !== null);

  const doneCount = rows.filter((r) => r.done).length;
  const remaining = rows.length - doneCount;

  return (
    <Screen bg="var(--cream-2)">
      <div className="shrink-0 pt-15 px-6 pb-0 text-center">
        <div className={cn("text-[54px]", !reduced && "animate-[rmFloat_3.4s_ease-in-out_infinite]")}>
          🍜
        </div>
        <h1 className="font-display mt-3 text-[26px] font-bold text-ink leading-[1.2]">
          คุณปัดครบแล้ว!
        </h1>
        <p className="mt-2 text-sm text-ink-2 leading-[1.45]">
          {remaining > 0 ? `รอเพื่อนอีก ${remaining} คนปัดให้ครบ` : "กำลังสรุปผล…"}
        </p>
      </div>

      <div className="shrink-0 mt-5 px-7">
        <div className="mb-2 flex items-center justify-between text-[13px] font-bold">
          <span className="text-ink-2">ปัดเสร็จแล้ว</span>
          <span className="text-good">
            {doneCount}/{rows.length} คน
          </span>
        </div>
        <ProgressBar value={doneCount} max={Math.max(rows.length, 1)} color="var(--good)" />
      </div>

      <div className="flex-1 overflow-auto px-5 py-5">
        <div className="flex flex-col gap-2.5">
          {rows.map(({ p, cursor, done }) => (
            <div
              key={p.id}
              className={cn(
                "flex items-center gap-3 rounded-[18px] py-2.75 px-3.5 shadow-soft transition-colors duration-300",
                done ? "bg-white" : "bg-white/60",
                !reduced && "animate-[rmDropIn_.45s_cubic-bezier(.34,1.5,.5,1)]"
              )}
            >
              <Avatar p={p} size={44} check={done} dim={!done} />
              <div className="min-w-0 flex-1">
                <div className="font-display text-base font-semibold text-ink truncate">
                  {p.name}
                  {p.id === myUid && <span className="text-ink-3 text-[13px]"> (คุณ)</span>}
                </div>
                <div
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-semibold",
                    done ? "text-good" : "text-ink-3"
                  )}
                >
                  {done ? (
                    <>
                      <CheckIcon size={11} weight="bold" /> ปัดครบแล้ว
                    </>
                  ) : (
                    `กำลังปัด ${cursor}/${deckSize}`
                  )}
                </div>
              </div>
              {!done && <WaitingDots reduced={reduced} />}
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

function WaitingDots({ reduced }: { reduced: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 pr-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "size-1.5 rounded-full bg-ink-3",
            !reduced && "animate-[rmHeartbeat_1.1s_ease-in-out_infinite]"
          )}
          style={reduced ? undefined : { animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}
