// app.jsx — flow state machine + mount

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

const FLOW = [
  ['home', 'Home'], ['create', 'สร้างห้อง'], ['join', 'เข้าร่วม'],
  ['lobby', 'Lobby'], ['swipe', 'ปัดการ์ด'], ['match', 'แมตช์!'],
  ['detail', 'รายละเอียด'], ['nomatch', 'No-Match'],
];
const DARK_BG = { match: true, detail: true };

const THEMES = {
  'Coral':  { coral:'#FF5A3C', soft:'#FF7A5E', cta:'#E63946', deep:'#D7263D' },
  'Tomato': { coral:'#FF4D2E', soft:'#FF6A4A', cta:'#E03A2A', deep:'#C81F12' },
  'Amber':  { coral:'#FF7A1A', soft:'#FF9A45', cta:'#F26419', deep:'#D9480F' },
};
const DISPLAY_FONTS = { 'Mitr': "'Mitr', sans-serif", 'Baloo 2': "'Baloo 2', sans-serif", 'Chonburi': "'Chonburi', serif" };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "Coral",
  "displayFont": "Mitr",
  "fullMotion": true,
  "confetti": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const sysReduced = useReducedMotion();
  const reduced = sysReduced || !t.fullMotion;

  useEffectA(() => {
    const th = THEMES[t.theme] || THEMES.Coral;
    const r = document.documentElement.style;
    r.setProperty('--coral', th.coral);
    r.setProperty('--coral-soft', th.soft);
    r.setProperty('--cta', th.cta);
    r.setProperty('--cta-deep', th.deep);
    r.setProperty('--font-display', DISPLAY_FONTS[t.displayFont] || DISPLAY_FONTS.Mitr);
  }, [t.theme, t.displayFont]);

  const [screen, setScreen] = useStateA('home');
  const [matched, setMatched] = useStateA(null);
  const [candidates, setCandidates] = useStateA([]);
  const [likedRanked, setLikedRanked] = useStateA([]);
  const [deckSeed, setDeckSeed] = useStateA(0);   // bump to reshuffle / remount swipe

  // deck: rotate based on seed so "เริ่มรอบใหม่" feels fresh
  const deck = React.useMemo(() => {
    const arr = RESTAURANTS.slice();
    for (let i = 0; i < deckSeed % arr.length; i++) arr.push(arr.shift());
    return arr;
  }, [deckSeed]);

  function go(s) { setScreen(s); }

  function handleMatch(restaurant, liked) {
    setMatched(restaurant);
    setCandidates(liked && liked.length ? liked : [restaurant]);
    go('match');
  }
  function handleNoMatch(liked) {
    const base = (liked && liked.length ? liked : deck.slice(0, 4));
    const ranked = base.slice(0, 4).map((r, i) => ({
      r, likes: Math.max(1, PLAYERS.length - 1 - i),
    }));
    setLikedRanked(ranked);
    go('nomatch');
  }
  function restart() { setDeckSeed(s => s + 1); setMatched(null); go('swipe'); }

  // keyboard arrows jump the flow (review convenience)
  useEffectA(() => {
    function onKey(e) {
      const i = FLOW.findIndex(f => f[0] === screen);
      if (e.key === 'ArrowRight' && i < FLOW.length - 1) go(FLOW[i+1][0]);
      if (e.key === 'ArrowLeft' && i > 0) go(FLOW[i-1][0]);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen]);

  let view;
  if (screen === 'home') view = <HomeScreen reduced={reduced} onCreate={() => go('create')} onJoin={() => go('join')} />;
  else if (screen === 'create') view = <CreateScreen onBack={() => go('home')} onCreate={() => go('lobby')} />;
  else if (screen === 'join') view = <JoinScreen onBack={() => go('home')} onJoin={() => go('lobby')} />;
  else if (screen === 'lobby') view = <LobbyScreen players={PLAYERS} reduced={reduced} onStart={() => go('swipe')} />;
  else if (screen === 'swipe') view = <SwipeScreen key={deckSeed} deck={deck} players={PLAYERS} reduced={reduced} onMatch={handleMatch} onNoMatch={handleNoMatch} />;
  else if (screen === 'match') view = <MatchScreen winner={matched || deck[4]} candidates={candidates} players={PLAYERS} reduced={reduced} confetti={t.confetti} onOpen={() => go('detail')} onAgain={restart} />;
  else if (screen === 'detail') view = <DetailScreen r={matched || deck[4]} players={PLAYERS} onBack={() => go('match')} onAgain={restart} />;
  else if (screen === 'nomatch') view = <NoMatchScreen likedRanked={likedRanked.length ? likedRanked : deck.slice(0,4).map((r,i)=>({r,likes:Math.max(1,PLAYERS.length-1-i)}))} players={PLAYERS} reduced={reduced} onExpand={restart} onRestart={() => go('home')} onPick={(r) => { setMatched(r); go('detail'); }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      <IOSDevice dark={!!DARK_BG[screen]}>
        <div key={screen} style={{ position: 'relative', height: '100%', animation: reduced ? 'rmFadeOnly .2s ease' : 'rmScreenIn .4s cubic-bezier(.4,0,.2,1)' }}>
          {view}
        </div>
      </IOSDevice>

      {/* review flow-jumper (outside device) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', maxWidth: 440 }}>
        {FLOW.map(([s, label], i) => (
          <button key={s} onClick={() => go(s)}
            style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5,
              padding: '6px 13px', borderRadius: 999,
              background: screen === s ? 'var(--cta)' : 'rgba(255,255,255,0.14)',
              color: screen === s ? '#fff' : 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(6px)', transition: 'all .15s' }}>
            <span style={{ opacity: 0.6, marginRight: 5 }}>{i+1}</span>{label}
          </button>
        ))}
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>← → เปลี่ยนหน้าได้ · ปัดการ์ดด้วยเมาส์/นิ้ว</div>

      <TweaksPanel>
        <TweakSection label="ธีม / Theme" />
        <TweakRadio label="โทนสีหลัก" value={t.theme} options={['Coral','Tomato','Amber']} onChange={(v) => setTweak('theme', v)} />
        <TweakSelect label="ฟอนต์หัวข้อ" value={t.displayFont} options={['Mitr','Baloo 2','Chonburi']} onChange={(v) => setTweak('displayFont', v)} />
        <TweakSection label="โมชั่น / Motion" />
        <TweakToggle label="แอนิเมชั่นเต็มที่" value={t.fullMotion} onChange={(v) => setTweak('fullMotion', v)} />
        <TweakToggle label="คอนเฟตตีตอนแมตช์" value={t.confetti} onChange={(v) => setTweak('confetti', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
