import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { ease, fadeInOut } from "../anim";
import { Keeper, Pt } from "../components/Keeper";
import {
  Candle,
  Flame,
  Glow,
  GlowDefs,
  HEART,
  Lantern,
  Match,
  Matchbox,
  candleFlame,
  matchTip,
} from "../components/Props";
import { LAMP, SailBoat, Seascape } from "../components/Seascape";
import { COLORS, FONT_FAMILY, HEIGHT, WIDTH, sec } from "../theme";

/* ------------------------------------------------------------------ */
/* Timeline (seconds). Change these to re-time the whole scene.        */
/* Script beat in the comment; (pause) marks are held moments.         */
/* ------------------------------------------------------------------ */
export const T = {
  evening: [0, 4], // "Evening time."
  box: [4, 10], // "A woman lighthouse keeper has a single match rattling in a box."
  shake: [6, 9.5], //   the box is shaken (no audio)
  noPanic: [10, 13], // "One match. She didn't panic."
  sit: [13, 16], // "She sat down."
  breatheIntro: [16, 18], // "She breathed in for 3 seconds… and out for 3 seconds."
  breatheIn: [18, 21], // 1 2 3 in
  breatheOut: [21, 24], // 1 2 3 out
  pause: [24, 25], // (pause)
  strike: [25, 29], // "Strike the match…"
  candle: [29, 32.5], // "…and light the candle."
  cup: [32.5, 40], // "She cupped the flame of the candle and lit a lantern." (pause)
  lens: [40, 51], // "There wasn't much light. But the lens carried it far… a lost boat found its way home."
  closing: [51, 59], // "If your light feels small this November… look after the little you have."
} as const;

export const LIGHTHOUSE_DURATION = sec(60);

/* Keeper placement */
const HIP_X = 540;
const HIP_STAND = 1450;
const HIP_SIT = 1590;
const SCALE = 1.25;

/* Window */
const WIN = { x: 540, y: 600, r: 220 };
/* Props on the table */
const CANDLE_HOME = { x: 250, y: 1415 };
const LANTERN = { x: 810, y: 1420 };
const LANTERN_FLAME = { x: LANTERN.x, y: LANTERN.y - 66 };
const LANTERN_HANDLE = { x: LANTERN.x + 76, y: LANTERN.y - 120 };

const s = (t: number) => sec(t);

/** Multi-key eased track: keys are [seconds, value]. Each segment is eased. */
const track = (f: number, keys: [number, number][]) =>
  interpolate(
    f,
    keys.map((k) => s(k[0])),
    keys.map((k) => k[1]),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) },
  );

const trackP = (f: number, keys: [number, number, number][]): Pt => ({
  x: track(f, keys.map((k) => [k[0], k[1]])),
  y: track(f, keys.map((k) => [k[0], k[2]])),
});

const mixP = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const add = (a: Pt, dx: number, dy: number): Pt => ({ x: a.x + dx, y: a.y + dy });

const useFont = () => {
  const [handle] = useState(() => delayRender("Loading Patrick Hand font"));
  useEffect(() => {
    document.fonts
      .load(`84px 'Patrick Hand'`)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

export const Lighthouse: React.FC = () => {
  useFont();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ---------------- which place are we in ---------------- */
  const inside = interpolate(
    f,
    [s(3.4), s(4.2), s(40), s(40.8), s(51), s(51.8)],
    [0, 1, 1, 0, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) },
  );
  const endFade = ease(f, [s(59), s(60)], [0, 1]);

  /* ---------------- exterior: opening + lens ---------------- */
  const lensOn = f >= s(39);
  const lamp = lensOn ? ease(f, [s(40.6), s(41.6)], [0, 1]) : 0;
  const zoom = lensOn ? 1 : ease(f, [0, s(4.2)], [1, 1.08]);
  const lostX = 930 + Math.sin(f * 0.02) * 22;
  const boatT = ease(f, [s(43.5), s(50.5)], [0, 1]);
  const boat = {
    x: lostX + (700 - lostX) * boatT,
    y: 1085 + (1585 - 1085) * boatT,
    scale: 0.22 + (0.85 - 0.22) * boatT,
    facing: -1 as const,
  };
  const aim = (Math.atan2(boat.y - 60 * boat.scale - LAMP.y, boat.x - LAMP.x) * 180) / Math.PI;
  const aimOn = ease(f, [s(42), s(44.5)], [0, 1]);
  const beam = {
    opacity: ease(f, [s(41.6), s(42.6)], [0, 0.85]),
    length: ease(f, [s(42), s(44.5)], [140, 1250]),
    angle: -14 + (aim + 14) * aimOn,
  };
  const homeHeart = ease(f, [s(49.6), s(52)], [0, 1], (t) => t);

  /* ---------------- keeper ---------------- */
  const hipY = track(f, [
    [13.3, HIP_STAND],
    [15.3, HIP_SIT],
  ]);

  const shakeEnv = fadeInOut(f, s(T.shake[0]), s(T.shake[1]), 12);
  const shakeX = Math.sin(f * 0.55) * 14 * shakeEnv;
  const shakeRot = Math.sin(f * 0.55) * 9 * shakeEnv;
  const matchSlide = Math.sin(f * 0.55 - 1.3) * 16 * shakeEnv;

  // the matchbox
  const boxP = add(
    trackP(f, [
      [13.3, 540, 1230],
      [15.3, 560, 1405],
      [25.0, 560, 1405],
      [26.0, 470, 1300],
      [29.5, 470, 1300],
      [31.0, 450, 1405],
    ]),
    shakeX,
    0,
  );
  const trayOpen = track(f, [
    [26.2, 1],
    [26.8, 0],
  ]);
  const matchTaken = ease(f, [s(25.7), s(26.0)], [0, 1]);

  // the match in her right hand (foot of the match = her hand)
  const matchRot = track(f, [
    [25.8, -80],
    [26.4, -70],
    [26.8, -70],
    [27.3, -10],
    [29.0, -10],
    [30.4, -60],
  ]);
  const matchFlame =
    ease(f, [s(27.1), s(27.6)], [0, 1]) * (1 - ease(f, [s(31.4), s(31.8)], [0, 1]));
  const matchOpacity = matchTaken * (1 - ease(f, [s(31.8), s(32.2)], [0, 1]));

  // candle: base position and tilt
  const candleBase = trackP(f, [
    [33.6, CANDLE_HOME.x, CANDLE_HOME.y],
    [34.4, 250, 1395],
    [36.0, 640, 1395],
    [36.6, 649, 1406],
    [37.0, 649, 1406],
    [37.8, 630, 1415],
  ]);
  const candleRot = track(f, [
    [36.0, 0],
    [36.6, 45],
    [37.0, 45],
    [37.8, 0],
  ]);
  const cFlame = candleFlame(candleBase.x, candleBase.y, candleRot);
  const candleLit = ease(f, [s(30.5), s(31.1)], [0, 1]);
  const lanternLit = ease(f, [s(36.7), s(37.4)], [0, 1]);

  // hands
  let L = trackP(f, [
    [13.3, 465, 1242],
    [15.3, 485, 1417],
    [15.8, 485, 1417],
    [16.6, 420, 1428],
    [25.0, 420, 1428],
    [26.0, 400, 1310],
    [29.5, 400, 1310],
    [31.0, 380, 1415],
  ]);
  let R = trackP(f, [
    [13.3, 615, 1242],
    [15.3, 635, 1417],
    [15.8, 635, 1417],
    [16.6, 660, 1428],
    [25.0, 660, 1428],
    [25.8, 458, 1317],
    [26.4, 600, 1320],
    [26.8, 617, 1333],
    [27.3, 700, 1230],
    [29.0, 700, 1230],
    [30.4, 345, 1310],
    [31.8, 345, 1310],
    [32.4, 620, 1428],
  ]);
  if (f < s(15.3)) {
    // hold the box (and shake with it)
    L = add(L, shakeX, 0);
    R = add(R, shakeX, 0);
  }
  // cupping the candle flame, then steadying the lantern
  const cupIn = ease(f, [s(32.8), s(33.5)], [0, 1]);
  const toHandle = ease(f, [s(35.8), s(36.4)], [0, 1]);
  const cupOut = ease(f, [s(37.8), s(38.8)], [0, 1]);
  L = mixP(L, add(cFlame, -64, 22), cupIn);
  R = mixP(R, add(cFlame, 64, 22), cupIn);
  R = mixP(R, LANTERN_HANDLE, toHandle);
  L = mixP(L, { x: 360, y: 1428 }, cupOut);
  R = mixP(R, { x: 560, y: 1428 }, cupOut);
  // closing: hands softly around the lantern
  const hold = ease(f, [s(53.5), s(55)], [0, 1]);
  L = mixP(L, { x: LANTERN.x - 82, y: LANTERN.y - 110 }, hold);
  R = mixP(R, { x: LANTERN.x + 82, y: LANTERN.y - 110 }, hold);

  const mTip = matchTip(R.x, R.y, matchRot);

  // face
  const blinkCycle = f % 100;
  const blink = blinkCycle > 94 ? Math.sin(((blinkCycle - 94) / 6) * Math.PI) : 0;
  const breathEyes = ease(f, [s(16.6), s(17.4)], [0, 1]) * (1 - ease(f, [s(24.0), s(24.6)], [0, 1]));
  const contentEyes = ease(f, [s(55.5), s(56.5)], [0, 1]);
  const eyesClosed = Math.max(blink, breathEyes, contentEyes);
  const smile = track(f, [
    [6.0, 1],
    [7.0, 0.55],
    [10.3, 0.55],
    [11.2, 1],
  ]);
  const tilt =
    track(f, [
      [5.0, 0],
      [6.0, -5],
      [10.0, -5],
      [11.0, 0],
      [55.0, 0],
      [56.5, 5],
    ]) + (f < s(10) ? 0 : 0);
  const breath = track(f, [
    [18, 0],
    [21, 1],
    [24, 0],
  ]);

  // breathing ring
  const [inS, inE] = [s(T.breatheIn[0]), s(T.breatheIn[1])];
  const [outS, outE] = [s(T.breatheOut[0]), s(T.breatheOut[1])];
  const ringOn = fadeInOut(f, inS - 10, outE + 10, 10);
  const ringR = f < outS ? ease(f, [inS, inE], [190, 330]) : ease(f, [outS, outE], [330, 190]);

  // "1 match" tag
  const tagOn = fadeInOut(f, s(7.2), s(12.8), 12);
  const tagRise = spring({ frame: f - s(7.2), fps, config: { damping: 18, stiffness: 90 } });

  // room light: dark to start (night), warmer as each flame is lit
  const dark = 0.7 - 0.18 * candleLit - 0.2 * lanternLit;

  // closing heart from the lantern
  const lanternHeart = ease(f, [s(56), s(58.6)], [0, 1], (t) => t);

  /* ---------------- drawing ---------------- */
  const showInside = inside > 0.001;
  const showOutside = inside < 0.999;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cream }}>
      {/* ===== outside: the sea ===== */}
      {showOutside && (
        <AbsoluteFill>
          <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0 }}>
            <GlowDefs />
            <g transform={`translate(${LAMP.x} ${LAMP.y}) scale(${zoom}) translate(${-LAMP.x} ${-LAMP.y})`}>
              <Seascape frame={f} lamp={lamp} beam={beam} />
              
              <SailBoat {...boat} frame={f} />
              {homeHeart > 0 && homeHeart < 1 && (
                <path
                  d={HEART}
                  transform={`translate(${boat.x + Math.sin(homeHeart * 6) * 14} ${boat.y - 230 - homeHeart * 200}) scale(1.2)`}
                  fill={COLORS.burntOrange}
                  opacity={Math.sin(homeHeart * Math.PI) * 0.9}
                />
              )}
            </g>
          </svg>
        </AbsoluteFill>
      )}

      {/* ===== inside: the keeper's room ===== */}
      {showInside && (
        <AbsoluteFill style={{ opacity: inside }}>
          <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0 }}>
            <GlowDefs />
            <defs>
              <clipPath id="win">
                <circle cx={WIN.x} cy={WIN.y} r={WIN.r} />
              </clipPath>
              <clipPath id="wall">
                <path
                  clipRule="evenodd"
                  d={`M 0 0 H ${WIDTH} V ${HEIGHT} H 0 Z M ${WIN.x - WIN.r} ${WIN.y} a ${WIN.r} ${WIN.r} 0 1 0 ${WIN.r * 2} 0 a ${WIN.r} ${WIN.r} 0 1 0 ${-WIN.r * 2} 0 Z`}
                />
              </clipPath>
              <radialGradient id="hole">
                <stop offset="0%" stopColor="#000" stopOpacity={1} />
                <stop offset="100%" stopColor="#000" stopOpacity={0} />
              </radialGradient>
              <mask id="roomDark" maskUnits="userSpaceOnUse" x={0} y={0} width={WIDTH} height={HEIGHT}>
                <rect width={WIDTH} height={HEIGHT} fill="#fff" />
                <circle cx={WIN.x} cy={WIN.y} r={380} fill="url(#hole)" opacity={0.4} />
                <circle cx={mTip.x} cy={mTip.y} r={300} fill="url(#hole)" opacity={matchFlame * matchOpacity * 0.6} />
                <circle cx={cFlame.x} cy={cFlame.y} r={460} fill="url(#hole)" opacity={candleLit * 0.75} />
                <circle cx={LANTERN_FLAME.x} cy={LANTERN_FLAME.y} r={640} fill="url(#hole)" opacity={lanternLit * 0.85} />
              </mask>
            </defs>

            {/* the evening sea through the window */}
            <g clipPath="url(#win)">
              <g transform="translate(0 -420)">
                <Seascape
                  frame={f}
                  lighthouse={false}
                  moon={{ x: 650, y: 920, r: 60 }}
                  boat={{ x: 640 + Math.sin(f * 0.02) * 18, y: 1092, scale: 0.16, facing: -1, opacity: f < s(40) ? 1 : 0 }}
                />
              </g>
            </g>

            {/* stone wall */}
            <g clipPath="url(#wall)">
              <rect width={WIDTH} height={HEIGHT} fill={COLORS.deepRed} />
              {new Array(16).fill(0).map((_, row) =>
                new Array(5).fill(0).map((__, col) => {
                  const w = 250;
                  const x = col * w - (row % 2 ? w / 2 : 0) + 10;
                  return (
                    <rect
                      key={`${row}-${col}`}
                      x={x}
                      y={row * 120 + 10}
                      width={w - 20}
                      height={100}
                      rx={34}
                      fill="none"
                      stroke={COLORS.brown}
                      strokeOpacity={0.35}
                      strokeWidth={8}
                    />
                  );
                }),
              )}
            </g>
            {/* window frame and sill */}
            <circle cx={WIN.x} cy={WIN.y} r={WIN.r} fill="none" stroke={COLORS.brownDark} strokeWidth={34} />
            <path
              d={`M ${WIN.x} ${WIN.y - WIN.r} L ${WIN.x} ${WIN.y + WIN.r} M ${WIN.x - WIN.r} ${WIN.y} L ${WIN.x + WIN.r} ${WIN.y}`}
              stroke={COLORS.brownDark}
              strokeWidth={14}
              strokeLinecap="round"
            />
            <rect x={WIN.x - 270} y={WIN.y + WIN.r + 4} width={540} height={36} rx={18} fill={COLORS.brown} />

            {/* floor */}
            <path d={`M 0 1700 C 300 1680 780 1680 ${WIDTH} 1700 L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`} fill={COLORS.brownDark} />

            {/* breathing ring, behind her */}
            {ringOn > 0 && (
              <circle
                cx={HIP_X}
                cy={1200}
                r={ringR}
                fill={COLORS.golden}
                fillOpacity={0.14}
                stroke={COLORS.golden}
                strokeWidth={12}
                strokeOpacity={0.7}
                opacity={ringOn}
              />
            )}

            <Keeper
              x={HIP_X}
              y={hipY}
              scale={SCALE}
              breath={breath}
              eyesClosed={eyesClosed}
              smile={smile}
              tilt={tilt}
              leftHand={L}
              rightHand={R}
              behindArms={
                <g>
                  {/* table */}
                  <rect x={200} y={1480} width={44} height={300} rx={22} fill={COLORS.brown} />
                  <rect x={836} y={1480} width={44} height={300} rx={22} fill={COLORS.brown} />
                  <rect x={160} y={1440} width={760} height={74} rx={26} fill={COLORS.brownDark} />
                  <rect x={140} y={1398} width={800} height={58} rx={29} fill={COLORS.brown} />
                  <Lantern x={LANTERN.x} y={LANTERN.y} lit={lanternLit} />
                  {/* the box rests on the table once she sits */}
                </g>
              }
              held={
                <g>
                  <Matchbox
                    x={boxP.x}
                    y={boxP.y}
                    rot={shakeRot}
                    trayOpen={trayOpen}
                    matchInTray={1 - matchTaken}
                    matchSlide={matchSlide}
                  />
                  {/* rattle marks while shaking */}
                  {shakeEnv > 0.01 && (
                    <g opacity={shakeEnv * 0.8} stroke={COLORS.golden} strokeWidth={8} strokeLinecap="round" fill="none">
                      <path d={`M ${boxP.x - 150} ${boxP.y - 50} Q ${boxP.x - 170} ${boxP.y} ${boxP.x - 150} ${boxP.y + 50}`} />
                      <path d={`M ${boxP.x - 180} ${boxP.y - 70} Q ${boxP.x - 205} ${boxP.y} ${boxP.x - 180} ${boxP.y + 70}`} />
                      <path d={`M ${boxP.x + 150} ${boxP.y - 50} Q ${boxP.x + 170} ${boxP.y} ${boxP.x + 150} ${boxP.y + 50}`} />
                      <path d={`M ${boxP.x + 180} ${boxP.y - 70} Q ${boxP.x + 205} ${boxP.y} ${boxP.x + 180} ${boxP.y + 70}`} />
                    </g>
                  )}
                  <Candle x={candleBase.x} y={candleBase.y} rot={candleRot} />
                  <Match x={R.x} y={R.y} rot={matchRot} opacity={matchOpacity} />
                </g>
              }
            />

            {/* the dim room */}
            <rect width={WIDTH} height={HEIGHT} fill={COLORS.nightSky} opacity={dark} mask="url(#roomDark)" />

            {/* flames and their glow sit above the dimness */}
            <Glow x={mTip.x} y={mTip.y - 20} r={150} opacity={matchFlame * matchOpacity * 0.8} frame={f} />
            <Flame x={mTip.x} y={mTip.y} size={matchFlame * matchOpacity * 0.55} frame={f} seed={1} />
            <Glow x={cFlame.x} y={cFlame.y - 24} r={230} opacity={candleLit * 0.85} frame={f} />
            <Flame x={cFlame.x} y={cFlame.y} size={candleLit * 0.75} frame={f} seed={2} />
            <Glow x={LANTERN_FLAME.x} y={LANTERN_FLAME.y - 30} r={330} opacity={lanternLit * 0.9} frame={f} />
            <Flame x={LANTERN_FLAME.x} y={LANTERN_FLAME.y} size={lanternLit * 0.9} frame={f} seed={3} />

            {/* closing heart */}
            {lanternHeart > 0 && lanternHeart < 1 && (
              <path
                d={HEART}
                transform={`translate(${LANTERN.x + Math.sin(lanternHeart * 6) * 14} ${LANTERN.y - 330 - lanternHeart * 260}) scale(1.2)`}
                fill={COLORS.burntOrange}
                opacity={Math.sin(lanternHeart * Math.PI) * 0.9}
              />
            )}

            {/* "1 match" tag */}
            {tagOn > 0 && (
              <g
                transform={`translate(850 ${1110 + (1 - tagRise) * 30}) scale(${0.96 + 0.04 * tagRise})`}
                opacity={tagOn}
              >
                <rect x={-105} y={-62} width={210} height={124} rx={40} fill={COLORS.cream} stroke={COLORS.golden} strokeWidth={6} />
                <text x={0} y={4} textAnchor="middle" fontFamily={FONT_FAMILY} fontSize={64} fill={COLORS.burntOrange}>
                  1
                </text>
                <text x={0} y={44} textAnchor="middle" fontFamily={FONT_FAMILY} fontSize={30} fill={COLORS.brown}>
                  match
                </text>
              </g>
            )}
          </svg>

          <BreathCount start={inS} end={inE} />
          <BreathCount start={outS} end={outE} />
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{ backgroundColor: COLORS.cream, opacity: endFade }} />
    </AbsoluteFill>
  );
};

/** Three numbered circles that fill one per second: 1… 2… 3… */
const BreathCount: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const frame = useCurrentFrame();
  if (frame < start - 8 || frame > end + 8) return null;
  const opacity = fadeInOut(frame, start - 8, end + 8, 8);
  return (
    <div
      style={{
        position: "absolute",
        top: 300,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 44,
        opacity,
      }}
    >
      {[0, 1, 2].map((k) => {
        const on = ease(frame, [start + sec(k), start + sec(k) + 12], [0, 1]);
        return (
          <div
            key={k}
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              border: `8px solid ${COLORS.golden}`,
              background: COLORS.cream,
              boxSizing: "border-box",
              boxShadow: `0 10px 30px ${COLORS.brown}22`,
              transform: `scale(${0.8 + on * 0.2})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_FAMILY,
              fontSize: 64,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", inset: 0, borderRadius: 55, background: COLORS.golden, opacity: on }} />
            <span style={{ position: "relative", color: on > 0.5 ? COLORS.cream : COLORS.golden }}>{k + 1}</span>
          </div>
        );
      })}
    </div>
  );
};
