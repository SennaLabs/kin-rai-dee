// screen_create.jsx — Screen 2: Create Room

const { useState: useStateC } = React;

function BackHeader({ title, onBack, light }) {
  const c = light ? '#fff' : 'var(--ink)';
  return (
    <div style={{ flexShrink: 0, padding: '50px 16px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
      <button className="rm-tap" aria-label="ย้อนกลับ" onClick={onBack}
        style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', background: light ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)', boxShadow: '0 4px 12px rgba(43,27,23,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
      </button>
      <h2 className="font-display" style={{ margin: 0, fontSize: 22, fontWeight: 600, color: c }}>{title}</h2>
    </div>
  );
}

function SettingCard({ title, children, hint }) {
  return (
    <div style={{ background: '#fff', borderRadius: 22, padding: '16px 16px', boxShadow: 'var(--sh-card)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="font-display" style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{title}</span>
        {hint && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function CreateScreen({ onBack, onCreate }) {
  const [radius, setRadius] = useStateC(2);
  const [price, setPrice] = useStateC([1,2]);
  const [cuisines, setCuisines] = useStateC(['อีสาน','ญี่ปุ่น']);
  const [openNow, setOpenNow] = useStateC(true);
  const [loc, setLoc] = useStateC('current');

  const togglePrice = (n) => setPrice(p => p.includes(n) ? p.filter(x=>x!==n) : [...p, n]);
  const toggleCuisine = (c) => setCuisines(p => p.includes(c) ? p.filter(x=>x!==c) : [...p, c]);

  return (
    <Screen bg="var(--cream-2)">
      <BackHeader title="สร้างห้อง" onBack={onBack} />
      <div style={{ flex: 1, overflow: 'auto', padding: '6px 18px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* location */}
        <SettingCard title="ตำแหน่ง">
          <button className="rm-tap" onClick={() => setLoc('current')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, border: loc==='current' ? '2px solid var(--coral)' : '2px solid var(--line)', background: loc==='current' ? 'rgba(255,90,60,0.06)' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(150deg,#FF7A5E,#E63946)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📍</div>
            <div style={{ flex: 1 }}>
              <div className="font-display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>ใช้ตำแหน่งปัจจุบัน</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)' }}>อารีย์ · พญาไท กรุงเทพฯ</div>
            </div>
            {loc==='current' && <Check />}
          </button>
          <button className="rm-tap" onClick={() => setLoc('pin')} style={{ width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, border: loc==='pin' ? '2px solid var(--coral)' : '2px solid var(--line)', background: loc==='pin' ? 'rgba(255,90,60,0.06)' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--cream-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🔎</div>
            <div style={{ flex: 1 }}>
              <div className="font-display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>พิมพ์ค้นหา / ปักหมุด</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)' }}>เลือกย่านที่อยากกิน</div>
            </div>
            {loc==='pin' && <Check />}
          </button>
        </SettingCard>

        {/* radius */}
        <SettingCard title="รัศมีค้นหา" hint={`${radius} กม.`}>
          <input type="range" min="0.5" max="10" step="0.5" value={radius} onChange={e => setRadius(+e.target.value)}
            className="rm-focusable" aria-label="รัศมีค้นหา (กิโลเมตร)"
            style={{ width: '100%', accentColor: 'var(--coral)', height: 28 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-3)' }}>
            <span>ใกล้ๆ</span><span>ไกลหน่อย</span>
          </div>
        </SettingCard>

        {/* price */}
        <SettingCard title="ช่วงราคา">
          <div style={{ display: 'flex', gap: 8 }}>
            {[1,2,3,4].map(n => (
              <Chip key={n} active={price.includes(n)} onClick={() => togglePrice(n)} style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: 15 }}>{priceStr(n)}</Chip>
            ))}
          </div>
        </SettingCard>

        {/* cuisines */}
        <SettingCard title="ประเภทอาหาร" hint={`${cuisines.length} อย่าง`}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CUISINES.map(c => (
              <Chip key={c} active={cuisines.includes(c)} onClick={() => toggleCuisine(c)}>{c}</Chip>
            ))}
          </div>
        </SettingCard>

        {/* open now toggle */}
        <div style={{ background: '#fff', borderRadius: 22, padding: '14px 16px', boxShadow: 'var(--sh-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="font-display" style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>เปิดอยู่ตอนนี้</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)' }}>โชว์เฉพาะร้านที่เปิดอยู่</div>
          </div>
          <Toggle on={openNow} onChange={() => setOpenNow(v => !v)} />
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: '12px 24px max(20px, env(safe-area-inset-bottom))' }}>
        <PrimaryButton onClick={onCreate}>สร้างห้อง 🎉</PrimaryButton>
      </div>
    </Screen>
  );
}

function Check() {
  return (
    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>
    </span>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button role="switch" aria-checked={on} onClick={onChange} className="rm-tap"
      style={{ width: 54, height: 32, borderRadius: 999, border: 'none', cursor: 'pointer', background: on ? 'var(--good)' : '#D8C9C0', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 25 : 3, width: 26, height: 26, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', transition: 'left .2s cubic-bezier(.34,1.5,.5,1)' }} />
    </button>
  );
}

Object.assign(window, { CreateScreen, BackHeader, Toggle, Check, SettingCard });
