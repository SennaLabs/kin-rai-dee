// screen_home.jsx — Screen 1: Home / Landing

function HomeScreen({ onCreate, onJoin, reduced }) {
  const steps = [
    { e: '🏠', t: 'สร้างห้อง', d: 'ตั้งค่ารัศมี ราคา ประเภท' },
    { e: '🔗', t: 'แชร์โค้ด', d: 'ชวนเพื่อนเข้าด้วยโค้ด 4 หลัก' },
    { e: '🔥', t: 'ปัดพร้อมกัน', d: 'ชอบตรงกัน = แมตช์!' },
  ];
  return (
    <Screen bg="linear-gradient(180deg, #FFF4EC 0%, #FFE4D3 100%)">
      {/* floating food emojis */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[['🍜','8%','12%',0],['🍕','78%','10%',0.6],['🌮','12%','30%',1.2],['🍧','82%','34%',1.8],['🍗','70%','64%',0.9]].map(([e,l,t,d],i) => (
          <span key={i} style={{ position: 'absolute', left: l, top: t, fontSize: 34, opacity: 0.5, animation: reduced ? 'none' : `rmFloat ${4+i*0.4}s ease-in-out ${d}s infinite` }}>{e}</span>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', position: 'relative', zIndex: 2 }}>
        {/* mascot */}
        <div style={{
          width: 116, height: 116, borderRadius: 34, background: 'linear-gradient(150deg,#FF7A5E,#E63946)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 62,
          boxShadow: '0 18px 38px rgba(230,57,70,0.4)', marginBottom: 22,
          animation: reduced ? 'none' : 'rmFloat 3.6s ease-in-out infinite',
        }}>🍽️</div>

        <h1 className="font-display" style={{ margin: 0, fontSize: 40, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05, textAlign: 'center' }}>
          Restaurant <span style={{ color: 'var(--cta)' }}>Match</span>
        </h1>
        <p style={{ margin: '14px 0 0', fontFamily: 'var(--font-body)', fontSize: 16.5, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.45, maxWidth: 300 }}>
          เลิกเถียงว่าจะกินอะไร —<br />ปัดหาร้านพร้อมกัน แล้วให้ดวงตัดสิน 🎰
        </p>
      </div>

      {/* how it works */}
      <div style={{ padding: '0 24px 4px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.6)', borderRadius: 18, padding: '12px 6px' }}>
              <div style={{ fontSize: 26 }}>{s.e}</div>
              <div className="font-display" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginTop: 4 }}>{s.t}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.25 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* thumb-zone CTAs */}
      <div style={{ flexShrink: 0, padding: '16px 24px max(20px, env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 2 }}>
        <PrimaryButton onClick={onCreate}>สร้างห้อง 🎉</PrimaryButton>
        <SecondaryButton onClick={onJoin}>เข้าร่วมห้อง</SecondaryButton>
      </div>
    </Screen>
  );
}

Object.assign(window, { HomeScreen });
