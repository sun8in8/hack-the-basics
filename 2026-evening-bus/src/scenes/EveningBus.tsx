import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, random, useCurrentFrame } from "remotion";
import { ease } from "../anim";
import { BreathCircles } from "../components/BreathCircles";
import { BreathRing } from "../components/BreathRing";
import { Bus } from "../components/Bus";
import { Baker } from "../components/Baker";
import { DadAndChild } from "../components/DadAndChild";
import { blink } from "../components/Face";
import { Glow } from "../components/Glow";
import { NightSky } from "../components/NightSky";
import { NurseResting } from "../components/NurseResting";
import { Passenger } from "../components/Passenger";
import { Steam } from "../components/Steam";
import { StreetStrip } from "../components/StreetStrip";
import { COLORS, sec } from "../theme";

const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

/* Timeline in seconds. Shots overlap by their crossfade. */
export const T = {
  bus: [0, 6.8], // bus glides in, slow push towards the lady's window
  lady: [6.0, 20.4], // inside: the lady by the window
  breatheIn: [11, 14], // 1, 2, 3 in
  breatheOut: [14, 17], // 1, 2, 3 out, steam spreads on the glass
  steamFade: [17, 20], // the steam fades, the view clears
  view: [19.6, 32.8], // through the window: baker, then dad & child
  nurse: [32.0, 37.8], // the nurse resting her head on the window
  city: [37.0, 45], // windows, most lit, a few dark: the pause
} as const;
export const EVENING_BUS_DURATION = sec(45);
const XF = 24; // crossfade between shots, frames

const useFont = () => {
  const [handle] = useState(() => delayRender("Loading Patrick Hand"));
  useEffect(() => {
    document.fonts.load(`64px 'Patrick Hand'`).then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};

const Svg: React.FC<{ children: React.ReactNode; opacity?: number }> = ({ children, opacity = 1 }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, opacity }}>
    {children}
  </svg>
);

const Lamp: React.FC<{ x: number; base: number; id: string }> = ({ x, base, id }) => (
  <g>
    <Glow id={id} x={x} y={base - 330} rx={130} ry={130} opacity={0.7} />
    <rect x={x - 9} y={base - 320} width={18} height={320} rx={9} fill={COLORS.brownDark} />
    <circle cx={x} cy={base - 330} r={24} fill={COLORS.goldenLight} />
  </g>
);

/* ---------- Shot 1: the bus arrives ---------- */
const BusShot: React.FC<{ f: number }> = ({ f }) => {
  const bx = ease(f, [0, sec(5)], [-720, 540], easeOutQuad);
  const bob = Math.sin(f * 0.1) * 3 * ease(f, [sec(4), sec(5)], [1, 0.3]);
  // slow push in towards window 1 (the lady)
  const zoom = ease(f, [sec(5), sec(6.8)], [1, 1.7]);
  const px = 540 - 185 + 65;
  const py = 1530 - 285;
  return (
    <Svg>
      <g transform={`translate(${px} ${py}) scale(${zoom}) translate(${-px} ${-py})`}>
        <NightSky id="busSky" w={1080} h={1920} moon={{ x: 713, y: 634, r: 108 }} starBand={0.36} />
        <StreetStrip offset={60} baseY={1400} span={1080} scale={1.3} seed="busStreet" />
        <Lamp x={150} base={1420} id="lampA" />
        <Lamp x={930} base={1420} id="lampB" />
        <rect x={0} y={1400} width={1080} height={60} fill={COLORS.brown} />
        <rect x={0} y={1460} width={1080} height={460} fill={COLORS.brownDark} />
        <g transform={`translate(${bx} ${1530 + bob})`}>
          <Bus roll={bx} id="bus" />
        </g>
      </g>
    </Svg>
  );
};

/* ---------- Bus interior (used for the lady and the nurse) ---------- */
type Win = { x: number; y: number; w: number; h: number };
const Interior: React.FC<{ f: number; win: Win; id: string; children: React.ReactNode; onGlass?: React.ReactNode; scroll: number }> = ({
  f,
  win,
  id,
  children,
  onGlass,
  scroll,
}) => (
  <Svg>
    <defs>
      <clipPath id={`${id}-glass`}>
        <rect x={win.x} y={win.y} width={win.w} height={win.h} rx={60} />
      </clipPath>
    </defs>
    <rect width={1080} height={1920} fill={COLORS.brown} />
    <rect width={1080} height={400} fill={COLORS.brownDark} />
    <path d="M 40 470 L 1040 470" stroke={COLORS.golden} strokeWidth={14} strokeLinecap="round" />
    <g clipPath={`url(#${id}-glass)`}>
      <NightSky id={`${id}-sky`} x={win.x} y={win.y} w={win.w} h={win.h} moon={{ x: win.x + win.w * 0.3, y: win.y + 150, r: 60 }} stars={18} starBand={0.35} />
      <StreetStrip offset={scroll + f * 2} baseY={win.y + win.h - 10} span={1080} scale={0.9} seed={`${id}-far`} body={COLORS.brownDark} />
      {onGlass}
    </g>
    <rect x={win.x} y={win.y} width={win.w} height={win.h} rx={60} fill="none" stroke={COLORS.brownDark} strokeWidth={34} />
    {/* seat */}
    <rect x={560} y={1080} width={520} height={900} rx={70} fill={COLORS.burntOrange} />
    <rect x={560} y={1080} width={520} height={40} rx={20} fill={COLORS.golden} />
    {children}
  </Svg>
);

/* ---------- Shot 2: the lady breathes on the window ---------- */
const LadyShot: React.FC<{ f: number }> = ({ f }) => {
  const [inS, inE] = [sec(T.breatheIn[0]), sec(T.breatheIn[1])];
  const [outS, outE] = [sec(T.breatheOut[0]), sec(T.breatheOut[1])];
  const breath = f < outS ? ease(f, [inS, inE], [0, 1]) : ease(f, [outS, outE], [1, 0]);
  const ringOn = ease(f, [inS - 12, inS], [0, 1]) * ease(f, [outE, outE + 15], [1, 0]);
  const mouthO = ease(f, [outS, outS + 12], [0, 1]) * ease(f, [outE - 12, outE], [1, 0]);
  const steamGrow = ease(f, [outS, outE], [0, 1]);
  const steamOp = ease(f, [outS, outS + 12], [0, 1]) * ease(f, [sec(T.steamFade[0]), sec(T.steamFade[1])], [1, 0]);
  const lean = ease(f, [sec(9.5), sec(11)], [0, 1]) * ease(f, [sec(17.5), sec(19)], [1, 0.4]);
  const eyes = Math.max(blink(f, 20), ease(f, [outS, outS + 20], [0, 0.8]) * ease(f, [outE, outE + 20], [1, 0]));
  return (
    <Interior
      f={f}
      id="ladyBus"
      scroll={0}
      win={{ x: 90, y: 560, w: 820, h: 680 }}
      onGlass={<Steam id="steam" x={470} y={900} grow={steamGrow} opacity={steamOp * 0.95} />}
    >
      <Glow id="ladyGlow" x={720} y={920} rx={380} ry={360} opacity={0.15 + 0.3 * breath} />
      <BreathRing x={700} y={920} r={190 + 140 * breath} opacity={ringOn} />
      <g transform={`translate(${780 - 30 * lean} ${880 - 10 * breath}) scale(1.15)`}>
        <Passenger kind="lady" breath={breath} mouthO={mouthO} eyesClosed={eyes} tilt={-6 * lean + Math.sin(f * 0.07) * 2} />
      </g>
    </Interior>
  );
};

/* ---------- Shot 3: through the window ---------- */
const LitWindow: React.FC<{ w: number; h: number; id: string; children: React.ReactNode; curtains?: boolean }> = ({ w, h, id, children, curtains }) => (
  <g>
    <Glow id={`${id}-out`} x={0} y={0} rx={w * 0.85} ry={h * 0.85} opacity={0.55} />
    <defs>
      <clipPath id={`${id}-clip`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} />
      </clipPath>
    </defs>
    <g clipPath={`url(#${id}-clip)`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={COLORS.goldenLight} />
      <Glow id={`${id}-in`} x={0} y={-h * 0.1} rx={w * 0.6} ry={h * 0.6} opacity={0.8} />
      {children}
      {curtains && (
        <g>
          <path d={`M ${-w / 2} ${-h / 2} L ${-w / 2 + 90} ${-h / 2} C ${-w / 2 + 70} ${-h / 2 + 140} ${-w / 2 + 20} ${-h / 2 + 200} ${-w / 2} ${-h / 2 + 260} Z`} fill={COLORS.burntOrange} />
          <path d={`M ${w / 2} ${-h / 2} L ${w / 2 - 90} ${-h / 2} C ${w / 2 - 70} ${-h / 2 + 140} ${w / 2 - 20} ${-h / 2 + 200} ${w / 2} ${-h / 2 + 260} Z`} fill={COLORS.burntOrange} />
        </g>
      )}
    </g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill="none" stroke={COLORS.brown} strokeWidth={22} />
    <rect x={-w / 2 - 30} y={h / 2 + 4} width={w + 60} height={26} rx={13} fill={COLORS.cream} />
  </g>
);

const ViewShot: React.FC<{ f: number }> = ({ f }) => {
  const s0 = sec(T.view[0]);
  const shopX =
    f < sec(25.2)
      ? ease(f, [s0, sec(21.8)], [1750, 560], easeOutQuad) - ease(f, [sec(21.8), sec(25.2)], [0, 70])
      : ease(f, [sec(25.2), sec(26.8)], [490, -760]);
  const houseX =
    f < sec(31.2)
      ? ease(f, [sec(25.6), sec(27.6)], [1800, 560], easeOutQuad) - ease(f, [sec(27.6), sec(31.2)], [0, 70])
      : ease(f, [sec(31.2), sec(33)], [490, -760]);
  const sleepy = ease(f, [sec(28), sec(31)], [0, 1]);
  const glass = { x: 80, y: 360, w: 920, h: 1220 };
  return (
    <Svg>
      <defs>
        <clipPath id="viewGlass">
          <rect x={glass.x} y={glass.y} width={glass.w} height={glass.h} rx={70} />
        </clipPath>
      </defs>
      <rect width={1080} height={1920} fill={COLORS.brown} />
      <g clipPath="url(#viewGlass)">
        <NightSky id="viewSky" x={glass.x} y={glass.y} w={glass.w} h={glass.h} moon={{ x: 760, y: 520, r: 70 }} stars={26} starBand={0.25} />
        <StreetStrip offset={f * 1.5} baseY={1480} span={1080} scale={1} seed="viewFar" body={COLORS.brownDark} />
        {/* the bakery */}
        <g transform={`translate(${shopX} 0)`}>
          <rect x={-430} y={640} width={860} height={1000} rx={30} fill={COLORS.deepRed} />
          {new Array(9).fill(0).map((_, i) => (
            <path key={i} d={`M ${-405 + i * 90} 760 Q ${-360 + i * 90} 820 ${-315 + i * 90} 760 Z`} fill={i % 2 ? COLORS.cream : COLORS.burntOrange} stroke={i % 2 ? COLORS.cream : COLORS.burntOrange} strokeWidth={10} strokeLinejoin="round" />
          ))}
          <rect x={-420} y={740} width={840} height={28} rx={14} fill={COLORS.burntOrange} />
          <g transform="translate(0 1120)">
            <LitWindow w={600} h={560} id="shopWin">
              <Baker frame={f} />
            </LitWindow>
          </g>
        </g>
        {/* the house */}
        <g transform={`translate(${houseX} 0)`}>
          <path d="M -410 700 L 0 470 L 410 700 Z" fill={COLORS.brownDark} stroke={COLORS.brownDark} strokeWidth={40} strokeLinejoin="round" />
          <rect x={-430} y={690} width={860} height={950} rx={30} fill={COLORS.deepRed} />
          <g transform="translate(0 1090)">
            <LitWindow w={620} h={520} id="homeWin" curtains>
              <DadAndChild frame={f} sleepy={sleepy} />
            </LitWindow>
          </g>
        </g>
        <rect x={0} y={1500} width={1080} height={100} fill={COLORS.brown} />
      </g>
      <rect x={glass.x} y={glass.y} width={glass.w} height={glass.h} rx={70} fill="none" stroke={COLORS.brownDark} strokeWidth={44} />
    </Svg>
  );
};

/* ---------- Shot 4: the nurse ---------- */
const NurseShot: React.FC<{ f: number }> = ({ f }) => {
  const rest = 0.5 + 0.5 * Math.sin(f * 0.06);
  return (
    <Interior f={f} id="nurseBus" scroll={900} win={{ x: 60, y: 560, w: 560, h: 680 }}>
      <Glow id="nurseGlow" x={720} y={920} rx={360} ry={340} opacity={0.25 + 0.08 * rest} />
      <g transform="translate(735 880) scale(1.15)">
        <NurseResting rest={rest} />
      </g>
    </Interior>
  );
};

/* ---------- Shot 5: the city of lit windows ---------- */
type Block = { x: number; w: number; top: number; color: string; cols: number; ww: number; wh: number; gapY: number; roof?: boolean };
const BLOCKS: Block[] = [
  { x: -30, w: 330, top: 640, color: COLORS.deepRed, cols: 3, ww: 60, wh: 76, gapY: 118 },
  { x: 290, w: 290, top: 780, color: COLORS.deepRed, cols: 3, ww: 56, wh: 72, gapY: 118 },
  { x: 570, w: 300, top: 600, color: COLORS.deepRed, cols: 3, ww: 58, wh: 76, gapY: 118 },
  { x: 860, w: 250, top: 740, color: COLORS.deepRed, cols: 2, ww: 62, wh: 76, gapY: 118 },
  { x: -20, w: 360, top: 1130, color: COLORS.brown, cols: 2, ww: 96, wh: 100, gapY: 160, roof: true },
  { x: 360, w: 360, top: 1180, color: COLORS.brown, cols: 2, ww: 96, wh: 100, gapY: 160, roof: true },
  { x: 740, w: 360, top: 1110, color: COLORS.brown, cols: 2, ww: 96, wh: 100, gapY: 160, roof: true },
];
const LATE_LIGHT = "b2-r3-c1"; // one dark window that slowly lights up during the pause

const CityShot: React.FC<{ f: number }> = ({ f }) => {
  const s0 = sec(T.city[0]);
  const zoom = ease(f, [s0, sec(41.5)], [1.3, 1]);
  const late = ease(f, [sec(40.5), sec(42.5)], [0, 1]);
  const pulse = 1 + Math.sin(f * 0.09) * 0.04;
  const busX = ease(f, [sec(38), sec(44.5)], [-220, 1300], (t) => t);
  return (
    <Svg>
      <defs>
        <radialGradient id="winGlow">
          <stop offset="0%" stopColor={COLORS.goldenLight} stopOpacity={0.7} />
          <stop offset="100%" stopColor={COLORS.goldenLight} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(540 1150) scale(${zoom}) translate(-540 -1150)`}>
        <NightSky id="citySky" w={1080} h={1920} moon={{ x: 713, y: 420, r: 100 }} starBand={0.26} />
        {BLOCKS.map((b, bi) => {
          const bottom = 1500;
          const rows = Math.floor((bottom - b.top - 60) / b.gapY);
          const gapX = (b.w - b.cols * b.ww) / (b.cols + 1);
          return (
            <g key={bi}>
              {b.roof && (
                <path d={`M ${b.x + 20} ${b.top} L ${b.x + b.w / 2} ${b.top - 120} L ${b.x + b.w - 20} ${b.top} Z`} fill={COLORS.brownDark} stroke={COLORS.brownDark} strokeWidth={30} strokeLinejoin="round" />
              )}
              <rect x={b.x} y={b.top} width={b.w} height={bottom - b.top + 10} rx={22} fill={b.color} />
              {new Array(rows * b.cols).fill(0).map((_, j) => {
                const c = j % b.cols;
                const r = Math.floor(j / b.cols);
                const key = `b${bi}-r${r}-c${c}`;
                const isLate = key === LATE_LIGHT;
                const lit = isLate ? late : random(`city-${key}`) > 0.16 ? 1 : 0;
                const wx = b.x + gapX + c * (b.ww + gapX);
                const wy = b.top + 50 + r * b.gapY;
                return (
                  <g key={j}>
                    {lit > 0 && (
                      <ellipse cx={wx + b.ww / 2} cy={wy + b.wh / 2} rx={b.ww * 1.3 * pulse} ry={b.wh * 1.2 * pulse} fill="url(#winGlow)" opacity={lit * 0.8} />
                    )}
                    <rect x={wx} y={wy} width={b.ww} height={b.wh} rx={14} fill={COLORS.brownDark} />
                    <rect x={wx} y={wy} width={b.ww} height={b.wh} rx={14} fill={COLORS.goldenLight} opacity={lit} />
                  </g>
                );
              })}
            </g>
          );
        })}
        <rect x={0} y={1500} width={1080} height={50} fill={COLORS.brown} />
        <rect x={0} y={1550} width={1080} height={400} fill={COLORS.brownDark} />
        <g transform={`translate(${busX} 1612) scale(0.3)`}>
          <Bus roll={busX / 0.3} id="smallBus" />
        </g>
      </g>
      <Glow id="cityGlow" x={540} y={1150} rx={560 * pulse} ry={600 * pulse} opacity={0.22} />
    </Svg>
  );
};

/* ---------- The whole Short ---------- */
/** Each shot fades in over the one beneath it. */
const fadeIn = (f: number, [a]: readonly [number, number]) => ease(f, [sec(a), sec(a) + XF], [0, 1]);

export const EveningBus: React.FC = () => {
  useFont();
  const f = useCurrentFrame();
  const fromCream = ease(f, [0, 18], [1, 0]);
  const toCream = ease(f, [EVENING_BUS_DURATION - 30, EVENING_BUS_DURATION], [0, 1]);
  const vis = (k: keyof typeof T) => f >= sec(T[k][0]) && f <= sec(T[k][1]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cream }}>
      {vis("bus") && <BusShot f={f} />}
      {vis("lady") && <AbsoluteFill style={{ opacity: fadeIn(f, T.lady) }}><LadyShot f={f} /></AbsoluteFill>}
      {vis("view") && <AbsoluteFill style={{ opacity: fadeIn(f, T.view) }}><ViewShot f={f} /></AbsoluteFill>}
      {vis("nurse") && <AbsoluteFill style={{ opacity: fadeIn(f, T.nurse) }}><NurseShot f={f} /></AbsoluteFill>}
      {vis("city") && <AbsoluteFill style={{ opacity: fadeIn(f, T.city) }}><CityShot f={f} /></AbsoluteFill>}
      <BreathCircles start={sec(T.breatheIn[0])} />
      <BreathCircles start={sec(T.breatheOut[0])} />
      <AbsoluteFill style={{ backgroundColor: COLORS.cream, opacity: Math.max(fromCream, toCream) }} />
    </AbsoluteFill>
  );
};
