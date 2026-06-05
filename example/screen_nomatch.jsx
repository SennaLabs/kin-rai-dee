// screen_nomatch.jsx — Screen 8: No-Match / Empty state

function NoMatchScreen({ likedRanked, players, onExpand, onRestart, onPick, reduced }) {
  // likedRanked: [{r, likes}] sorted desc
  return (
    <Screen bg="var(--cream-2)">
      <div style={{ flexShrink: 0, padding: '60px 24px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 54, animation: reduced ? 'none' : 'rmFloat 3.4s ease-in-out infinite' }}>😅</div>
        <h1 className="font-display" style={{ margin: '12px 0 0', fontSize: 26, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>ยังไม่เจอที่ถูกใจทุกคน</h1>
        <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.45 }}>ไม่เป็นไรน้า~ นี่คือร้านที่ <b>ใกล้แมตช์ที่สุด</b> ลองโหวตเพิ่มได้เลย</p>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <span className="font-display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>คนชอบเยอะสุด</span>
          <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {likedRanked.map(({ r, likes }, i) => {
            const near = likes >= players.length - 1; // missing just 1 vote
            return (
              <button key={r.id} className="rm-tap" onClick={() => onPick(r)}
                style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#fff', borderRadius: 20, padding: 12, boxShadow: 'var(--sh-card)', border: near ? '2px solid var(--amber)' : '2px solid transparent', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', flexShrink: 0 }}><FoodPhoto r={r} label={false} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-display" style={{ fontSize: 16.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3, fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>
                    <Stars value={r.rating} size={12} /> {r.rating} · {priceStr(r.price)} · {r.dist} กม.
                  </div>
                  {/* like avatars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 7 }}>
                    <div style={{ display: 'flex' }}>
                      {players.slice(0, likes).map((p,j) => <div key={p.id} style={{ marginLeft: j?-8:0 }}><Avatar p={p} size={22} /></div>)}
                    </div>
                    {near
                      ? <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 700, color: '#B8860B', background: 'rgba(255,182,39,0.18)', padding: '2px 9px', borderRadius: 999 }}>เกือบแมตช์! ขาดอีก 1 โหวต</span>
                      : <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{likes}/{players.length} ชอบ</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: '12px 24px max(20px, env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PrimaryButton onClick={onExpand}>ขยายรัศมี · โหลดร้านเพิ่ม 🔄</PrimaryButton>
        <button className="rm-tap" onClick={onRestart} style={{ background: 'transparent', border: 'none', color: 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14.5, cursor: 'pointer', padding: 6 }}>เริ่มรอบใหม่ทั้งหมด</button>
      </div>
    </Screen>
  );
}

Object.assign(window, { NoMatchScreen });
