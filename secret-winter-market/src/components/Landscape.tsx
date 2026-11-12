import React from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

type Props = {
  /** 0 = day, 1 = night. Values in between give dusk; animate it slowly for day → night. */
  night: number;
  /** Optional lollipop trees on the hills (scenery, not characters). */
  trees?: boolean;
};

const Tree: React.FC<{ x: number; y: number; s: number; crown: string; trunk: string }> = ({ x, y, s, crown, trunk }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-14} y={-40} width={28} height={140} rx={14} fill={trunk} />
    <circle cx={0} cy={-110} r={95} fill={crown} />
    <circle cx={-70} cy={-60} r={60} fill={crown} />
    <circle cx={70} cy={-60} r={60} fill={crown} />
    <circle cx={-30} cy={-140} r={30} fill={COLORS.cream} opacity={0.15} />
  </g>
);

/**
 * Rolling-hills landscape laid out by proportion, so it works at any frame size.
 * Day: warm cream/golden sky with a sun. Night: brown/deep-red sky, moon and twinkling stars.
 * Hills start at ~55% height; the bottom 15% is plain ground only.
 */
export const Landscape: React.FC<Props> = ({ night, trees = true }) => {
  const frame = useCurrentFrame();
  const { width: w, height: h } = useVideoConfig();
  const X = (f: number) => f * w;
  const Y = (f: number) => f * h;
  const wide = w > h;
  const day = 1 - night;

  const far = `M 0 ${Y(0.6)} C ${X(0.19)} ${Y(0.52)} ${X(0.39)} ${Y(0.53)} ${X(0.56)} ${Y(0.57)} C ${X(0.7)} ${Y(0.61)} ${X(0.87)} ${Y(0.54)} ${w} ${Y(0.56)} L ${w} ${h} L 0 ${h} Z`;
  const near = `M 0 ${Y(0.69)} C ${X(0.22)} ${Y(0.64)} ${X(0.43)} ${Y(0.66)} ${X(0.6)} ${Y(0.685)} C ${X(0.78)} ${Y(0.71)} ${X(0.9)} ${Y(0.66)} ${w} ${Y(0.67)} L ${w} ${h} L 0 ${h} Z`;
  const ground = `M 0 ${Y(0.77)} C ${X(0.28)} ${Y(0.735)} ${X(0.72)} ${Y(0.735)} ${w} ${Y(0.77)} L ${w} ${h} L 0 ${h} Z`;
  const lower = `M 0 ${Y(0.84)} C ${X(0.3)} ${Y(0.81)} ${X(0.7)} ${Y(0.81)} ${w} ${Y(0.84)} L ${w} ${h} L 0 ${h} Z`;

  // Sun (day) and moon (night): centred-ish, never in the top corners.
  const orb = { x: X(wide ? 0.62 : 0.66), y: Y(wide ? 0.3 : 0.33), r: Math.min(w, h) * 0.1 };

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.cream} />
          <stop offset="70%" stopColor={COLORS.goldenLight} />
        </linearGradient>
        <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.brownDark} />
          <stop offset="60%" stopColor={COLORS.brown} />
          <stop offset="100%" stopColor={COLORS.deepRed} />
        </linearGradient>
        <radialGradient id="orbGlow">
          <stop offset="0%" stopColor={COLORS.cream} stopOpacity={0.9} />
          <stop offset="100%" stopColor={COLORS.cream} stopOpacity={0} />
        </radialGradient>
      </defs>

      <rect width={w} height={h} fill="url(#daySky)" />
      <rect width={w} height={h} fill="url(#nightSky)" opacity={night} />

      {/* stars (night only), slow twinkle */}
      {night > 0 &&
        new Array(40).fill(0).map((_, i) => {
          const r = (k: string) => random(`star-${i}-${k}`);
          const sx = X(0.06 + r("x") * 0.88);
          const sy = Y(0.04 + r("y") * 0.46);
          const s = 5 + r("s") * 7;
          const tw = 0.45 + 0.35 * Math.sin(frame * 0.05 + r("p") * 6.28);
          return (
            <path
              key={i}
              transform={`translate(${sx} ${sy})`}
              d={`M 0 ${-s} Q 2 -2 ${s} 0 Q 2 2 0 ${s} Q -2 2 ${-s} 0 Q -2 -2 0 ${-s} Z`}
              fill={i % 4 === 0 ? COLORS.goldenLight : COLORS.cream}
              opacity={tw * night}
            />
          );
        })}

      {/* sun by day, moon by night: same spot, crossfaded */}
      <circle cx={orb.x} cy={orb.y} r={orb.r * 2.4} fill="url(#orbGlow)" opacity={0.6 * day + 0.45 * night} />
      <circle cx={orb.x} cy={orb.y} r={orb.r} fill={COLORS.cream} opacity={0.92} />
      <g opacity={night}>
        <circle cx={orb.x - orb.r * 0.3} cy={orb.y - orb.r * 0.15} r={orb.r * 0.18} fill={COLORS.creamShade} />
        <circle cx={orb.x + orb.r * 0.28} cy={orb.y + orb.r * 0.3} r={orb.r * 0.12} fill={COLORS.creamShade} />
      </g>

      {/* day hills, then night hills faded over them */}
      {[
        { o: day, farC: COLORS.golden, nearC: COLORS.burntOrange, gC: COLORS.deepRed, lC: COLORS.brown, crownA: COLORS.burntOrange, crownB: COLORS.deepRed, crownC: COLORS.golden, trunk: COLORS.brown },
        { o: night, farC: COLORS.deepRed, nearC: COLORS.brown, gC: COLORS.brownDark, lC: COLORS.brownDark, crownA: COLORS.burntOrange, crownB: COLORS.brown, crownC: COLORS.deepRed, trunk: COLORS.brownDark },
      ].map((p, i) =>
        p.o <= 0 ? null : (
          <g key={i} opacity={p.o}>
            <path d={far} fill={p.farC} />
            {trees && <Tree x={X(0.12)} y={Y(0.58)} s={wide ? 0.8 : 0.7} crown={p.crownA} trunk={p.trunk} />}
            {trees && <Tree x={X(0.9)} y={Y(0.575)} s={wide ? 0.65 : 0.55} crown={p.crownB} trunk={p.trunk} />}
            <path d={near} fill={p.nearC} />
            {trees && <Tree x={X(0.06)} y={Y(0.7)} s={wide ? 1 : 0.9} crown={p.crownC} trunk={p.trunk} />}
            <path d={ground} fill={p.gC} />
            <path d={lower} fill={p.lC} />
          </g>
        ),
      )}
    </svg>
  );
};
