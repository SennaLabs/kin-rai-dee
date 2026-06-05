// ui.jsx — shared primitives & motion helpers

const { useState, useEffect, useRef, useCallback } = React;

// respect prefers-reduced-motion
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fn = () => setReduced(mq.matches);
    mq.addEventListener && mq.addEventListener('change', fn);
    return () => mq.removeEventListener && mq.removeEventListener('change', fn);
  }, []);
  return reduced;
}

// tiny haptic helper (no-op where unsupported)
function buzz(ms = 12) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }

// ── Buttons ───────────────────────────────────────────────
function PrimaryButton({ children, onClick, disabled, color, style, ariaLabel }) {
  const ref = useRef(null);
  const bg = color || 'linear-gradient(180deg, var(--cta) 0%, var(--cta-deep) 100%)';
  function ripple(e) {
    if (disabled) return;
    buzz(14);
    const el = ref.current; if (!el) return;
    const r = document.createElement('span');
    const rect = el.getBoundingClientRect();
    const d = Math.max(rect.width, rect.height);
    r.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;width:${d}px;height:${d}px;left:${e.clientX-rect.left-d/2}px;top:${e.clientY-rect.top-d/2}px;background:rgba(255,255,255,0.45);transform:scale(0);opacity:0.7;transition:transform .5s ease,opacity .6s ease;`;
    el.appendChild(r);
    requestAnimationFrame(() => { r.style.transform = 'scale(1)'; r.style.opacity = '0'; });
    setTimeout(() => r.remove(), 600);
  }
  return (
    <button ref={ref} className="rm-btn rm-tap" aria-label={ariaLabel}
      onClick={(e) => { ripple(e); !disabled && onClick && onClick(e); }}
      disabled={disabled}
      style={{
        position: 'relative', overflow: 'hidden', border: 'none',
        width: '100%', minHeight: 58, borderRadius: 'var(--r-pill)',
        background: disabled ? '#E7D5CB' : bg,
        color: disabled ? '#B49A8E' : '#fff',
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19,
        boxShadow: disabled ? 'none' : 'var(--sh-btn)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'transform .12s cubic-bezier(.34,1.56,.64,1), filter .15s',
        ...style,
      }}
      onPointerDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.955)'; }}
      onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >{children}</button>
  );
}

function SecondaryButton({ children, onClick, style, ariaLabel }) {
  return (
    <button className="rm-btn rm-tap" aria-label={ariaLabel} onClick={(e) => { buzz(10); onClick && onClick(e); }}
      style={{
        width: '100%', minHeight: 56, borderRadius: 'var(--r-pill)',
        background: 'rgba(255,255,255,0.65)', color: 'var(--cta)',
        border: '2px solid var(--coral)', fontFamily: 'var(--font-display)',
        fontWeight: 600, fontSize: 18, cursor: 'pointer',
        transition: 'transform .12s cubic-bezier(.34,1.56,.64,1)',
        ...style,
      }}
      onPointerDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
      onPointerUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      onPointerLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >{children}</button>
  );
}

// round action button (like / pass) — min 64px, label + icon
function RoundButton({ kind, onClick, size = 66, big }) {
  const like = kind === 'like';
  return (
    <button className="rm-btn rm-tap" onClick={(e) => { buzz(16); onClick && onClick(e); }}
      aria-label={like ? 'ชอบร้านนี้' : 'ผ่านร้านนี้'}
      style={{
        width: big ? 74 : size, height: big ? 74 : size, borderRadius: '50%',
        border: 'none', cursor: 'pointer', flexShrink: 0,
        background: like ? 'linear-gradient(180deg,#FF6B4A,#E63946)' : '#FFFFFF',
        color: like ? '#fff' : 'var(--pass)',
        boxShadow: like ? '0 10px 22px rgba(230,57,70,0.36)' : '0 8px 20px rgba(43,27,23,0.16)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform .14s cubic-bezier(.34,1.7,.6,1)',
        fontSize: big ? 32 : 28,
      }}
      onPointerDown={(e) => e.currentTarget.style.transform = 'scale(0.88)'}
      onPointerUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      onPointerLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {like ? (
        <svg width={big?34:30} height={big?34:30} viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2 5 5.3 5c2 0 3.4 1.1 4.2 2.3l.5.8.5-.8C11.3 6.1 12.7 5 14.7 5 18 5 19.6 8.4 18 11.7 15.5 16.4 12 21 12 21z"/></svg>
      ) : (
        <svg width={big?32:28} height={big?32:28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      )}
    </button>
  );
}

// ── Chips ─────────────────────────────────────────────────
function Chip({ children, active, onClick, style }) {
  return (
    <button className="rm-tap" onClick={onClick} aria-pressed={!!active}
      style={{
        padding: '9px 15px', borderRadius: 'var(--r-pill)', cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
        border: active ? '2px solid var(--coral)' : '2px solid var(--line-strong)',
        background: active ? 'var(--coral)' : '#fff',
        color: active ? '#fff' : 'var(--ink-2)',
        transition: 'all .15s', whiteSpace: 'nowrap',
        ...style,
      }}>{children}</button>
  );
}

// ── Stars ─────────────────────────────────────────────────
function Stars({ value, size = 14, color = 'var(--amber)' }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, verticalAlign: 'middle' }} aria-hidden="true">
      {[0,1,2,3,4].map(i => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
            <Star size={size} color="rgba(43,27,23,0.15)" />
            <span style={{ position: 'absolute', inset: 0, width: `${fill*100}%`, overflow: 'hidden' }}>
              <Star size={size} color={color} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
function Star({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/>
    </svg>
  );
}

// ── Restaurant photo (placeholder) ────────────────────────
function FoodPhoto({ r, style, label = true, big }) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: `linear-gradient(150deg, ${r.g[0]}, ${r.g[1]})`,
      overflow: 'hidden', ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.5,
        backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0 14px, rgba(255,255,255,0) 14px 28px)',
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)',
        fontSize: big ? 96 : 72, filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.22))',
      }}>{r.emoji}</div>
      {label && (
        <div style={{
          position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 10, letterSpacing: 0.5,
          color: 'rgba(255,255,255,0.82)', textTransform: 'uppercase',
          background: 'rgba(43,27,23,0.22)', padding: '3px 8px', borderRadius: 6,
          whiteSpace: 'nowrap',
        }}>photo · {r.cuisine}</div>
      )}
    </div>
  );
}

// ── Avatar bubble + row with presence ─────────────────────
function Avatar({ p, size = 40, dim, ring, check, joinPop }) {
  return (
    <div style={{
      position: 'relative', width: size, height: size, flexShrink: 0,
      animation: joinPop ? 'rmPop .5s cubic-bezier(.34,1.7,.5,1)' : undefined,
    }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: p.me ? 'linear-gradient(150deg,#FFE0B2,#FFC845)' : '#fff',
        border: ring ? '2.5px solid var(--coral)' : '2px solid rgba(255,255,255,0.9)',
        boxShadow: '0 3px 8px rgba(43,27,23,0.14)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.52, opacity: dim ? 0.42 : 1, transition: 'opacity .3s',
      }}>{p.emoji}</div>
      {/* presence dot */}
      <span style={{
        position: 'absolute', right: -1, bottom: -1, width: size*0.28, height: size*0.28,
        minWidth: 10, minHeight: 10, borderRadius: '50%',
        background: 'var(--good)', border: '2px solid var(--cream)',
      }} />
      {check && (
        <span style={{
          position: 'absolute', right: -4, top: -4, width: 18, height: 18, borderRadius: '50%',
          background: 'var(--good)', border: '2px solid #fff', display: 'flex',
          alignItems: 'center', justifyContent: 'center', animation: 'rmPop .4s ease',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>
        </span>
      )}
    </div>
  );
}

function ProgressBar({ value, max, color = 'var(--coral)' }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ height: 7, borderRadius: 999, background: 'rgba(43,27,23,0.10)', overflow: 'hidden', width: '100%' }}
      role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: 'width .5s cubic-bezier(.4,0,.2,1)' }} />
    </div>
  );
}

// ── Confetti burst (canvas) ───────────────────────────────
function Confetti({ fire, reduced }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!fire || reduced) return;
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    const colors = ['#FF5A3C','#FFB627','#FFC845','#E63946','#FF7A5E','#1E9E6A','#FF4D2E'];
    const N = 130;
    const parts = Array.from({ length: N }, () => {
      const ang = Math.random() * Math.PI * 2;
      const sp = 6 + Math.random() * 16;
      return {
        x: W/2, y: H*0.42,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 8,
        g: 0.28 + Math.random()*0.2,
        s: 8 + Math.random()*12, r: Math.random()*Math.PI,
        vr: (Math.random()-0.5)*0.4,
        c: colors[(Math.random()*colors.length)|0],
        shape: Math.random() > 0.5 ? 'rect' : 'circ',
        life: 1,
      };
    });
    let raf, t = 0;
    function frame() {
      t++;
      ctx.clearRect(0,0,W,H);
      parts.forEach(p => {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        p.vx *= 0.99;
        if (t > 60) p.life -= 0.012;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        if (p.shape === 'rect') ctx.fillRect(-p.s/2, -p.s/3, p.s, p.s*0.66);
        else { ctx.beginPath(); ctx.arc(0,0,p.s/2,0,Math.PI*2); ctx.fill(); }
        ctx.restore();
      });
      if (t < 170) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0,0,W,H);
    }
    frame();
    return () => cancelAnimationFrame(raf);
  }, [fire, reduced]);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 40 }} />;
}

// ── Screen shell: warm full-bleed bg + safe-area aware ─────
function Screen({ children, bg, dark, style }) {
  return (
    <div style={{
      position: 'relative', height: '100%', display: 'flex', flexDirection: 'column',
      background: bg || 'var(--cream)', color: 'var(--ink)',
      fontFamily: 'var(--font-body)', overflow: 'hidden',
      ...style,
    }}>{children}</div>
  );
}

Object.assign(window, {
  useReducedMotion, buzz,
  PrimaryButton, SecondaryButton, RoundButton, Chip, Stars, Star,
  FoodPhoto, Avatar, ProgressBar, Confetti, Screen,
});
