import React from "react";
import { random, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

/** Night sky inside a rectangle: gradient, 4-point stars with a slow twinkle, and a moon. */
export const NightSky: React.FC<{
  id: string;
  x?: number;
  y?: number;
  w: number;
  h: number;
  moon?: { x: number; y: number; r: number } | null;
  stars?: number;
  starBand?: number;
}> = ({ id, x = 0, y = 0, w, h, moon, stars = 40, starBand = 0.5 }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.brownDark} />
          <stop offset="60%" stopColor={COLORS.brown} />
          <stop offset="100%" stopColor={COLORS.deepRed} />
        </linearGradient>
        <radialGradient id={`${id}-moon`}>
          <stop offset="0%" stopColor={COLORS.cream} stopOpacity={0.9} />
          <stop offset="100%" stopColor={COLORS.cream} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-sky)`} />
      {new Array(stars).fill(0).map((_, i) => {
        const r = (k: string) => random(`${id}-star-${i}-${k}`);
        const sx = x + w * (0.05 + r("x") * 0.9);
        const sy = y + h * (0.03 + r("y") * starBand);
        const s = 5 + r("s") * 7;
        const tw = 0.45 + 0.35 * Math.sin(frame * 0.05 + r("p") * 6.28);
        return (
          <path
            key={i}
            transform={`translate(${sx} ${sy})`}
            d={`M 0 ${-s} Q 2 -2 ${s} 0 Q 2 2 0 ${s} Q -2 2 ${-s} 0 Q -2 -2 0 ${-s} Z`}
            fill={i % 4 === 0 ? COLORS.goldenLight : COLORS.cream}
            opacity={tw}
          />
        );
      })}
      {moon && (
        <g>
          <circle cx={moon.x} cy={moon.y} r={moon.r * 2.4} fill={`url(#${id}-moon)`} opacity={0.45} />
          <circle cx={moon.x} cy={moon.y} r={moon.r} fill={COLORS.cream} opacity={0.92} />
          <circle cx={moon.x - moon.r * 0.3} cy={moon.y - moon.r * 0.15} r={moon.r * 0.18} fill={COLORS.creamShade} />
          <circle cx={moon.x + moon.r * 0.28} cy={moon.y + moon.r * 0.3} r={moon.r * 0.12} fill={COLORS.creamShade} />
        </g>
      )}
    </g>
  );
};
