import React from "react";
import { COLORS } from "../theme";

type Props = {
  x: number;
  y: number;
  /** 0 = standing still, 1 = full walk cycle */
  walk: number;
  /** walk cycle phase (radians) */
  phase: number;
  /** 0 = rest, 1 = full in-breath stretch */
  breath: number;
  /** blanket cape opacity 0..1 */
  blanket?: number;
  /** 0 = blanket flaps open, 1 = flaps crossed in a hug */
  wrap?: number;
};

const Stripes: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    {[0.25, 0.5, 0.75].map((t) => (
      <line key={t} x1={x + w * t} y1={y + 24} x2={x + w * t} y2={y + h - 24} stroke={COLORS.creamShade} strokeWidth={12} strokeLinecap="round" opacity={0.8} />
    ))}
  </g>
);

/**
 * "You": a plain adult figure with no face, no hair bun. Feet at (x, y).
 * Local box: about 720 tall, feet at 0.
 */
export const Walker: React.FC<Props> = ({ x, y, walk, phase, breath, blanket = 0, wrap = 0 }) => {
  const swing = Math.sin(phase) * 16 * walk;
  const bob = -Math.abs(Math.sin(phase)) * 9 * walk;
  const sy = 1 + 0.24 * breath;
  const sx = 1 - 0.07 * breath;
  const armSwing = -swing * 0.8;
  const armOut = breath * 18;
  const flap = 18 - 40 * wrap; // degrees: open outward → crossed

  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={6} rx={160} ry={24} fill={COLORS.brownDark} opacity={0.18} />
      <g transform={`scale(${sx} ${sy}) translate(0 ${bob})`}>
        {/* legs */}
        {[-1, 1].map((s) => (
          <g key={s} transform={`rotate(${s * swing} ${s * 44} -190)`}>
            <rect x={s * 44 - 24} y={-200} width={48} height={190} rx={24} fill={COLORS.brownDark} />
            <ellipse cx={s * 44 + s * 8} cy={-10} rx={38} ry={18} fill={COLORS.brown} />
          </g>
        ))}
        {/* arms (behind the coat edge) */}
        {[-1, 1].map((s) => (
          <g key={s} transform={`rotate(${s * armSwing - s * armOut} ${s * 125} -505)`}>
            <path d={`M ${s * 125} -505 Q ${s * 190} -420 ${s * 185} -290`} stroke={COLORS.golden} strokeWidth={48} strokeLinecap="round" fill="none" />
            <circle cx={s * 185} cy={-270} r={24} fill={COLORS.creamShade} />
          </g>
        ))}
        {/* coat */}
        <path
          d="M -95 -548 C -135 -540 -150 -500 -150 -440 L -172 -205 Q -174 -165 -132 -165 L 132 -165 Q 174 -165 172 -205 L 150 -440 C 150 -500 135 -540 95 -548 Q 0 -562 -95 -548 Z"
          fill={COLORS.golden}
        />
        <path d="M 0 -540 L 0 -175" stroke={COLORS.burntOrange} strokeWidth={6} strokeLinecap="round" opacity={0.35} />
        {[-470, -390, -310].map((by) => (
          <circle key={by} cx={18} cy={by} r={9} fill={COLORS.burntOrange} />
        ))}
        {/* neck + scarf */}
        <rect x={-26} y={-590} width={52} height={50} rx={22} fill={COLORS.creamShade} />
        <rect x={-92} y={-572} width={184} height={50} rx={25} fill={COLORS.burntOrange} />
        <rect x={34} y={-540} width={46} height={150} rx={23} fill={COLORS.burntOrange} />
        {/* head: no face, short hair, no bun */}
        <circle cx={0} cy={-640} r={74} fill={COLORS.creamShade} />
        <path d="M -76 -632 C -80 -735 80 -735 76 -632 Q 52 -672 0 -676 Q -52 -672 -76 -632 Z" fill={COLORS.brownDark} />

        {/* blanket that hugs back */}
        {blanket > 0 && (
          <g opacity={blanket}>
            <path
              d="M -130 -590 Q 0 -630 130 -590 Q 182 -565 186 -480 L 194 -255 Q 194 -215 156 -215 L -156 -215 Q -194 -215 -194 -255 L -186 -480 Q -182 -565 -130 -590 Z"
              fill={COLORS.burntOrange}
            />
            <Stripes x={-194} y={-590} w={388} h={375} />
            {[-1, 1].map((s) => (
              <g key={s} transform={`rotate(${-s * flap} ${s * 130} -585)`}>
                <rect x={s > 0 ? 60 : -200} y={-600} width={140} height={350} rx={56} fill={COLORS.burntOrange} />
                <line x1={s * 130} y1={-560} x2={s * 130} y2={-290} stroke={COLORS.creamShade} strokeWidth={12} strokeLinecap="round" opacity={0.8} />
                <rect x={s > 0 ? 70 : -190} y={-282} width={120} height={26} rx={13} fill={COLORS.creamShade} opacity={0.9} />
              </g>
            ))}
          </g>
        )}
      </g>
    </g>
  );
};

/** The folded blanket on its own (on the counter, or floating over to you). Centred at (x, y). */
export const FoldedBlanket: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; color?: string }> = ({ x, y, w, h, rot = 0, color = COLORS.burntOrange }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={Math.min(h / 2, 40)} fill={color} />
    {[0.25, 0.5, 0.75].map((t) => (
      <line key={t} x1={-w / 2 + w * t} y1={-h / 2 + Math.min(14, h * 0.2)} x2={-w / 2 + w * t} y2={h / 2 - Math.min(14, h * 0.2)} stroke={COLORS.creamShade} strokeWidth={10} strokeLinecap="round" opacity={0.8} />
    ))}
  </g>
);
