import React from "react";
import { COLORS, HEIGHT, WIDTH } from "../theme";

export const HORIZON = 1060;
export const LAMP = { x: 230, y: 735 };

type Boat = { x: number; y: number; scale: number; facing?: 1 | -1; opacity?: number };

type Props = {
  frame: number;
  /** Show the lighthouse on its rocks (off for the view through the window). */
  lighthouse?: boolean;
  /** 0 = lamp dark, 1 = lamp glowing. */
  lamp?: number;
  /** Beam: opacity 0..1, length in px, angle in degrees (0 = pointing right). */
  beam?: { opacity: number; length: number; angle: number };
  boat?: Boat;
};

/** A sailing boat: rounded hull, cream sails. (0, 0) is the waterline centre. */
export const SailBoat: React.FC<Boat & { frame: number }> = ({ x, y, scale, facing = 1, opacity = 1, frame }) => {
  const bob = Math.sin(frame * 0.08) * 6;
  const rock = Math.sin(frame * 0.06) * 3;
  return (
    <g
      transform={`translate(${x} ${y + bob * scale}) scale(${scale * facing} ${scale}) rotate(${rock})`}
      opacity={opacity}
    >
      <path d="M 0 -6 L 0 -190" stroke={COLORS.brownDark} strokeWidth={9} strokeLinecap="round" />
      <path d="M 10 -22 L 10 -186 Q 70 -96 100 -26 Z" fill={COLORS.cream} strokeLinejoin="round" stroke={COLORS.cream} strokeWidth={8} />
      <path d="M -10 -28 L -10 -150 Q -46 -80 -78 -32 Z" fill={COLORS.creamShade} strokeLinejoin="round" stroke={COLORS.creamShade} strokeWidth={8} />
      <path
        d="M -110 -10 L 120 -10 Q 96 40 0 42 Q -92 40 -110 -10 Z"
        fill={COLORS.burntOrange}
        strokeLinejoin="round"
        stroke={COLORS.burntOrange}
        strokeWidth={8}
      />
      <circle cx={-40} cy={10} r={8} fill={COLORS.goldenLight} />
      <circle cx={0} cy={10} r={8} fill={COLORS.goldenLight} />
      <path d="M -120 46 Q 0 62 130 46" stroke={COLORS.creamShade} strokeOpacity={0.5} strokeWidth={8} strokeLinecap="round" fill="none" />
    </g>
  );
};

/** Evening sea: dusk sky, the sun sinking into the water, gentle waves. Drawn as a <g>. */
export const Seascape: React.FC<Props> = ({ frame, lighthouse = true, lamp = 0, beam, boat }) => {
  const sunX = 760;
  return (
    <g>
      <defs>
        <linearGradient id="seaSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.cream} />
          <stop offset="55%" stopColor={COLORS.goldenLight} />
        </linearGradient>
        <linearGradient id="seaDusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.golden} />
          <stop offset="55%" stopColor={COLORS.burntOrange} />
        </linearGradient>
        <radialGradient id="seaSun">
          <stop offset="0%" stopColor={COLORS.cream} stopOpacity={0.9} />
          <stop offset="100%" stopColor={COLORS.cream} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="beamFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={COLORS.goldenLight} stopOpacity={0.9} />
          <stop offset="100%" stopColor={COLORS.goldenLight} stopOpacity={0} />
        </linearGradient>
        <clipPath id="towerClip">
          <path d="M 150 1310 L 178 820 L 282 820 L 310 1310 Z" />
        </clipPath>
      </defs>

      <rect width={WIDTH} height={HEIGHT} fill="url(#seaSky)" />
      <rect width={WIDTH} height={HEIGHT} fill="url(#seaDusk)" opacity={0.6} />

      <circle cx={sunX} cy={HORIZON} r={280} fill="url(#seaSun)" opacity={0.6} />
      <circle cx={sunX} cy={HORIZON + 30} r={110} fill={COLORS.cream} opacity={0.9} />

      {/* sea */}
      <rect x={0} y={HORIZON} width={WIDTH} height={HEIGHT - HORIZON} fill={COLORS.brown} />
      {/* sun's path on the water */}
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const w = 200 - k * 26;
        const yy = HORIZON + 28 + k * 34;
        const dx = Math.sin(frame * 0.05 + k) * 14;
        return (
          <path
            key={k}
            d={`M ${sunX - w / 2 + dx} ${yy} L ${sunX + w / 2 + dx} ${yy}`}
            stroke={COLORS.golden}
            strokeOpacity={0.75 - k * 0.1}
            strokeWidth={12}
            strokeLinecap="round"
          />
        );
      })}
      {/* waves */}
      {[
        [120, 1180, 120],
        [520, 1250, 150],
        [880, 1330, 130],
        [300, 1420, 170],
        [700, 1520, 190],
        [160, 1640, 200],
        [900, 1700, 200],
        [480, 1800, 220],
      ].map(([wx, wy, ww], k) => {
        const dx = Math.sin(frame * 0.03 + k * 1.7) * 18;
        return (
          <path
            key={k}
            d={`M ${wx - ww / 2 + dx} ${wy} Q ${wx - ww / 4 + dx} ${wy - 16} ${wx + dx} ${wy} Q ${wx + ww / 4 + dx} ${wy - 16} ${wx + ww / 2 + dx} ${wy}`}
            stroke={COLORS.deepRed}
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      })}

      {lighthouse && (
        <g>
          {/* rocks */}
          <path
            d="M -40 1920 L -40 1290 C 60 1230 270 1240 380 1330 C 450 1390 480 1470 520 1560 C 560 1660 600 1780 640 1920 Z"
            fill={COLORS.brownDark}
          />
          <path d="M 60 1400 Q 140 1370 220 1400" stroke={COLORS.brown} strokeWidth={14} strokeLinecap="round" fill="none" />
          <path d="M 260 1560 Q 330 1530 400 1570" stroke={COLORS.brown} strokeWidth={14} strokeLinecap="round" fill="none" />
          {/* tower */}
          <path d="M 150 1310 L 178 820 Q 230 810 282 820 L 310 1310 Z" fill={COLORS.cream} strokeLinejoin="round" stroke={COLORS.cream} strokeWidth={10} />
          <g clipPath="url(#towerClip)">
            <rect x={100} y={930} width={260} height={90} fill={COLORS.deepRed} />
            <rect x={100} y={1130} width={260} height={90} fill={COLORS.deepRed} />
          </g>
          <rect x={206} y={1236} width={48} height={74} rx={22} fill={COLORS.brown} />
          <circle cx={230} cy={1070} r={20} fill={lamp > 0.5 ? COLORS.goldenLight : COLORS.brown} />
          {/* gallery */}
          <rect x={150} y={790} width={160} height={32} rx={14} fill={COLORS.brownDark} />
          {/* lamp room */}
          <rect x={182} y={680} width={96} height={112} rx={22} fill={COLORS.brown} />
          <rect x={182} y={680} width={96} height={112} rx={22} fill={COLORS.goldenLight} opacity={lamp} />
          <path d="M 230 684 L 230 788" stroke={COLORS.brownDark} strokeWidth={8} strokeLinecap="round" />
          <path d="M 168 690 Q 230 604 292 690 Z" fill={COLORS.brownDark} strokeLinejoin="round" />
          <circle cx={230} cy={622} r={13} fill={COLORS.brownDark} />
        </g>
      )}

      {lighthouse && beam && beam.opacity > 0.001 && (
        <g transform={`translate(${LAMP.x} ${LAMP.y}) rotate(${beam.angle})`} opacity={beam.opacity}>
          <path
            d={`M 0 -26 L ${beam.length} ${-beam.length * 0.16} Q ${beam.length + 40} 0 ${beam.length} ${beam.length * 0.16} L 0 26 Z`}
            fill="url(#beamFade)"
          />
        </g>
      )}

      {lighthouse && lamp > 0.001 && (
        <circle cx={LAMP.x} cy={LAMP.y} r={170 * (1 + Math.sin(frame * 0.07) * 0.03)} fill="url(#flameGlow)" opacity={lamp} />
      )}

      {boat && <SailBoat {...boat} frame={frame} />}
    </g>
  );
};
