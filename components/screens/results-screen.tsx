"use client";

import { NavigationArrowIcon, TrophyIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/ui/buttons";
import { FoodPhoto } from "@/components/ui/food-photo";
import { Screen } from "@/components/ui/screen";
import { Stars } from "@/components/ui/stars";
import { cn } from "@/lib/utils/cn";
import { priceStr } from "@/lib/data";
import type {
  FinalVoteRound,
  Player,
  RankedResult,
  Restaurant,
} from "@/lib/types";

type RankedRestaurant = RankedResult & { r: Restaurant };

function mapsDirLink(r: Restaurant): string {
  const dest = encodeURIComponent(r.name + (r.addr ? " " + r.addr : ""));
  if (r.placeId)
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}&destination_place_id=${r.placeId}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}

function scoreText(row: RankedResult): string {
  return `ถูกใจ ${row.likes}/${row.voterCount}`;
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
      className={cn(
        "grid items-center bg-white rounded-xl p-3 shadow-card",
        "grid-cols-[32px_70px_minmax(0,1fr)] gap-3",
        winner ? "border-2 border-amber" : "border-2 border-transparent",
      )}>
      <div
        className={cn(
          "font-display w-8 h-8 rounded-full flex items-center justify-center font-bold",
          winner ? "bg-amber text-ink" : "bg-cream-3 text-ink-2",
        )}>
        {row.rank}
      </div>
      <button
        className="rm-tap w-17.5 h-17.5 rounded-2xl overflow-hidden border-none p-0 cursor-pointer bg-transparent"
        onClick={() => onPick(row.r)}
        aria-label={`ดูรายละเอียด ${row.r.name}`}>
        <FoodPhoto r={row.r} label={false} />
      </button>
      <div className="min-w-0">
        <div className="font-display text-[17px] font-bold text-ink whitespace-nowrap overflow-hidden text-ellipsis">
          {row.r.name}
        </div>
        <div className="flex items-center gap-1.75 mt-1 text-xs text-ink-3 font-semibold flex-wrap">
          <Stars value={row.r.rating} size={12} /> {row.r.rating}
          <span>·</span>
          <span>{priceStr(row.r.price)}</span>
          <span>·</span>
          <span>{row.r.dist} กม.</span>
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-xs font-extrabold px-2.25 py-0.75 rounded-full",
              winner
                ? "text-[#8A5A00] bg-[rgba(255,200,69,0.24)]"
                : "text-cta bg-[rgba(255,90,60,0.1)]",
            )}>
            {scoreText(row)} · {row.likePct}%
          </span>
          <a
            href={mapsDirLink(row.r)}
            target="_blank"
            rel="noreferrer"
            className="rm-tap inline-flex items-center gap-1 text-good text-xs font-extrabold no-underline">
            นำทาง <NavigationArrowIcon size={14} weight="fill" />
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
  canRestart = true,
}: {
  winner: Restaurant;
  ranked: RankedRestaurant[];
  players: Player[];
  onOpen: () => void;
  onAgain: () => void;
  onHome: () => void;
  onPick: (r: Restaurant) => void;
  canRestart?: boolean;
}) {
  const winnerRow = ranked.find((row) => row.restaurantId === winner.id);

  return (
    <Screen bg="var(--cream-2)">
      <div className="shrink-0 pt-13.5 px-5.5 pb-2.5">
        <div className="flex items-center justify-between gap-3.5">
          <div>
            <div className="font-display text-[29px] leading-[1.05] font-extrabold text-ink">
              อันดับสุดท้าย
            </div>
            <div className="mt-1.5 text-sm text-ink-3">
              ร้านที่ชนะ: <b className="text-cta">{winner.name}</b>
              {winnerRow ? ` · ${scoreText(winnerRow)}` : ""}
            </div>
          </div>
          <div className="w-13 h-13 rounded-full bg-amber flex items-center justify-center text-ink shrink-0">
            <TrophyIcon size={28} weight="fill" />
          </div>
        </div>
        <div className="flex items-center mt-3">
          {players.map((p, i) => (
            <div key={p.id} className={cn(i ? "-ml-2.25" : "ml-0")}>
              <Avatar p={p} size={30} />
            </div>
          ))}
          <span className="ml-2.25 text-xs text-ink-3">
            {players.length} คนโหวต
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4.5 py-2">
        <div className="flex flex-col gap-2.5">
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

      <div className="shrink-0 pt-3 px-6 pb-[max(20px,env(safe-area-inset-bottom))] flex flex-col gap-2.25">
        <PrimaryButton onClick={onOpen}>ดูรายละเอียดร้านที่ชนะ</PrimaryButton>
        <button
          className={cn(
            "rm-tap font-display bg-transparent border-none font-semibold text-[14.5px] p-1.5",
            canRestart
              ? "text-ink-2 cursor-pointer"
              : "text-ink-3 cursor-not-allowed"
          )}
          onClick={onAgain}
          disabled={!canRestart}>
          สุ่มร้านชุดใหม่
        </button>
        {!canRestart && (
          <p className="m-0 text-center text-[13px] text-ink-3 font-semibold">
            ต้องมีอย่างน้อย 2 คน
          </p>
        )}
        <button
          className="rm-tap font-display bg-transparent border-none text-ink-3 font-medium text-[13.5px] cursor-pointer p-1"
          onClick={onHome}>
          กลับหน้าหลัก
        </button>
      </div>
    </Screen>
  );
}

export function FinalVoteScreen({
  finalVote,
  options,
  voterCount,
  myUid,
  onVote,
}: {
  finalVote: FinalVoteRound;
  options: Restaurant[];
  voterCount: number;
  myUid: string;
  onVote: (restaurantId: string) => void | Promise<void>;
}) {
  const myVote = finalVote.votes[myUid];
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  async function handleVote(id: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setVoteError(null);
    try {
      await onVote(id);
    } catch (e) {
      setVoteError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <Screen bg="var(--cream)">
      <div className="shrink-0 pt-14.5 px-6 pb-2.5 text-center">
        <div className="font-display text-3xl font-extrabold text-ink">
          โหวตตัดสิน
        </div>
        <div className="mt-1.5 text-ink-3 text-sm">
          รอบตัดสินที่ {finalVote.round} · เลือกได้ร้านเดียว
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-3.5">
        <div className="flex flex-col gap-3">
          {options.map((r) => {
            const selected = myVote === r.id;
            const votes = Object.values(finalVote.votes).filter(
              (id) => id === r.id,
            ).length;
            return (
              <button
                key={r.id}
                disabled={busy}
                className={cn(
                  "rm-tap flex items-center gap-3.25 w-full p-3 rounded-xl text-left shadow-card",
                  busy
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer",
                  selected
                    ? "border-2 border-coral bg-[rgba(255,90,60,0.07)]"
                    : "border-2 border-transparent bg-white",
                )}
                onClick={() => handleVote(r.id)}>
                <div className="w-18.5 h-18.5 rounded-2xl overflow-hidden shrink-0">
                  <FoodPhoto r={r} label={false} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg font-bold text-ink whitespace-nowrap overflow-hidden text-ellipsis">
                    {r.name}
                  </div>
                  <div className="mt-1.25 text-xs text-ink-3 font-semibold">
                    <Stars value={r.rating} size={12} /> {r.rating} ·{" "}
                    {priceStr(r.price)} · {r.dist} กม.
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-extrabold",
                        selected ? "text-cta" : "text-ink-3",
                      )}>
                      โหวตแล้ว {votes}/{voterCount}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 pt-3 px-6 pb-[max(22px,env(safe-area-inset-bottom))] text-center text-[13px] font-semibold">
        {voteError ? (
          <span className="text-cta">{voteError}</span>
        ) : myVote ? (
          <span className="text-ink-3">รอเพื่อนโหวตให้ครบ…</span>
        ) : (
          <span className="text-ink-3">เลือกร้านที่คะแนนเสมอกัน 1 ร้าน</span>
        )}
      </div>
    </Screen>
  );
}
