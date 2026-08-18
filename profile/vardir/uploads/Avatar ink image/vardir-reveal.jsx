// vardir-reveal.jsx — Vardir animated logo reveal.
// Narrative: a spark streaks in → impact ignites assembly → ring spins together
// clockwise → the purple wedge radar-sweeps open → light pass → lockup settles.
// Reads Stage, useTime, Easing, animate, clamp from window (animations.jsx).

const { Stage, useTime, Easing, animate, clamp } = window;

// ── Brand palette (sampled from avatar-ink.png) ─────────────────────────────
const BG     = '#15181D';
const WHITE  = '#FFFFFF';
const PURPLE = '#5856E0';
const MUTED  = '#8A8FA0';

// ── Extra easings ────────────────────────────────────────────────────────────
const easeInQuart = (x) => x * x * x * x;

// ── Mark geometry: flat-top hexagon ring + purple top-right wedge ───────────
const CX = 512, CY = 512;
const pt = (angDeg, R) => {
  const a = (Math.PI / 180) * angDeg;
  return [CX + R * Math.cos(a), CY - R * Math.sin(a)];
};
function hexPts(R) {
  const out = [];
  for (let k = 0; k < 6; k++) out.push(pt(60 * k, R));
  return out;
}
const O = hexPts(178);   // outer hexagon vertices
const I = hexPts(108);   // inner hexagon vertices
const ptsStr = (pts) => pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

// 5 white ring band-segments (all sixths except the top-right, which is purple).
const BANDS = [1, 2, 3, 4, 5].map((k) => ({
  pts: [O[k], O[(k + 1) % 6], I[(k + 1) % 6], I[k]],
}));
// Purple solid wedge: center → top-right sixth (0°–60°).
const WEDGE = { pts: [[CX, CY], O[0], O[1]] };
const WEDGE_C = [(CX + O[0][0] + O[1][0]) / 3, (CY + O[0][1] + O[1][1]) / 3];

// ── Timeline (seconds) ───────────────────────────────────────────────────────
const T = {
  comet: [0.12, 0.5],
  impact: 0.5,
  segStart: 0.56, segStagger: 0.13, segDur: 0.5,
  wedge: [1.66, 2.14],
  lock: 2.1,
  sweep1: [2.2, 2.8],
  lift: [2.5, 3.08],
  letters: 2.68, letterStagger: 0.055, letterDur: 0.44,
  divider: [3.28, 3.78],
  tagline: [3.42, 3.95],
  sweep2: [5.05, 5.75],
  dur: 6.5,
};

// asymmetric pulse: fast rise, slow decay
const pulse = (t, t0, rise, fall) =>
  t < t0 ? clamp(1 + (t - t0) / rise, 0, 1) : clamp(1 - (t - t0) / fall, 0, 1);
// exponential kick (camera punch)
const kick = (t, t0, decay) => (t < t0 ? 0 : Math.exp(-(t - t0) / decay));

// ── Sub-pieces ───────────────────────────────────────────────────────────────

function HexShock({ t, t0, dur, color, maxScale }) {
  const p = clamp((t - t0) / dur, 0, 1);
  if (p <= 0 || p >= 1) return null;
  const e = Easing.easeOutCubic(p);
  const s = 0.55 + (maxScale - 0.55) * e;
  return (
    <polygon
      points={ptsStr(O)}
      fill="none"
      stroke={color}
      strokeWidth={(1 - p) * 5 + 0.4}
      opacity={(1 - p) * 0.55}
      transform={`translate(${CX} ${CY}) scale(${s.toFixed(4)}) translate(${-CX} ${-CY})`}
    />
  );
}

function Comet({ t }) {
  const [t0, t1] = T.comet;
  if (t < t0 || t > t1 + 0.06) return null;
  const dir = [Math.cos(Math.PI / 6), -Math.sin(Math.PI / 6)]; // from upper-right, along wedge bisector
  const D = 780;
  const posAt = (tt) => {
    const p = easeInQuart(clamp((tt - t0) / (t1 - t0), 0, 1));
    return [CX + dir[0] * D * (1 - p), CY + dir[1] * D * (1 - p)];
  };
  const [x, y] = posAt(t);
  const ghosts = [0.018, 0.036, 0.055, 0.075].map((dt, i) => {
    const [gx, gy] = posAt(t - dt);
    return <circle key={i} cx={gx} cy={gy} r={5 - i} fill={PURPLE} opacity={0.4 - i * 0.09} />;
  });
  const fade = t > t1 ? clamp(1 - (t - t1) / 0.06, 0, 1) : 1;
  return (
    <g opacity={fade}>
      {ghosts}
      <circle cx={x} cy={y} r={6.5} fill="#B7B6FF" />
      <circle cx={x} cy={y} r={11} fill={PURPLE} opacity={0.35} />
    </g>
  );
}

function Mark({ t }) {
  // clockwise build order from the top: band j=0 (top), then 4,3,2,1
  const segs = BANDS.map((b, j) => {
    const idx = (5 - j) % 5;
    const start = T.segStart + T.segStagger * idx;
    const p = clamp((t - start) / T.segDur, 0, 1);
    if (p <= 0) return null;
    const rot = (Easing.easeOutBack(p) - 1) * 42; // from -42° spinning clockwise into place
    const ghostRot = rot * 1.45;
    return (
      <g key={j}>
        {p < 1 && (
          <polygon points={ptsStr(b.pts)} fill={WHITE} opacity={0.28 * (1 - p)}
            transform={`rotate(${ghostRot.toFixed(3)} ${CX} ${CY})`} />
        )}
        <polygon points={ptsStr(b.pts)} fill={WHITE} opacity={clamp(p * 2.2, 0, 1)}
          transform={`rotate(${rot.toFixed(3)} ${CX} ${CY})`} />
      </g>
    );
  });

  // ── wedge: radar-sweep reveal, clockwise from the 60° edge ──
  const [w0, w1] = T.wedge;
  const wp = clamp((t - w0) / (w1 - w0), 0, 1);
  const we = Easing.easeOutBack(wp);
  const sweepAng = Math.max(60 - 68 * we, -9);
  const R = 205;
  const [ax, ay] = pt(64, R);
  const [bx, by] = pt(sweepAng, R);
  const bloom = pulse(t, T.lock + 0.04, 0.08, 0.42);
  let wedgeEl = null;
  if (wp > 0) {
    wedgeEl = (
      <g>
        <defs>
          <clipPath id="wedgeClip">
            <path d={`M ${CX} ${CY} L ${ax.toFixed(1)} ${ay.toFixed(1)} A ${R} ${R} 0 0 1 ${bx.toFixed(1)} ${by.toFixed(1)} Z`} />
          </clipPath>
        </defs>
        <g clipPath="url(#wedgeClip)">
          <polygon points={ptsStr(WEDGE.pts)} fill={PURPLE}
            style={{ filter: bloom > 0.02 ? `drop-shadow(0 0 ${(30 * bloom).toFixed(1)}px rgba(88,86,224,${(0.95 * bloom).toFixed(3)}))` : 'none' }} />
        </g>
        {wp < 1 && (() => {
          const [lx, ly] = pt(sweepAng, 186);
          return (
            <g>
              <line x1={CX} y1={CY} x2={lx} y2={ly} stroke={PURPLE} strokeWidth="9" opacity={0.3 * (1 - wp)} strokeLinecap="round" />
              <line x1={CX} y1={CY} x2={lx} y2={ly} stroke="#DEDDFF" strokeWidth="3" opacity={0.9 * (1 - wp)} strokeLinecap="round" />
            </g>
          );
        })()}
      </g>
    );
  }

  // ── ember waiting at center between impact and ignition ──
  let ember = null;
  if (t > T.impact && t < w0 + 0.14) {
    const inO = clamp((t - T.impact) / 0.12, 0, 1);
    const out = t > w0 ? clamp(1 - (t - w0) / 0.14, 0, 1) : 1;
    const r = (5.5 + Math.sin(t * 9) * 1.4) * out;
    ember = (
      <g opacity={inO * out}>
        <circle cx={CX} cy={CY} r={r * 2.6} fill={PURPLE} opacity="0.22" />
        <circle cx={CX} cy={CY} r={r} fill="#C9C8FF" />
      </g>
    );
  }

  // ── impact flash at center ──
  const fl = pulse(t, T.impact + 0.02, 0.05, 0.22);
  const flash = fl > 0.02 ? (
    <circle cx={CX} cy={CY} r={26 + 60 * (1 - fl)} fill={WHITE} opacity={fl * 0.8} />
  ) : null;

  // ── spark burst on wedge lock ──
  const sb = clamp((t - T.lock) / 0.55, 0, 1);
  const sparks = (sb > 0 && sb < 1) ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const a = (Math.PI / 180) * (i * 45 + 12);
    const d = 26 + Easing.easeOutCubic(sb) * 74;
    const [sx, sy] = [WEDGE_C[0] + Math.cos(a) * d, WEDGE_C[1] - Math.sin(a) * d];
    return <circle key={i} cx={sx} cy={sy} r={(1 - sb) * 3} fill={i % 3 ? PURPLE : '#CFCEFF'} opacity={(1 - sb) * 0.9} />;
  }) : null;

  // ── specular light sweeps across the assembled mark ──
  const sweepGroup = (t0, t1, strength) => {
    const p = clamp((t - t0) / (t1 - t0), 0, 1);
    if (p <= 0 || p >= 1) return null;
    const gx = 240 + p * 560;
    return (
      <g opacity={strength}>
        <defs>
          <linearGradient id={`sw${t0}`} gradientUnits="userSpaceOnUse"
            x1={gx - 130} y1="0" x2={gx + 130} y2="0" gradientTransform={`rotate(24 ${CX} ${CY})`}>
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {BANDS.map((b, j) => <polygon key={j} points={ptsStr(b.pts)} fill={`url(#sw${t0})`} />)}
        <polygon points={ptsStr(WEDGE.pts)} fill={`url(#sw${t0})`} />
      </g>
    );
  };

  return (
    <svg viewBox="288 288 448 448" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
      <HexShock t={t} t0={T.impact} dur={0.62} color="rgba(255,255,255,0.6)" maxScale={1.7} />
      <HexShock t={t} t0={T.lock} dur={0.72} color="rgba(88,86,224,0.8)" maxScale={2.1} />
      {segs}
      {wedgeEl}
      {sweepGroup(T.sweep1[0], T.sweep1[1], 1)}
      {sweepGroup(T.sweep2[0], T.sweep2[1], 0.45)}
      {sparks}
      {ember}
      {flash}
      <Comet t={t} />
    </svg>
  );
}

// ── Wordmark with per-letter rise + focus ────────────────────────────────────
function Wordmark({ t }) {
  return (
    <div style={{ display: 'flex', gap: '0.01em' }}>
      {'VARDIR'.split('').map((ch, i) => {
        const start = T.letters + i * T.letterStagger;
        const p = clamp((t - start) / T.letterDur, 0, 1);
        const e = Easing.easeOutExpo(p);
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: '0.08em' }}>
            <span style={{
              display: 'inline-block',
              transform: `translateY(${((1 - e) * 112).toFixed(2)}%)`,
              filter: p < 1 ? `blur(${((1 - e) * 7).toFixed(2)}px)` : 'none',
              opacity: clamp(p * 1.6, 0, 1),
            }}>{ch}</span>
          </span>
        );
      })}
    </div>
  );
}

function Scene() {
  const t = useTime();

  // lockup shift
  const markY = animate({ from: 540, to: 404, start: T.lift[0], end: T.lift[1], ease: Easing.easeInOutCubic })(t);
  const markScale = animate({ from: 1, to: 0.8, start: T.lift[0], end: T.lift[1], ease: Easing.easeInOutCubic })(t);
  const breathe = 1 + Math.sin(t * 1.15) * 0.005;

  // one continuous camera pull-back + impact punches
  const camBase = animate({ from: 1.5, to: 1, start: 0.45, end: 2.4, ease: Easing.easeInOutCubic })(t);
  const cam = camBase * (1 + 0.05 * kick(t, T.impact, 0.1) + 0.026 * kick(t, T.lock, 0.09));

  // ambient glow behind mark
  const glowIn = clamp((t - T.wedge[0]) / 0.6, 0, 1);
  const glowOpacity = glowIn * (0.32 + 0.13 * Math.sin(t * 1.25));

  // grid pulses on impact & lock
  const gridPulse = 0.9 * pulse(t, T.impact, 0.06, 0.5) + pulse(t, T.lock, 0.06, 0.55);
  // full-screen micro-flash on lock
  const screenFlash = 0.07 * pulse(t, T.lock + 0.03, 0.05, 0.2);

  const divP = Easing.easeInOutCubic(clamp((t - T.divider[0]) / (T.divider[1] - T.divider[0]), 0, 1));
  const tagP = clamp((t - T.tagline[0]) / (T.tagline[1] - T.tagline[0]), 0, 1);
  const tagE = Easing.easeOutCubic(tagP);

  const gridIn = clamp(t / 0.4, 0, 1);

  return (
    <div data-screen-label={`Vardir reveal — t=${Math.floor(t)}s`}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: BG }}>

      {/* fine dot grid, drifting; parallax slightly behind camera */}
      <div style={{
        position: 'absolute', inset: '-80px',
        backgroundImage: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        transform: `scale(${(1 + (cam - 1) * 0.35).toFixed(4)}) translate(${(Math.sin(t * 0.18) * 12).toFixed(2)}px, ${(-t * 2.6).toFixed(2)}px)`,
        transformOrigin: '960px 540px',
        opacity: gridIn * 0.9,
      }} />

      {/* concentric hex echoes behind the mark */}
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, opacity: gridIn }}>
        {[300, 400, 520].map((R, i) => (
          <polygon key={i}
            points={hexPts(R).map((p) => (p[0] + 448).toFixed(1) + ',' + (p[1] + (markY - 512) + 0).toFixed(1)).join(' ')}
            fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5"
            transform={`rotate(${(Math.sin(t * 0.1 + i) * 2).toFixed(2)} 960 ${markY})`} />
        ))}
      </svg>

      {/* purple grid pulse radiating from mark */}
      <div style={{
        position: 'absolute', left: 960, top: markY, width: 900, height: 900, marginLeft: -450, marginTop: -450,
        background: 'radial-gradient(circle, rgba(88,86,224,0.16), rgba(88,86,224,0) 60%)',
        opacity: gridPulse, pointerEvents: 'none',
      }} />

      {/* vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(120% 90% at 50% 46%, rgba(255,255,255,0.03), rgba(0,0,0,0) 55%), radial-gradient(90% 90% at 50% 60%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5))`,
      }} />

      {/* world under camera */}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${cam.toFixed(4)})`, transformOrigin: '960px 512px' }}>

        {/* ambient glow */}
        <div style={{
          position: 'absolute', left: 960, top: markY, width: 620, height: 620, marginLeft: -310, marginTop: -310,
          background: `radial-gradient(circle, rgba(88,86,224,0.5), rgba(88,86,224,0) 62%)`,
          opacity: glowOpacity, filter: 'blur(6px)', pointerEvents: 'none',
        }} />

        {/* mark + effects */}
        <div style={{
          position: 'absolute', left: 960, top: markY, width: 380, height: 380, marginLeft: -190, marginTop: -190,
          transform: `scale(${(markScale * breathe).toFixed(4)})`, transformOrigin: '50% 50%',
        }}>
          <Mark t={t} />
        </div>

        {/* wordmark */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 604,
          display: 'flex', justifyContent: 'center',
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
          fontSize: 96, letterSpacing: '0.015em', color: WHITE, lineHeight: 1,
        }}>
          <Wordmark t={t} />
        </div>

        {/* divider */}
        <div style={{ position: 'absolute', left: 960, top: 700, marginLeft: -110, width: 220, height: 2 }}>
          <div style={{
            position: 'absolute', left: '50%', top: 0, height: '100%',
            width: `${(divP * 100).toFixed(1)}%`, transform: 'translateX(-50%)',
            background: `linear-gradient(90deg, rgba(88,86,224,0), ${PURPLE}, rgba(88,86,224,0))`,
          }} />
        </div>

        {/* tagline */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 724,
          display: 'flex', justifyContent: 'center',
          fontFamily: "'JetBrains Mono', monospace", fontWeight: 400,
          fontSize: 19, color: MUTED, textTransform: 'uppercase',
          letterSpacing: `${(0.6 - 0.16 * tagE).toFixed(3)}em`, paddingLeft: '0.44em',
          opacity: tagE, transform: `translateY(${((1 - tagE) * 12).toFixed(2)}px)`,
        }}>
          Web&nbsp;&amp;&nbsp;App&nbsp;Development
        </div>
      </div>

      {/* full-screen micro flash */}
      {screenFlash > 0.004 && (
        <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: screenFlash, pointerEvents: 'none' }} />
      )}
    </div>
  );
}

function VardirReveal() {
  return (
    <Stage width={1920} height={1080} duration={T.dur} background={BG} persistKey="vardir">
      <Scene />
    </Stage>
  );
}

window.VardirReveal = VardirReveal;
