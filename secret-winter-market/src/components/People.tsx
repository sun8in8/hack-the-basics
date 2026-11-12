import React from "react";
import { COLORS } from "../theme";
import { Face } from "./Face";

/*
 * Market sellers. Each is drawn with the origin at the centre of the counter top:
 * the upper body shows above y = 0 and the counter (drawn after) hides the rest.
 * Nobody has a hair bun.
 */

const Arm: React.FC<{ from: [number, number]; to: [number, number]; bend: number; color: string }> = ({ from, to, bend, color }) => {
  const mx = (from[0] + to[0]) / 2 + bend;
  const my = (from[1] + to[1]) / 2;
  return (
    <g>
      <path d={`M ${from[0]} ${from[1]} Q ${mx} ${my} ${to[0]} ${to[1]}`} stroke={color} strokeWidth={40} strokeLinecap="round" fill="none" />
      <circle cx={to[0]} cy={to[1]} r={21} fill={COLORS.creamShade} />
    </g>
  );
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp2 = (a: [number, number], b: [number, number], t: number): [number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

/* ---------- Lady who sells jars of summer birdsong ---------- */
export const BirdLady: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    {/* long hair behind (no bun) */}
    <rect x={-108} y={-400} width={216} height={240} rx={95} fill={COLORS.burntOrange} />
    {/* dress */}
    <path d="M -62 -222 C -142 -216 -152 -150 -152 -60 L -152 40 L 152 40 L 152 -60 C 152 -150 142 -216 62 -222 Z" fill={COLORS.golden} />
    {[[-80, -140], [60, -170], [-20, -90], [100, -80], [-110, -40], [30, -30]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={9} fill={COLORS.cream} opacity={0.7} />
    ))}
    <rect x={-24} y={-250} width={48} height={40} rx={20} fill={COLORS.creamShade} />
    <circle cx={0} cy={-312} r={82} fill={COLORS.creamShade} />
    <path d="M -84 -312 C -88 -410 88 -410 84 -312 C 62 -352 22 -362 -8 -354 C -40 -348 -70 -336 -84 -312 Z" fill={COLORS.burntOrange} />
    <g transform="translate(0 -312)">
      <Face r={82} frame={frame} seed={11} smile={0.7} />
    </g>
    <Arm from={[-118, -190]} to={[-70, -60]} bend={-40} color={COLORS.golden} />
    <Arm from={[118, -190]} to={[70, -60]} bend={40} color={COLORS.golden} />
  </g>
);

/* ---------- Man with a huge moustache: socks that remember warm sand ---------- */
export const Sock: React.FC<{ flip?: boolean }> = ({ flip = false }) => (
  <g transform={flip ? "scale(-1 1)" : undefined}>
    <path d="M -30 0 L -30 120 Q -30 172 20 172 L 72 172 Q 104 172 104 142 Q 104 112 72 112 L 30 112 L 30 0 Z" fill={COLORS.golden} />
    <path d="M -30 62 Q -15 50 0 62 Q 15 74 30 62" stroke={COLORS.burntOrange} strokeWidth={8} strokeLinecap="round" fill="none" />
    <path d="M -30 92 Q -15 80 0 92 Q 15 104 30 92" stroke={COLORS.burntOrange} strokeWidth={8} strokeLinecap="round" fill="none" />
    <rect x={-34} y={-6} width={68} height={28} rx={14} fill={COLORS.burntOrange} />
    <circle cx={60} cy={142} r={13} fill={COLORS.cream} />
  </g>
);

export const MoustacheMan: React.FC<{ frame: number; raise: number; smile: number }> = ({ frame, raise, smile }) => {
  const handL = lerp2([-100, -110], [-170, -330], raise);
  const handR = lerp2([100, -110], [170, -330], raise);
  const tipLift = smile * 16;
  return (
    <g>
      {/* jacket + shirt */}
      <path d="M -66 -225 C -150 -218 -160 -150 -160 -60 L -160 40 L 160 40 L 160 -60 C 160 -150 150 -218 66 -225 Z" fill={COLORS.deepRed} />
      <path d="M -50 -224 L 0 -120 L 50 -224 Z" fill={COLORS.creamShade} />
      <circle cx={0} cy={-90} r={8} fill={COLORS.golden} />
      <circle cx={0} cy={-50} r={8} fill={COLORS.golden} />
      <rect x={-26} y={-256} width={52} height={44} rx={22} fill={COLORS.creamShade} />
      {/* head */}
      <circle cx={0} cy={-316} r={86} fill={COLORS.creamShade} />
      {/* slick hair: smooth, swept back with a shine (no bun) */}
      <path d="M -88 -326 C -94 -410 -20 -428 40 -418 C 92 -408 104 -366 88 -326 C 72 -352 32 -372 -20 -369 C -56 -366 -76 -350 -88 -326 Z" fill={COLORS.brownDark} />
      <path d="M -50 -392 Q 10 -412 62 -392" stroke={COLORS.cream} strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.28} />
      <g transform="translate(0 -316)">
        <Face r={86} frame={frame} seed={37} smile={0.2 + smile * 0.8} happy={smile > 0.6 ? 1 : 0} mouthY={0.62} />
        {/* huge handlebar moustache; tips curl up as he smiles */}
        <g transform={`rotate(${tipLift} 0 36)`}>
          <path d="M -6 40 Q -52 18 -100 36 Q -128 48 -126 20" stroke={COLORS.brownDark} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
        <g transform={`rotate(${-tipLift} 0 36)`}>
          <path d="M 6 40 Q 52 18 100 36 Q 128 48 126 20" stroke={COLORS.brownDark} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </g>
      <Arm from={[-122, -195]} to={handL} bend={-30} color={COLORS.deepRed} />
      <Arm from={[122, -195]} to={handR} bend={30} color={COLORS.deepRed} />
      <g transform={`translate(${handL[0]} ${handL[1] + 6})`}>
        <Sock flip />
      </g>
      <g transform={`translate(${handR[0]} ${handR[1] + 6})`}>
        <Sock />
      </g>
    </g>
  );
};

/* ---------- Woman in velvet with a glass bottle of mist ---------- */
export const MistBottle: React.FC<{ squeeze: number }> = ({ squeeze }) => (
  <g>
    <path d="M 14 -84 Q 52 -84 62 -62" stroke={COLORS.brown} strokeWidth={7} strokeLinecap="round" fill="none" />
    <ellipse cx={66} cy={-44} rx={22 * (1 - 0.25 * squeeze)} ry={28 * (1 - 0.1 * squeeze)} fill={COLORS.burntOrange} />
    <rect x={-12} y={-80} width={24} height={30} rx={10} fill={COLORS.creamShade} opacity={0.85} />
    <rect x={-18} y={-98} width={36} height={22} rx={10} fill={COLORS.brown} />
    <rect x={-34} y={-92} width={22} height={11} rx={5} fill={COLORS.brown} />
    <circle cx={0} cy={-18} r={44} fill={COLORS.cream} opacity={0.6} />
    <ellipse cx={0} cy={-2} rx={36} ry={24} fill={COLORS.golden} opacity={0.85} />
    <path d="M -24 -40 Q -32 -22 -26 -6" stroke={COLORS.cream} strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.9} />
  </g>
);

/** Where the spray comes out, relative to the hand. */
export const NOZZLE = { x: -40, y: -86 };

export const VelvetWoman: React.FC<{ frame: number; lift: number; squeeze: number; eyesClosed: number }> = ({ frame, lift, squeeze, eyesClosed }) => {
  const hand = lerp2([-80, -40], [-180, -300], lift);
  return (
    <g>
      {/* short golden bob, behind the head (no bun) */}
      <rect x={-104} y={-404} width={208} height={168} rx={80} fill={COLORS.golden} />
      {/* velvet dress with a soft sheen */}
      <path d="M -60 -224 C -144 -218 -154 -150 -154 -60 L -154 40 L 154 40 L 154 -60 C 154 -150 144 -218 60 -224 Z" fill={COLORS.deepRed} />
      <path d="M -110 -170 Q -70 -110 -96 -20" stroke={COLORS.creamShade} strokeWidth={18} strokeLinecap="round" fill="none" opacity={0.16} />
      <path d="M 104 -160 Q 120 -110 112 -40" stroke={COLORS.creamShade} strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.12} />
      <path d="M -54 -222 Q 0 -170 54 -222 Z" fill={COLORS.creamShade} />
      <rect x={-24} y={-254} width={48} height={42} rx={20} fill={COLORS.creamShade} />
      <circle cx={0} cy={-314} r={82} fill={COLORS.creamShade} />
      <path d="M -86 -300 C -96 -414 96 -414 86 -300 C 70 -346 40 -360 0 -360 C -40 -360 -70 -346 -86 -300 Z" fill={COLORS.golden} />
      <g transform="translate(0 -314)">
        <Face r={82} frame={frame} seed={63} smile={0.6 + eyesClosed * 0.3} closed={eyesClosed} />
      </g>
      <Arm from={[118, -190]} to={[70, -40]} bend={40} color={COLORS.deepRed} />
      <g transform={`translate(${hand[0]} ${hand[1]})`}>
        <MistBottle squeeze={squeeze} />
      </g>
      <Arm from={[-118, -190]} to={hand} bend={-40} color={COLORS.deepRed} />
    </g>
  );
};

/* ---------- Small boy with spiky hair (feet at origin, about 440 tall) ---------- */
const spikyHair = (r: number) => {
  const n = 11;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (i / n) * Math.PI;
    const rad = i === 0 || i === n ? r * 0.98 : i % 2 === 1 ? r * 1.4 : r * 1.02;
    pts.push(`${(Math.cos(a) * rad).toFixed(1)} ${(Math.sin(a) * rad).toFixed(1)}`);
  }
  return `M ${pts[0]} L ${pts.slice(1).join(" L ")} Q 0 ${-r * 0.42} ${pts[0]} Z`;
};

export const Boy: React.FC<{ frame: number; walk: number; phase: number; offer: number }> = ({ frame, walk, phase, offer }) => {
  const swing = Math.sin(phase) * 16 * walk;
  const bob = -Math.abs(Math.sin(phase)) * 7 * walk;
  const handL = lerp2([-92, -140], [-34, -205], offer);
  const handR = lerp2([92, -140], [34, -205], offer);
  const r = 72;
  return (
    <g>
      <ellipse cx={0} cy={6} rx={105} ry={18} fill={COLORS.brownDark} opacity={0.18} />
      <g transform={`translate(0 ${bob})`}>
        {[-1, 1].map((s) => (
          <g key={s} transform={`rotate(${s * swing} ${s * 30} -125)`}>
            <rect x={s * 30 - 20} y={-135} width={40} height={128} rx={20} fill={COLORS.brownDark} />
            <ellipse cx={s * 36} cy={-8} rx={30} ry={14} fill={COLORS.brown} />
          </g>
        ))}
        <path d="M -60 -290 C -96 -286 -104 -250 -104 -210 L -104 -140 Q -104 -110 -74 -110 L 74 -110 Q 104 -110 104 -140 L 104 -210 C 104 -250 96 -286 60 -290 Z" fill={COLORS.burntOrange} />
        <rect x={-104} y={-200} width={208} height={26} rx={13} fill={COLORS.cream} opacity={0.75} />
        {[[-1, handL], [1, handR]].map(([s, h]) => {
          const hh = h as [number, number];
          const ss = s as number;
          return (
            <g key={ss}>
              <path d={`M ${ss * 84} -270 Q ${ss * 118} -${200 - 30 * offer} ${hh[0]} ${hh[1]}`} stroke={COLORS.burntOrange} strokeWidth={34} strokeLinecap="round" fill="none" />
              <circle cx={hh[0]} cy={hh[1]} r={18} fill={COLORS.creamShade} />
            </g>
          );
        })}
        <rect x={-20} y={-316} width={40} height={34} rx={16} fill={COLORS.creamShade} />
        <circle cx={0} cy={-358} r={r} fill={COLORS.creamShade} />
        <g transform={`translate(0 -358)`}>
          <path d={spikyHair(r)} fill={COLORS.golden} stroke={COLORS.golden} strokeWidth={16} strokeLinejoin="round" />
          <Face r={r} frame={frame} seed={81} smile={0.9} />
        </g>
      </g>
    </g>
  );
};
