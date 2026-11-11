import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

/**
 * The oak's roots under the soil. `progress` lights them up gently from the
 * trunk outwards (a golden line travelling along each root), and `glow` sets
 * how warm the whole root system looks.
 */

type Root = { d: string; w: number; start: number; len: number };

/** start / len are fractions of the overall progress. */
const ROOTS: Root[] = [
  // main roots
  { d: "M 470 1340 C 430 1420 320 1450 220 1520 C 160 1560 110 1620 90 1690", w: 34, start: 0, len: 0.6 },
  { d: "M 500 1350 C 480 1460 400 1560 360 1700 C 350 1740 345 1780 340 1810", w: 30, start: 0.05, len: 0.62 },
  { d: "M 540 1350 C 545 1480 530 1620 545 1820", w: 38, start: 0, len: 0.66 },
  { d: "M 580 1350 C 600 1460 690 1560 720 1700 C 730 1750 735 1790 740 1815", w: 30, start: 0.05, len: 0.62 },
  { d: "M 610 1340 C 650 1420 760 1450 860 1520 C 920 1560 970 1620 990 1690", w: 34, start: 0, len: 0.6 },
  { d: "M 420 1340 C 340 1360 230 1370 120 1400", w: 22, start: 0.08, len: 0.45 },
  { d: "M 660 1340 C 740 1360 850 1370 960 1400", w: 22, start: 0.08, len: 0.45 },
  // smaller roots branching off
  { d: "M 220 1520 C 210 1560 205 1600 200 1650", w: 16, start: 0.32, len: 0.35 },
  { d: "M 360 1700 C 330 1730 300 1755 270 1770", w: 14, start: 0.5, len: 0.3 },
  { d: "M 539 1559 C 575 1600 610 1630 650 1650", w: 16, start: 0.34, len: 0.34 },
  { d: "M 539 1559 C 505 1600 470 1630 440 1650", w: 16, start: 0.34, len: 0.34 },
  { d: "M 720 1700 C 750 1730 780 1755 810 1770", w: 14, start: 0.5, len: 0.3 },
  { d: "M 860 1520 C 870 1560 875 1600 880 1650", w: 16, start: 0.32, len: 0.35 },
  { d: "M 90 1690 C 80 1720 75 1740 70 1760", w: 10, start: 0.58, len: 0.25 },
  { d: "M 990 1690 C 1000 1720 1005 1740 1010 1760", w: 10, start: 0.58, len: 0.25 },
  { d: "M 300 1460 C 270 1480 240 1480 205 1470", w: 12, start: 0.2, len: 0.3 },
  { d: "M 780 1460 C 810 1480 840 1480 875 1470", w: 12, start: 0.2, len: 0.3 },
];

/** Places where little golden sparkles twinkle when she feels most alive. */
const SPARKLES: [number, number, number][] = [
  [200, 1650, 16], [270, 1770, 13], [440, 1650, 15], [650, 1650, 15], [810, 1770, 13],
  [880, 1650, 16], [90, 1690, 14], [990, 1690, 14], [120, 1400, 12], [960, 1400, 12],
  [545, 1740, 18], [205, 1470, 11], [875, 1470, 11],
];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type Props = {
  /** 0..1 how clearly the roots show through the soil */
  reveal: number;
  /** 0..1 how far the light has travelled along the roots */
  progress: number;
  /** overall warmth of the light (0..~1.3) */
  glow: number;
  /** 0..1 twinkling sparkles */
  sparkle: number;
};

export const Roots: React.FC<Props> = ({ reveal, progress, glow, sparkle }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <defs>
        <filter id="rootGlow" filterUnits="userSpaceOnUse" x={0} y={1200} width={1080} height={720}>
          <feGaussianBlur stdDeviation={12} />
        </filter>
        <radialGradient id="soilGlow">
          <stop offset="0%" stopColor={COLORS.goldenLight} stopOpacity={0.85} />
          <stop offset="100%" stopColor={COLORS.goldenLight} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* a warm glow spreading through the soil */}
      <ellipse cx={540} cy={1580} rx={560} ry={300} fill="url(#soilGlow)" opacity={clamp01(glow) * 0.38} />

      {/* the roots themselves */}
      <g opacity={reveal}>
        {ROOTS.map((r, i) => (
          <path key={i} d={r.d} stroke={COLORS.deepRed} strokeWidth={r.w} strokeLinecap="round" fill="none" />
        ))}
      </g>

      {/* soft halo, then the bright line, both travelling along each root */}
      {[true, false].map((halo) => (
        <g key={String(halo)} filter={halo ? "url(#rootGlow)" : undefined}>
          {ROOTS.map((r, i) => {
            const lit = clamp01((progress - r.start) / r.len);
            if (lit <= 0.005) return null;
            return (
              <path
                key={i}
                d={r.d}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - lit}
                stroke={halo ? COLORS.goldenLight : COLORS.golden}
                strokeWidth={halo ? r.w + 26 : r.w * 0.42}
                strokeOpacity={halo ? Math.min(1, glow) * 0.45 : Math.min(1, glow) * 0.85}
                strokeLinecap="round"
                fill="none"
              />
            );
          })}
        </g>
      ))}

      {sparkle > 0.001 &&
        SPARKLES.map(([x, y, s], i) => {
          const tw = 0.55 + 0.4 * Math.sin(frame * 0.08 + i * 1.7);
          return (
            <path
              key={i}
              transform={`translate(${x} ${y}) rotate(${frame * 0.4 + i * 20})`}
              d={`M 0 ${-s} Q 3 -3 ${s} 0 Q 3 3 0 ${s} Q -3 3 ${-s} 0 Q -3 -3 0 ${-s} Z`}
              fill={COLORS.goldenLight}
              opacity={tw * sparkle}
            />
          );
        })}
    </g>
  );
};
