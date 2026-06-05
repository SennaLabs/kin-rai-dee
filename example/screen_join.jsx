// screen_join.jsx — Screen 3: Join Room

const { useState: useStateJ, useRef: useRefJ } = React;

function JoinScreen({ onBack, onJoin }) {
  const [code, setCode] = useStateJ('');
  const [name, setName] = useStateJ('');
  const [avatar, setAvatar] = useStateJ('🐰');
  const inputRef = useRefJ(null);
  const ready = code.length === 4 && name.trim().length > 0;

  return (
    <Screen bg="var(--cream-2)">
      <BackHeader title="เข้าร่วมห้อง" onBack={onBack} />
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 16px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* OTP code */}
        <div>
          <label className="font-display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>โค้ดห้อง 4 หลัก</label>
          <div style={{ position: 'relative', marginTop: 10 }}>
            <input ref={inputRef} value={code} inputMode="numeric" maxLength={4}
              aria-label="โค้ดห้อง 4 หลัก"
              onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,4))}
              style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }} onClick={() => inputRef.current && inputRef.current.focus()}>
              {[0,1,2,3].map(i => {
                const filled = i < code.length;
                const active = i === code.length;
                return (
                  <div key={i} style={{
                    width: 62, height: 74, borderRadius: 18, background: '#fff',
                    border: active ? '3px solid var(--coral)' : filled ? '2px solid var(--coral)' : '2px solid var(--line-strong)',
                    boxShadow: filled ? '0 8px 18px rgba(255,90,60,0.18)' : 'var(--sh-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 34, color: 'var(--ink)',
                    transition: 'all .15s',
                  }}>
                    <span style={{ animation: filled ? 'rmPop .3s cubic-bezier(.34,1.7,.5,1)' : 'none' }}>{code[i] || ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--ink-3)', marginTop: 10 }}>ขอโค้ดจากเพื่อนที่สร้างห้อง · ลองพิมพ์ <b style={{color:'var(--cta)'}}>เลขอะไรก็ได้</b></p>
        </div>

        {/* nickname */}
        <div>
          <label className="font-display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>ชื่อเล่น</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="พิมพ์ชื่อเล่น…" maxLength={12}
            className="rm-focusable"
            style={{ width: '100%', marginTop: 10, boxSizing: 'border-box', height: 54, borderRadius: 16, border: '2px solid var(--line-strong)', background: '#fff', padding: '0 16px', fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--ink)', outline: 'none' }} />
        </div>

        {/* avatar */}
        <div>
          <label className="font-display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>เลือก avatar</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginTop: 10 }}>
            {AVATAR_CHOICES.map(a => (
              <button key={a} className="rm-tap" aria-label={`เลือก avatar ${a}`} aria-pressed={avatar===a} onClick={() => { setAvatar(a); buzz(8); }}
                style={{ aspectRatio: '1', borderRadius: 14, cursor: 'pointer', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: avatar===a ? '2.5px solid var(--coral)' : '2px solid var(--line)',
                  background: avatar===a ? 'rgba(255,90,60,0.1)' : '#fff',
                  transform: avatar===a ? 'scale(1.05)' : 'scale(1)', transition: 'all .15s' }}>{a}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: '12px 24px max(20px, env(safe-area-inset-bottom))' }}>
        <PrimaryButton disabled={!ready} onClick={() => onJoin({ name: name.trim(), avatar })}>เข้าร่วม</PrimaryButton>
      </div>
    </Screen>
  );
}

Object.assign(window, { JoinScreen });
