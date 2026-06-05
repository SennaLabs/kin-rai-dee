// screen_detail.jsx — Screen 7: After-Match Detail

function MiniAction({ icon, label, onClick }) {
  return (
    <button className="rm-tap" onClick={onClick} aria-label={label}
      style={{ flex: 1, border: 'none', background: '#fff', borderRadius: 18, padding: '12px 4px', cursor: 'pointer', boxShadow: 'var(--sh-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--cream-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cta)' }}>{icon}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>{label}</span>
    </button>
  );
}

function DetailScreen({ r, players, onBack, onAgain }) {
  return (
    <Screen bg="var(--cream)">
      {/* hero photo */}
      <div style={{ flexShrink: 0, height: 260, position: 'relative' }}>
        <FoodPhoto r={r} big label={false} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(43,27,23,0.3) 0%, transparent 30%, transparent 55%, var(--cream) 100%)' }} />
        <button className="rm-tap" aria-label="ย้อนกลับ" onClick={onBack}
          style={{ position: 'absolute', top: 50, left: 16, width: 42, height: 42, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.92)', boxShadow: '0 4px 12px rgba(43,27,23,0.18)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
        </button>
        <div style={{ position: 'absolute', top: 50, right: 16, background: 'rgba(255,200,69,0.96)', color: 'var(--ink)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, padding: '7px 13px', borderRadius: 999 }}>🏆 ร้านที่แมตช์</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 14px', marginTop: -8 }}>
        <h1 className="font-display" style={{ margin: 0, fontSize: 30, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.12 }}>{r.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>
            <Stars value={r.rating} size={15} /> {r.rating}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-3)' }}>({r.reviews.toLocaleString()} รีวิว)</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--cta)' }}>{priceStr(r.price)}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-3)' }}>· {r.cuisine}</span>
        </div>

        {/* everyone matched */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(30,158,106,0.1)', borderRadius: 16, padding: '10px 14px' }}>
          <div style={{ display: 'flex' }}>{players.map((p,i)=><div key={p.id} style={{marginLeft:i?-9:0}}><Avatar p={p} size={30}/></div>)}</div>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: 'var(--good)' }}>ทั้ง {players.length} คนชอบร้านนี้ ❤️</span>
        </div>

        {/* info rows */}
        <div style={{ marginTop: 16, background: '#fff', borderRadius: 20, padding: '4px 16px', boxShadow: 'var(--sh-card)' }}>
          <InfoRow icon="🕒" main={<span style={{ color: r.open ? 'var(--good)' : 'var(--cta)', fontWeight: 700 }}>{r.open ? 'เปิดอยู่ตอนนี้' : 'ปิดอยู่'}</span>} sub={`เวลาทำการ ${r.hours}`} />
          <InfoRow icon="📍" main={r.addr} sub={`ห่างจากคุณ ${r.dist} กม.`} last />
        </div>

        {/* secondary actions */}
        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <MiniAction label="โทร" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/></svg>} />
          <MiniAction label="ดูเมนู / เว็บ" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18M3 12h18M3 19h12"/></svg>} />
          <MiniAction label="แชร์" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>} />
        </div>

        {/* map placeholder */}
        <div className="rm-ph" style={{ marginTop: 14, height: 120, borderRadius: 18 }}>
          <span className="rm-ph-label">map preview · {r.addr}</span>
        </div>

        <button className="rm-tap" onClick={onAgain} style={{ width: '100%', marginTop: 14, background: 'transparent', border: 'none', color: 'var(--ink-3)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14.5, cursor: 'pointer', padding: 8 }}>↺ หาร้านอื่นต่อ / เริ่มรอบใหม่</button>
      </div>

      {/* thumb-zone main CTA */}
      <div style={{ flexShrink: 0, padding: '12px 24px max(20px, env(safe-area-inset-bottom))' }}>
        <PrimaryButton color="linear-gradient(180deg,#FF6B4A,#E63946)" onClick={() => alert('เปิด Google Maps นำทางไป ' + r.name)}>
          ไปกันเลย · นำทาง 🧭
        </PrimaryButton>
      </div>
    </Screen>
  );
}

function InfoRow({ icon, main, sub, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderBottom: last ? 'none' : '1px solid var(--line)' }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, color: 'var(--ink)', fontWeight: 500 }}>{main}</div>
        {sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)' }}>{sub}</div>}
      </div>
    </div>
  );
}

Object.assign(window, { DetailScreen });
