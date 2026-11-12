import React from "react";
import { random } from "remotion";
import { COLORS } from "../theme";
import { Glow } from "./Glow";

export const BAY = 1080;
export const FLOOR_Y = 1350;
export const COUNTER_Y = 1080;
/** Stall centre within a bay (screen x when the camera rests on that bay). */
export const STALL_X = 680;

const ARCH_CX = 620;
const ARCH_R = 440;
const ARCH_SPRING = 760;

/* ---------- Underground hall: vaulted brick-free arches, floor, lanterns ---------- */
const archTopAt = (dx: number) => ARCH_SPRING - Math.sqrt(Math.max(0, ARCH_R * ARCH_R - dx * dx));

export const Lantern: React.FC<{ x: number; y: number; chainTop: number; lit: number; frame: number; id: string }> = ({ x, y, chainTop, lit, frame, id }) => {
  const pulse = 1 + Math.sin(frame * 0.09 + x * 0.01) * 0.04;
  return (
    <g>
      <Glow id={id} x={x} y={y + 40} rx={300 * pulse} ry={300 * pulse} opacity={0.55 * lit} />
      <line x1={x} y1={chainTop} x2={x} y2={y - 22} stroke={COLORS.brownDark} strokeWidth={6} strokeLinecap="round" />
      <rect x={x - 28} y={y - 30} width={56} height={22} rx={10} fill={COLORS.brownDark} />
      <rect x={x - 38} y={y - 12} width={76} height={98} rx={30} fill={COLORS.brown} />
      <rect x={x - 26} y={y} width={52} height={74} rx={22} fill={COLORS.brownDark} />
      <rect x={x - 26} y={y} width={52} height={74} rx={22} fill={COLORS.goldenLight} opacity={0.25 + 0.75 * lit} />
      <ellipse cx={x} cy={y + 42} rx={10} ry={16} fill={COLORS.cream} opacity={0.9 * lit} />
      <rect x={x - 22} y={y + 84} width={44} height={16} rx={8} fill={COLORS.brownDark} />
    </g>
  );
};

/** Draws bays from `from` to `to` (inclusive) in world coordinates. */
export const Hall: React.FC<{ from: number; to: number; frame: number; lit0: [number, number] }> = ({ from, to, frame, lit0 }) => {
  const bays = [] as number[];
  for (let k = from; k <= to; k++) if (k >= 0) bays.push(k);
  return (
    <g>
      {bays.map((k) => {
        const x0 = k * BAY;
        const l = x0 + ARCH_CX - ARCH_R;
        const r = x0 + ARCH_CX + ARCH_R;
        return (
          <g key={k}>
            <rect x={x0 - 2} y={0} width={BAY + 4} height={FLOOR_Y + 10} fill={COLORS.brownDark} />
            <path d={`M ${l} ${FLOOR_Y} L ${l} ${ARCH_SPRING} A ${ARCH_R} ${ARCH_R} 0 0 1 ${r} ${ARCH_SPRING} L ${r} ${FLOOR_Y} Z`} fill={COLORS.brown} />
            {/* soft rounded stones on the wall */}
            {new Array(7).fill(0).map((_, i) => {
              const rr = (s: string) => random(`wall-${k}-${i}-${s}`);
              return <rect key={i} x={l + 40 + rr("x") * (ARCH_R * 2 - 180)} y={820 + rr("y") * 420} width={70 + rr("w") * 50} height={34} rx={17} fill={COLORS.brownDark} opacity={0.22} />;
            })}
            {[380, 860].map((dx, j) => {
              const lit = k === 0 ? lit0[j] : 1;
              const ly = j === 0 ? 470 : 440;
              return <Lantern key={dx} id={`lan-${k}-${j}`} x={x0 + dx} y={ly} chainTop={archTopAt(dx - ARCH_CX) - 4} lit={lit} frame={frame} />;
            })}
          </g>
        );
      })}
      {/* floor */}
      {bays.map((k) => (
        <g key={`f${k}`}>
          <rect x={k * BAY - 2} y={FLOOR_Y} width={BAY + 4} height={1920 - FLOOR_Y} fill={COLORS.deepRed} />
          <rect x={k * BAY - 2} y={FLOOR_Y - 8} width={BAY + 4} height={22} rx={8} fill={COLORS.brown} />
          {new Array(9).fill(0).map((_, i) => {
            const rr = (s: string) => random(`floor-${k}-${i}-${s}`);
            return <ellipse key={i} cx={k * BAY + rr("x") * BAY} cy={FLOOR_Y + 60 + rr("y") * 460} rx={50 + rr("w") * 40} ry={14 + rr("h") * 8} fill={COLORS.brown} opacity={0.3} />;
          })}
        </g>
      ))}
    </g>
  );
};

/* ---------- Entrance: steps down from a glowing doorway (bay 0) ---------- */
export const STEP = { x0: 170, top: 1310, run: 100, rise: 100, n: 3 };
export const Stairs: React.FC = () => (
  <g>
    <path d={`M ${STEP.x0 - 70} ${STEP.top} L ${STEP.x0 - 70} 700 A 155 155 0 0 1 ${STEP.x0 + 240} 700 L ${STEP.x0 + 240} ${STEP.top} Z`} fill={COLORS.brownDark} />
    <path d={`M ${STEP.x0 - 50} ${STEP.top} L ${STEP.x0 - 50} 710 A 135 135 0 0 1 ${STEP.x0 + 220} 710 L ${STEP.x0 + 220} ${STEP.top} Z`} fill={COLORS.goldenLight} opacity={0.85} />
    <Glow id="door" x={STEP.x0 + 85} y={950} rx={320} ry={420} opacity={0.6} />
    {new Array(STEP.n).fill(0).map((_, i) => {
      const top = STEP.top + STEP.rise * i;
      const right = STEP.x0 + 150 + STEP.run * i;
      return (
        <g key={i}>
          <rect x={-40} y={top} width={right + 40} height={1920 - top + 40} rx={24} fill={COLORS.brown} />
          <rect x={-40} y={top} width={right + 40} height={20} rx={10} fill={COLORS.burntOrange} />
          <rect x={-40} y={top + 20} width={right + 40} height={14} fill={COLORS.brownDark} opacity={0.35} />
        </g>
      );
    })}
  </g>
);

/* ---------- Counter (origin = centre of counter top) ---------- */
export const Counter: React.FC = () => (
  <g>
    <ellipse cx={0} cy={FLOOR_Y - COUNTER_Y + 10} rx={320} ry={26} fill={COLORS.brownDark} opacity={0.18} />
    <rect x={-280} y={0} width={560} height={FLOOR_Y - COUNTER_Y + 4} rx={26} fill={COLORS.burntOrange} />
    {[-140, 0, 140].map((x) => (
      <line key={x} x1={x} y1={50} x2={x} y2={FLOOR_Y - COUNTER_Y - 30} stroke={COLORS.deepRed} strokeWidth={8} strokeLinecap="round" opacity={0.45} />
    ))}
    <rect x={-305} y={-16} width={610} height={34} rx={17} fill={COLORS.golden} />
  </g>
);

/* ---------- Jar of summer birdsong (origin = bottom centre) ---------- */
export const Jar: React.FC<{ x: number; w: number; h: number; frame: number; seed: number }> = ({ x, w, h, frame, seed }) => {
  const fy = Math.sin(frame * 0.1 + seed) * h * 0.1;
  const fx = Math.sin(frame * 0.05 + seed * 2) * w * 0.1;
  const wing = Math.sin(frame * 0.3 + seed) * 28;
  const s = w / 120;
  return (
    <g transform={`translate(${x} 0)`}>
      <ellipse cx={0} cy={-h * 0.5} rx={w * 0.75} ry={h * 0.6} fill={COLORS.goldenLight} opacity={0.18} />
      <rect x={-w / 2} y={-h} width={w} height={h} rx={w * 0.3} fill={COLORS.cream} opacity={0.32} />
      <ellipse cx={0} cy={-h * 0.45} rx={w * 0.36} ry={h * 0.32} fill={COLORS.goldenLight} opacity={0.55} />
      <g transform={`translate(${fx} ${-h * 0.48 + fy}) scale(${s})`}>
        <ellipse cx={0} cy={0} rx={24} ry={19} fill={COLORS.burntOrange} />
        <circle cx={18} cy={-14} r={14} fill={COLORS.burntOrange} />
        <circle cx={22} cy={-17} r={3.5} fill={COLORS.brownDark} />
        <path d="M 31 -14 L 40 -11" stroke={COLORS.golden} strokeWidth={6} strokeLinecap="round" />
        <path d="M -22 2 L -34 -6" stroke={COLORS.burntOrange} strokeWidth={10} strokeLinecap="round" />
        <g transform={`rotate(${wing} -2 -4)`}>
          <ellipse cx={-6} cy={-12} rx={16} ry={9} fill={COLORS.deepRed} />
        </g>
      </g>
      <path d={`M ${-w * 0.32} ${-h * 0.78} Q ${-w * 0.4} ${-h * 0.5} ${-w * 0.32} ${-h * 0.2}`} stroke={COLORS.cream} strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.7} />
      <rect x={-w * 0.42} y={-h - 22} width={w * 0.84} height={28} rx={12} fill={COLORS.brown} />
    </g>
  );
};

/* ---------- Biscuits that taste like being understood (origin = counter top centre) ---------- */
const Biscuit: React.FC<{ x: number; y: number; r: number; seed: string }> = ({ x, y, r, seed }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={COLORS.golden} />
    <circle cx={x - r * 0.25} cy={y - r * 0.3} r={r * 0.35} fill={COLORS.goldenLight} opacity={0.5} />
    {new Array(4).fill(0).map((_, i) => {
      const a = random(`${seed}-a-${i}`) * Math.PI * 2;
      const d = r * (0.25 + random(`${seed}-d-${i}`) * 0.5);
      return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d} r={r * 0.11} fill={COLORS.brown} />;
    })}
  </g>
);

export const BiscuitStand: React.FC = () => (
  <g>
    <ellipse cx={0} cy={-4} rx={110} ry={16} fill={COLORS.creamShade} />
    <rect x={-20} y={-70} width={40} height={66} rx={18} fill={COLORS.creamShade} />
    <ellipse cx={0} cy={-74} rx={230} ry={30} fill={COLORS.cream} />
    <Biscuit x={-120} y={-140} r={62} seed="b1" />
    <Biscuit x={0} y={-140} r={62} seed="b2" />
    <Biscuit x={120} y={-140} r={62} seed="b3" />
    <Biscuit x={-60} y={-235} r={62} seed="b4" />
    <Biscuit x={60} y={-235} r={62} seed="b5" />
    <Biscuit x={0} y={-330} r={62} seed="b6" />
  </g>
);

export const HEART = "M 0 18 C -40 -8 -30 -40 -10 -36 C 0 -34 0 -26 0 -22 C 0 -26 0 -34 10 -36 C 30 -40 40 -8 0 18 Z";

/* ---------- Five comforts (each centred at origin, inside a cream card) ---------- */
const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g>
    <circle cx={0} cy={8} r={96} fill={COLORS.brownDark} opacity={0.2} />
    <circle cx={0} cy={0} r={96} fill={COLORS.cream} stroke={COLORS.golden} strokeWidth={6} />
    {children}
  </g>
);

const Bedding = () => (
  <Card>
    <rect x={-62} y={-4} width={124} height={52} rx={22} fill={COLORS.golden} />
    <path d="M -50 22 L 50 22" stroke={COLORS.burntOrange} strokeWidth={7} strokeLinecap="round" />
    <rect x={-46} y={-44} width={92} height={42} rx={20} fill={COLORS.burntOrange} />
    <path d="M 52 -52 Q 54 -40 66 -38 Q 54 -36 52 -24 Q 50 -36 38 -38 Q 50 -40 52 -52 Z" fill={COLORS.golden} />
  </Card>
);

const Hug = () => (
  <Card>
    <ellipse cx={-26} cy={30} rx={34} ry={40} fill={COLORS.deepRed} />
    <ellipse cx={26} cy={30} rx={34} ry={40} fill={COLORS.burntOrange} />
    <circle cx={-24} cy={-26} r={24} fill={COLORS.deepRed} />
    <circle cx={24} cy={-26} r={24} fill={COLORS.burntOrange} />
    <path d="M -50 18 Q 0 44 46 10" stroke={COLORS.deepRed} strokeWidth={16} strokeLinecap="round" fill="none" />
    <path d="M 50 22 Q 0 48 -46 14" stroke={COLORS.burntOrange} strokeWidth={16} strokeLinecap="round" fill="none" />
    <path d={HEART} transform="translate(0 -62) scale(0.55)" fill={COLORS.burntOrange} />
  </Card>
);

const Voice = () => (
  <Card>
    <path d="M -58 -40 Q -58 -56 -42 -56 L 26 -56 Q 42 -56 42 -40 L 42 6 Q 42 22 26 22 L -18 22 L -40 44 L -36 22 L -42 22 Q -58 22 -58 6 Z" fill={COLORS.burntOrange} strokeLinejoin="round" />
    <circle cx={-30} cy={-17} r={7} fill={COLORS.cream} />
    <circle cx={-8} cy={-17} r={7} fill={COLORS.cream} />
    <circle cx={14} cy={-17} r={7} fill={COLORS.cream} />
    <path d="M 56 -36 Q 68 -17 56 2" stroke={COLORS.golden} strokeWidth={8} strokeLinecap="round" fill="none" />
    <path d="M 70 -48 Q 88 -17 70 14" stroke={COLORS.golden} strokeWidth={8} strokeLinecap="round" fill="none" />
  </Card>
);

const Song = () => (
  <Card>
    <ellipse cx={-30} cy={34} rx={22} ry={17} fill={COLORS.brown} transform="rotate(-20 -30 34)" />
    <ellipse cx={34} cy={20} rx={22} ry={17} fill={COLORS.brown} transform="rotate(-20 34 20)" />
    <path d="M -12 30 L -12 -40 L 52 -54 L 52 16" stroke={COLORS.brown} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M -12 -40 L 52 -54" stroke={COLORS.brown} strokeWidth={18} strokeLinecap="round" />
  </Card>
);

const HotDrink: React.FC<{ frame: number }> = ({ frame }) => (
  <Card>
    <path d="M 38 -4 Q 70 -4 70 18 Q 70 40 38 40" stroke={COLORS.burntOrange} strokeWidth={12} strokeLinecap="round" fill="none" />
    <path d="M -46 -14 L 46 -14 L 40 40 Q 38 58 20 58 L -20 58 Q -38 58 -40 40 Z" fill={COLORS.burntOrange} strokeLinejoin="round" />
    <rect x={-46} y={-20} width={92} height={14} rx={7} fill={COLORS.deepRed} />
    {[-22, 0, 22].map((x, i) => {
      const sway = Math.sin(frame * 0.07 + i) * 5;
      return <path key={x} d={`M ${x} -32 Q ${x - 10 + sway} -48 ${x} -60 Q ${x + 10 + sway} -72 ${x} -84`} stroke={COLORS.golden} strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.85} />;
    })}
  </Card>
);

export const COMFORTS: React.FC<{ frame: number }>[] = [Bedding, Hug, Voice, Song, HotDrink];
