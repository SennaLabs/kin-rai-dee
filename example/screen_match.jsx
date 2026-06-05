// screen_match.jsx — Screen 6: Match Reveal (slot-machine + confetti)

const { useState: useStateM, useRef: useRefM, useEffect: useEffectM } = React;

const ITEM_H = 150;

function ReelItem({ r, winner }) {
  return (
    <div style={{ height: ITEM_H, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', boxSizing: 'border-box' }}>
      <div style={{ width: 96, height: 96, borderRadius: 22, overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 18px rgba(43,27,23,0.18)' }}>
        <FoodPhoto r={r} label={false} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="font-display" style={{ fontSize: 25, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--ink-2)' }}>
          <Stars value={r.rating} size={14} /> {r.rating}
          <span style={{ color: 'var(--ink-3)' }}>·</span> {priceStr(r.price)}
          <span style={{ color: 'var(--ink-3)' }}>·</span> {r.dist} กม.
        </div>
      </div>
    </div>
  );
}

function MatchScreen({ winner, candidates, players, onOpen, onAgain, reduced, confetti = true }) {
  // phase: matching → spinning → revealed
  const [phase, setPhase] = useStateM('matching');
  const [offset, setOffset] = useStateM(0);
  const [trans, setTrans] = useStateM('none');

  // Build the reel: several loops of the candidate pool, ending on winner.
  const reelRef = useRefM(null);
  if (!reelRef.current) {
    const pool = candidates && candidates.length ? candidates.slice() : [winner];
    if (!pool.find(x => x.id === winner.id)) pool.push(winner);
    const seq = [];
    const loops = 5;
    for (let l = 0; l < loops; l++) {
      for (const r of pool) seq.push(r);
    }
    // ensure final visible item is the winner
    seq.push(winner);
    reelRef.current = { seq, winnerIndex: seq.length - 1 };
  }
  const { seq, winnerIndex } = reelRef.current;

  useEffectM(() => {
    if (reduced) {
      // reduced motion: short radar then straight reveal, no spin
      const t1 = setTimeout(() => { setOffset(winnerIndex * ITEM_H); setPhase('revealed'); }, 700);
      return () => clearTimeout(t1);
    }
    const t1 = setTimeout(() => {
      setPhase('spinning');
      // kick the reel to the winner with a long decelerating ease
      setTrans(`transform 2.4s cubic-bezier(.12,.7,.18,1)`);
      requestAnimationFrame(() => setOffset(winnerIndex * ITEM_H));
    }, 1500);
    const t2 = setTimeout(() => { setPhase('revealed'); buzz(40); }, 1500 + 2450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const others = players;

  return (
    <Screen bg="linear-gradient(180deg, #FF6B4A 0%, #E63946 60%, #D7263D 100%)" style={{ color: '#fff' }}>
      <Confetti fire={phase === 'revealed' && confetti} reduced={reduced} />

      {/* glowing rings backdrop */}
      <div style={{ position: 'absolute', top: '12%', left: '50%', transform: 'translateX(-50%)', width: 460, height: 460, pointerEvents: 'none' }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ position: 'absolute', inset: i*46, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.16)' }} />
        ))}
      </div>

      {/* ── header / status ── */}
      <div style={{ flexShrink: 0, padding: '60px 24px 0', textAlign: 'center', position: 'relative', zIndex: 5 }}>
        {phase !== 'revealed' ? (
          <div>
            {/* radar around avatars */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 22 }}>
              {players.map((p, i) => (
                <div key={p.id} style={{ position: 'relative', animation: reduced ? 'none' : 'rmHeartbeat 1.3s ease-in-out infinite', animationDelay: `${i*0.12}s` }}>
                  <Avatar p={p} size={46} ring />
                  <span style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)', animation: reduced ? 'none' : 'rmPulseRing 1.5s ease-out infinite', animationDelay: `${i*0.12}s` }} />
                </div>
              ))}
            </div>
            <div className="font-display" style={{ fontSize: 27, fontWeight: 600, letterSpacing: 0.3 }}>กำลังจับคู่ความอยาก…</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, opacity: 0.85, marginTop: 4 }}>ทุกคนเล็งร้านเดียวกันแล้ว 👀</div>
          </div>
        ) : (
          <div style={{ animation: reduced ? 'none' : 'rmBounceIn .6s cubic-bezier(.34,1.56,.5,1)' }}>
            <div style={{ fontSize: 50, marginBottom: 2 }}>🎉</div>
            <div className="font-display" style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, textShadow: '0 4px 0 rgba(0,0,0,0.12)' }}>แมตช์แล้ว!</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 15.5, opacity: 0.92, marginTop: 8 }}>ทุกคนชอบร้านนี้ตรงกัน 🙌</div>
          </div>
        )}
      </div>

      {/* ── slot reel / winner card ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 18px', position: 'relative', zIndex: 5, minHeight: 0 }}>
        {phase !== 'revealed' ? (
          // SLOT MACHINE WINDOW
          <div style={{
            width: '100%', height: ITEM_H, borderRadius: 26, background: '#fff',
            boxShadow: '0 22px 50px rgba(43,27,23,0.34), inset 0 0 0 4px rgba(255,255,255,0.6)',
            overflow: 'hidden', position: 'relative',
          }}>
            <div style={{ transform: `translateY(${-offset}px)`, transition: trans }}>
              {seq.map((r, i) => <ReelItem key={i} r={r} winner={r.id === winner.id} />)}
            </div>
            {/* center highlight + edge fades */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 28px 26px -22px rgba(255,255,255,0.95), inset 0 -28px 26px -22px rgba(255,255,255,0.95)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: 'linear-gradient(90deg, transparent, rgba(255,90,60,0.5), transparent)', transform: 'translateY(-1px)' }} />
          </div>
        ) : (
          // WINNER CARD
          <div style={{ width: '100%', animation: reduced ? 'none' : 'rmDropIn .5s cubic-bezier(.34,1.5,.5,1) .1s both' }}>
            <div style={{ borderRadius: 28, overflow: 'hidden', background: '#fff', boxShadow: '0 24px 54px rgba(43,27,23,0.4)' }}>
              <div style={{ height: 188, position: 'relative' }}>
                <FoodPhoto r={winner} big label={false} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(43,27,23,0.78))' }} />
                <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(255,200,69,0.96)', color: 'var(--ink)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, padding: '5px 12px', borderRadius: 999 }}>🏆 ร้านที่ชนะ</div>
                <div style={{ position: 'absolute', left: 18, right: 18, bottom: 14, color: '#fff' }}>
                  <div className="font-display" style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1 }}>{winner.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 6, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14 }}>
                    <Stars value={winner.rating} size={14} color="#FFC845" /> {winner.rating}
                    <span style={{ opacity: 0.7 }}>·</span> {priceStr(winner.price)}
                    <span style={{ opacity: 0.7 }}>·</span> {winner.dist} กม.
                  </div>
                </div>
              </div>
              {/* everyone liked row */}
              <div style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex' }}>
                  {players.map((p, i) => <div key={p.id} style={{ marginLeft: i ? -9 : 0 }}><Avatar p={p} size={32} /></div>)}
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: 'var(--ink-2)' }}>ทุกคนปัด “ชอบ” ❤️</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── actions ── */}
      <div style={{ flexShrink: 0, padding: '6px 22px max(20px, env(safe-area-inset-bottom))', position: 'relative', zIndex: 5 }}>
        {phase === 'revealed' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, animation: reduced ? 'none' : 'rmRise .5s ease .25s both' }}>
            <PrimaryButton color="linear-gradient(180deg,#fff,#FFF1E8)" style={{ color: 'var(--cta)' }} onClick={onOpen}>ดูรายละเอียดร้าน →</PrimaryButton>
            <button className="rm-tap" onClick={onAgain} style={{ background: 'transparent', border: 'none', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, cursor: 'pointer', padding: 8, opacity: 0.92 }}>หาร้านอื่นต่อ</button>
          </div>
        ) : (
          <div style={{ height: 92 }} />
        )}
      </div>
    </Screen>
  );
}

Object.assign(window, { MatchScreen });
