import React from "react";
import { useVideoConfig } from "remotion";
import { COLORS } from "../theme";

export type Moon = { x: number; y: number; r: number; opacity?: number };

type Props = {
  /** 0 = late afternoon, 1 = warm evening (sky deepens to orange). */
  dusk: number;
  moon?: Moon;
};

const Tree: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-14} y={-40} width={28} height={140} rx={14} fill={COLORS.brown} />
    <circle cx={0} cy={-110} r={95} fill={color} />
    <circle cx={-70} cy={-60} r={60} fill={color} />
    <circle cx={70} cy={-60} r={60} fill={color} />
    <circle cx={-30} cy={-140} r={30} fill={COLORS.cream} opacity={0.18} />
  </g>
);

/**
 * The style-guide landscape (§6.4) laid out by proportion, so the same
 * scene works in the 960×1080 split panel and the 1920×1080 full frame.
 * Ground starts at ~74% height; the bottom 15% is plain ground only.
 */
export const Landscape: React.FC<Props> = ({ dusk, moon }) => {
  const { width: w, height: h } = useVideoConfig();
  const wide = w > h;
  const Y = (f: number) => f * h;
  const X = (f: number) => f * w;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.cream} />
          <stop offset="70%" stopColor={COLORS.goldenLight} />
        </linearGradient>
        <linearGradient id="duskSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.golden} />
          <stop offset="75%" stopColor={COLORS.burntOrange} />
        </linearGradient>
        <radialGradient id="moonGlow">
          <stop offset="0%" stopColor={COLORS.cream} stopOpacity={0.9} />
          <stop offset="100%" stopColor={COLORS.cream} stopOpacity={0} />
        </radialGradient>
      </defs>

      <rect width={w} height={h} fill="url(#sky)" />
      <rect width={w} height={h} fill="url(#duskSky)" opacity={dusk * 0.55} />

      {moon && (
        <g opacity={moon.opacity ?? 1}>
          <circle cx={moon.x} cy={moon.y} r={moon.r * 2.4} fill="url(#moonGlow)" opacity={0.6} />
          <circle cx={moon.x} cy={moon.y} r={moon.r} fill={COLORS.cream} opacity={0.95} />
          {/* two soft craters keep it reading as a moon, not a sun */}
          <circle cx={moon.x - moon.r * 0.3} cy={moon.y - moon.r * 0.15} r={moon.r * 0.18} fill={COLORS.creamShade} />
          <circle cx={moon.x + moon.r * 0.28} cy={moon.y + moon.r * 0.3} r={moon.r * 0.12} fill={COLORS.creamShade} />
        </g>
      )}

      {/* far hills */}
      <path
        d={`M 0 ${Y(0.6)} C ${X(0.19)} ${Y(0.52)} ${X(0.39)} ${Y(0.53)} ${X(0.56)} ${Y(0.57)} C ${X(0.7)} ${Y(0.61)} ${X(0.87)} ${Y(0.54)} ${w} ${Y(0.56)} L ${w} ${h} L 0 ${h} Z`}
        fill={COLORS.golden}
      />
      <Tree x={X(0.12)} y={Y(0.58)} s={wide ? 0.8 : 0.7} color={COLORS.burntOrange} />
      <Tree x={X(0.9)} y={Y(0.575)} s={wide ? 0.65 : 0.55} color={COLORS.deepRed} />
      {wide && <Tree x={X(0.33)} y={Y(0.555)} s={0.5} color={COLORS.deepRed} />}

      {/* near hills */}
      <path
        d={`M 0 ${Y(0.69)} C ${X(0.22)} ${Y(0.64)} ${X(0.43)} ${Y(0.66)} ${X(0.6)} ${Y(0.685)} C ${X(0.78)} ${Y(0.71)} ${X(0.9)} ${Y(0.66)} ${w} ${Y(0.67)} L ${w} ${h} L 0 ${h} Z`}
        fill={COLORS.burntOrange}
      />
      <Tree x={X(wide ? 0.04 : 0.06)} y={Y(0.7)} s={wide ? 1 : 0.9} color={COLORS.golden} />
      {wide && <Tree x={X(0.7)} y={Y(0.7)} s={0.75} color={COLORS.golden} />}

      {/* ground */}
      <path d={`M 0 ${Y(0.77)} C ${X(0.28)} ${Y(0.735)} ${X(0.72)} ${Y(0.735)} ${w} ${Y(0.77)} L ${w} ${h} L 0 ${h} Z`} fill={COLORS.deepRed} />
      <path d={`M 0 ${Y(0.84)} C ${X(0.3)} ${Y(0.81)} ${X(0.7)} ${Y(0.81)} ${w} ${Y(0.84)} L ${w} ${h} L 0 ${h} Z`} fill={COLORS.brown} />
    </svg>
  );
};
