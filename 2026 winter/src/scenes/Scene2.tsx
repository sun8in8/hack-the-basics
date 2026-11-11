import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ease, fadeInOut } from "../anim";
import { BreathCount } from "../components/BreathCount";
import { Frost } from "../components/Frost";
import { Leaf } from "../components/Leaf";
import { BRANCH_TIPS, CROWN, OAK_BASE_Y, OAK_X, Oak } from "../components/Oak";
import { Roots } from "../components/Roots";
import { COLORS, HEIGHT, LEAF_COLORS, WIDTH, sec } from "../theme";

/* ------------------------------------------------------------------ */
/* Scene 2: "The oak who lets go".                                     */
/* Timeline in seconds. These are estimates of the voiceover; once     */
/* the real recording is in public/, move each beat onto its pauses.   */
/* ------------------------------------------------------------------ */
export const T = {
  intro: [0, 4.5], // There's an oak tree that's lived for three hundred years.
  tellYou: [6, 8.5], // And she has something to tell you.
  choosing: [9.5, 14], // "When my leaves fall in autumn, I'm not losing. I'm choosing."
  costTooMuch: [15, 18], // "Holding on through winter would cost too much."
  letGo: [18, 22], // "So I let go, gently, on purpose."
  roots: [24, 28.5], // "And I send all that energy down into my roots."
  bare: [29.5, 32], // "People think I look bare."
  alive: [32, 36], // "But I have never been more alive underneath."
  breatheIntro: [37, 40], // Breathe with me, down into your roots.
  breatheIn: [40, 43], // In… (3s)
  hold: [43, 46], // hold… (3s)
  breatheOut: [46, 49], // and let go. (3s)
  question: [51, 55.5], // What could you put down this winter, so you can grow?
  end: [58, 59], // 1s fade to cream
} as const;

export const SCENE2_DURATION = sec(59);

const S = (key: keyof typeof T) => [sec(T[key][0]), sec(T[key][1])] as const;

/* ------------------------------------------------------------------ */
/* The oak's gentle sway: everything attached to her moves with it.    */
/* ------------------------------------------------------------------ */
const swayDeg = (f: number) => Math.sin(f * 0.025) * 0.5;

const treePoint = (x: number, y: number, f: number) => {
  const a = (swayDeg(f) * Math.PI) / 180;
  const dx = x - OAK_X;
  const dy = y - OAK_BASE_Y;
  return {
    x: OAK_X + dx * Math.cos(a) - dy * Math.sin(a),
    y: OAK_BASE_Y + dx * Math.sin(a) + dy * Math.cos(a),
  };
};

/** Height of the ground surface at x (matches the soil path below). */
const groundY = (x: number) => 1318 - 24 * Math.sin((Math.PI * x) / WIDTH);

/* ------------------------------------------------------------------ */
/* Crown leaves: each one lets go at its own moment and settles at     */
/* the oak's feet.                                                     */
/* ------------------------------------------------------------------ */
type CrownLeaf = {
  x: number;
  y: number;
  rot: number;
  size: number;
  color: string;
  letGoAt: number; // frame
  fallFor: number; // frames
  land: { x: number; y: number; rot: number };
  swayAmp: number;
  swayFreq: number;
  phase: number;
};

const CROWN_LEAVES = 120;

const buildCrownLeaves = (): CrownLeaf[] => {
  const totalArea = CROWN.reduce((s, [, , r]) => s + r * r, 0);
  const leaves: CrownLeaf[] = [];
  for (let i = 0; i < CROWN_LEAVES; i++) {
    const r = (k: string) => random(`oak-leaf-${i}-${k}`);
    // pick a crown blob weighted by its area, then a point inside it
    let pick = r("blob") * totalArea;
    let blob = CROWN[0];
    for (const b of CROWN) {
      pick -= b[2] * b[2];
      blob = b;
      if (pick <= 0) break;
    }
    const a = r("a") * Math.PI * 2;
    const d = Math.sqrt(r("d")) * blob[2] * 0.88;
    const x = blob[0] + Math.cos(a) * d;
    const y = blob[1] + Math.sin(a) * d;

    let letGo: number;
    if (i < 10) {
      // "I'm choosing": one at a time
      letGo = T.choosing[0] + 1 + i * 0.35;
    } else if (i < 16) {
      // a few more as the cold comes
      letGo = T.costTooMuch[0] + 0.5 + (i - 10) * 0.45;
    } else {
      // "So I let go, gently, on purpose": a soft wave from left to right
      letGo = T.letGo[0] + 0.4 + (x / WIDTH) * 2.2 + r("wave") * 2;
    }

    const landX = Math.max(60, Math.min(WIDTH - 60, x + (r("lx") - 0.5) * 180));
    leaves.push({
      x,
      y,
      rot: r("rot") * 360,
      size: 58 + r("size") * 26,
      color: LEAF_COLORS[Math.floor(r("c") * LEAF_COLORS.length)],
      letGoAt: sec(letGo),
      fallFor: sec(3.2 + r("fall") * 1.2),
      land: {
        x: landX,
        y: groundY(landX) + r("ly") * 16,
        rot: (r("lr") > 0.5 ? 90 : -90) + (r("lrr") - 0.5) * 50,
      },
      swayAmp: 40 + r("sway") * 50,
      swayFreq: 0.03 + r("freq") * 0.02,
      phase: r("phase") * Math.PI * 2,
    });
  }
  // draw from the back (top) to the front (bottom)
  return leaves.sort((a, b) => a.y - b.y);
};

const LEAVES = buildCrownLeaves();

const crownLeafState = (leaf: CrownLeaf, f: number) => {
  if (f < leaf.letGoAt) {
    const p = treePoint(leaf.x, leaf.y, f);
    // a tiny wiggle just before she lets it go
    const wiggle = ease(f, [leaf.letGoAt - 14, leaf.letGoAt], [0, 1]);
    return { attached: true, x: p.x, y: p.y, rot: leaf.rot + swayDeg(f) + Math.sin(f * 0.5) * 8 * wiggle };
  }
  const from = treePoint(leaf.x, leaf.y, leaf.letGoAt);
  const t = ease(f, [leaf.letGoAt, leaf.letGoAt + leaf.fallFor], [0, 1]);
  const local = f - leaf.letGoAt;
  const swing = Math.sin(local * leaf.swayFreq + leaf.phase) - Math.sin(leaf.phase);
  return {
    attached: false,
    x: from.x + (leaf.land.x - from.x) * t + swing * leaf.swayAmp * Math.sin(Math.PI * t),
    y: from.y + (leaf.land.y - from.y) * t,
    rot: leaf.rot + (leaf.land.rot - leaf.rot) * t + swing * 30 * Math.sin(Math.PI * t),
  };
};

/* ------------------------------------------------------------------ */
/* Sky and hills (the oak stands on a cut-away bank of soil).          */
/* ------------------------------------------------------------------ */
const Sky: React.FC<{ dusk: number }> = ({ dusk }) => {
  const sunY = 560 + dusk * 320;
  return (
    <g>
      <defs>
        <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.cream} />
          <stop offset="70%" stopColor={COLORS.goldenLight} />
        </linearGradient>
        <linearGradient id="duskSky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.golden} />
          <stop offset="75%" stopColor={COLORS.burntOrange} />
        </linearGradient>
        <radialGradient id="sunGlow2">
          <stop offset="0%" stopColor={COLORS.cream} stopOpacity={0.9} />
          <stop offset="100%" stopColor={COLORS.cream} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#sky2)" />
      <rect width={WIDTH} height={HEIGHT} fill="url(#duskSky2)" opacity={dusk * 0.55} />
      <circle cx={830} cy={sunY} r={260} fill="url(#sunGlow2)" opacity={0.6} />
      <circle cx={830} cy={sunY} r={110} fill={COLORS.cream} opacity={0.9} />
      {/* far hills */}
      <path
        d={`M 0 1080 C 200 960 420 980 600 1050 C 760 1110 940 990 ${WIDTH} 1010 L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`}
        fill={COLORS.golden}
      />
      {/* near hills */}
      <path
        d={`M 0 1220 C 240 1140 460 1170 640 1210 C 820 1250 960 1160 ${WIDTH} 1180 L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`}
        fill={COLORS.burntOrange}
      />
    </g>
  );
};

const PEBBLES: [number, number, number, number][] = [
  [150, 1480, 22, 14], [960, 1560, 26, 16], [420, 1800, 24, 15], [690, 1500, 16, 10],
  [80, 1840, 30, 18], [1000, 1850, 22, 14], [300, 1610, 14, 9], [800, 1640, 16, 10],
];

const Soil: React.FC = () => (
  <g>
    {/* topsoil band the trunk rises out of */}
    <path d={`M 0 1318 C 300 1290 760 1290 ${WIDTH} 1318 L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`} fill={COLORS.deepRed} />
    {/* the soil underneath, where the roots live */}
    <path d={`M 0 1372 C 320 1346 760 1346 ${WIDTH} 1372 L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`} fill={COLORS.brown} />
    {PEBBLES.map(([x, y, rx, ry], i) => (
      <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={COLORS.brownDark} opacity={0.35} />
    ))}
  </g>
);

/* ------------------------------------------------------------------ */
/* The scene                                                           */
/* ------------------------------------------------------------------ */
export const Scene2: React.FC<{ withAudio?: boolean }> = ({ withAudio = false }) => {
  const f = useCurrentFrame();

  const [handle] = useState(() => delayRender("Loading Patrick Hand font"));
  useEffect(() => {
    document.fonts
      .load(`84px 'Patrick Hand'`)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);

  const [introS] = S("intro");
  const [tellS] = S("tellYou");
  const [costS] = S("costTooMuch");
  const [rootsS] = S("roots");
  const [aliveS] = S("alive");
  const [bIntroS] = S("breatheIntro");
  const [inS, inE] = S("breatheIn");
  const [holdS, holdE] = S("hold");
  const [outS, outE] = S("breatheOut");
  const [qS, qE] = S("question");
  const [endS, endE] = S("end");

  /* Light and weather */
  const dusk = ease(f, [introS, sec(24)], [0, 0.35]) + ease(f, [sec(24), sec(40)], [0, 0.35]) + ease(f, [sec(40), endS], [0, 0.1]);
  const frost = ease(f, [costS, costS + sec(2)], [0, 0.55]);
  const sceneIn = ease(f, [0, sec(1)], [0, 1]);

  /* Her face: eyes closed at first, opening to tell you something. */
  const blinkCycle = f % 100;
  const blink = blinkCycle > 94 ? Math.sin(((blinkCycle - 94) / 6) * Math.PI) : 0;
  const awake =
    ease(f, [tellS + sec(0.6), tellS + sec(1.4)], [0, 1]) -
    ease(f, [bIntroS + sec(0.5), bIntroS + sec(1.5)], [0, 1]) +
    ease(f, [outE + sec(0.5), outE + sec(1.3)], [0, 1]) -
    ease(f, [qE + sec(1), qE + sec(2)], [0, 1]);
  const eyesClosed = Math.max(1 - awake, awake > 0.99 ? blink : 0);
  const smile =
    0.7 -
    ease(f, [costS, costS + sec(1)], [0, 0.2]) +
    ease(f, [costS + sec(3), costS + sec(4)], [0, 0.2]) +
    ease(f, [aliveS, aliveS + sec(1.5)], [0, 0.3]);

  /* Crown leaves */
  let falling = 0;
  for (const leaf of LEAVES) falling += ease(f, [leaf.letGoAt, leaf.letGoAt + 40], [0, 1]);
  const fullness = 1 - falling / LEAVES.length;

  /* Energy down into the roots */
  const orbs = BRANCH_TIPS.map(([x, y], i) => {
    const s0 = rootsS + sec(0.25 * i);
    const s1 = s0 + sec(1.6);
    if (f < s0 || f > s1) return null;
    const t = ease(f, [s0, s1], [0, 1]);
    const p0 = treePoint(x, y, f);
    // quadratic curve: in through the middle of the tree, then down the trunk
    const cx = OAK_X;
    const cy = 760;
    const ex = OAK_X;
    const ey = OAK_BASE_Y + 10;
    return {
      x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * cx + t * t * ex,
      y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * cy + t * t * ey,
      o: fadeInOut(f, s0, s1, 10),
    };
  });

  const rootReveal = 0.25 + ease(f, [rootsS, rootsS + sec(1.4)], [0, 0.75]);
  const rootProgress = ease(f, [rootsS + sec(1.4), rootsS + sec(6)], [0, 1]);
  const sparkle = ease(f, [aliveS + sec(0.5), aliveS + sec(2)], [0, 1]);

  /* Breathing: in = warm light rises up the trunk and she grows a touch
     taller; hold = still; out = the light sinks back down into the roots. */
  const warmth = ease(f, [inS, inE], [0, 1]) - ease(f, [outS, outE], [0, 1]);
  const stretch = warmth;
  const ringR = ease(f, [inS, inE], [190, 330]) + ease(f, [outS, outE], [0, -140]);
  const ringOpacity = fadeInOut(f, inS - 10, outE + 10, 10);

  // the last leaf: something you could put down
  const lastLeafT = ease(f, [qS + sec(0.3), qE - sec(0.2)], [0, 1]);

  const glow =
    ease(f, [rootsS + sec(1.4), rootsS + sec(6)], [0, 0.75]) +
    ease(f, [aliveS, aliveS + sec(2)], [0, 0.25]) +
    (f > aliveS ? Math.sin((f - aliveS) * 0.06) * 0.06 * sparkle : 0) +
    ease(f, [outS + sec(1.5), outE], [0, 0.25]) -
    ease(f, [outE, outE + sec(1.5)], [0, 0.25]) +
    ease(f, [qE - sec(0.4), qE + sec(0.6)], [0, 0.2]) -
    ease(f, [qE + sec(0.6), qE + sec(2)], [0, 0.2]);

  const endFade = ease(f, [endS, endE], [0, 1]);
  // it has hung on her right branch tip all along, and lets go on the question
  const lastFrom = treePoint(840, 632, f < qS + sec(0.3) ? f : qS + sec(0.3));
  const lastLand = { x: 640, y: groundY(640) + 6 };
  const lastLeafX =
    lastFrom.x + (lastLand.x - lastFrom.x) * lastLeafT + Math.sin(f * 0.035) * 60 * Math.sin(Math.PI * lastLeafT);
  const lastLeafY = lastFrom.y + (lastLand.y - lastFrom.y) * lastLeafT;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cream }}>
      {withAudio && <Audio src={staticFile("oak-voiceover.m4a")} />}
      <AbsoluteFill style={{ opacity: sceneIn }}>
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0 }}>
          <Sky dusk={dusk} />
        </svg>

        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0 }}>
          <Soil />

          {/* breathing ring, centred where trunk meets roots */}
          {ringOpacity > 0 && (
            <circle
              cx={OAK_X}
              cy={OAK_BASE_Y}
              r={ringR}
              fill={COLORS.golden}
              fillOpacity={0.14}
              stroke={COLORS.golden}
              strokeOpacity={0.7}
              strokeWidth={12}
              opacity={ringOpacity}
            />
          )}

          <Roots reveal={rootReveal} progress={rootProgress} glow={glow} sparkle={sparkle} />

          {/* the oak, swaying ever so slightly, a touch taller on the in-breath */}
          <g
            transform={
              `rotate(${swayDeg(f)} ${OAK_X} ${OAK_BASE_Y}) ` +
              `translate(${OAK_X} ${OAK_BASE_Y}) scale(${1 - 0.01 * stretch} ${1 + 0.03 * stretch}) translate(${-OAK_X} ${-OAK_BASE_Y})`
            }
          >
            <Oak fullness={fullness} eyesClosed={eyesClosed} smile={smile} warmth={warmth} />
          </g>

          {/* leaves: still on the tree, falling, or resting at her feet */}
          {LEAVES.map((leaf, i) => {
            const s = crownLeafState(leaf, f);
            return <Leaf key={i} x={s.x} y={s.y} rotate={s.rot} size={leaf.size} color={leaf.color} />;
          })}

          {/* energy travelling down into the roots */}
          <defs>
            <filter id="orbGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation={10} />
            </filter>
          </defs>
          {orbs.map((o, i) =>
            o ? (
              <g key={i} opacity={o.o}>
                <circle cx={o.x} cy={o.y} r={34} fill={COLORS.goldenLight} opacity={0.7} filter="url(#orbGlow)" />
                <circle cx={o.x} cy={o.y} r={14} fill={COLORS.golden} />
                <circle cx={o.x - 4} cy={o.y - 4} r={5} fill={COLORS.cream} opacity={0.8} />
              </g>
            ) : null,
          )}

          {/* one last leaf drifts down: something you could put down */}
          <Leaf
            x={lastLeafX}
            y={lastLeafY}
            rotate={20 + swayDeg(f) + 70 * lastLeafT + Math.sin(f * 0.035) * 30 * Math.sin(Math.PI * lastLeafT)}
            size={70}
            color={COLORS.golden}
          />
        </svg>

        <Frost amount={frost} />

        <BreathCount start={inS} end={inE} />
        <BreathCount start={holdS} end={holdE} />
        <BreathCount start={outS} end={outE} />
      </AbsoluteFill>

      <AbsoluteFill style={{ backgroundColor: COLORS.cream, opacity: endFade }} />
    </AbsoluteFill>
  );
};

