import React from "react";
import { COLORS, HEIGHT, WIDTH } from "../theme";

type Props = {
  /** 0 = afternoon, 1 = warm dusk (sun lower, sky deeper) */
  dusk: number;
};

const Tree: React.FC<{ x: number; y: number; s: number; color: string }> = ({
  x,
  y,
  s,
  color,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-14} y={-40} width={28} height={140} rx={14} fill={COLORS.brown} />
    <circle cx={0} cy={-110} r={95} fill={color} />
    <circle cx={-70} cy={-60} r={60} fill={color} />
    <circle cx={70} cy={-60} r={60} fill={color} />
    <circle cx={-30} cy={-140} r={30} fill={COLORS.cream} opacity={0.18} />
  </g>
);

/** Static autumn landscape: warm sky, setting sun, rolling hills and trees. */
export const Background: React.FC<Props> = ({ dusk }) => {
  const sunY = 520 + dusk * 380;
  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0 }}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.cream} />
          <stop offset="70%" stopColor={COLORS.goldenLight} />
        </linearGradient>
        <linearGradient id="duskSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.golden} />
          <stop offset="75%" stopColor={COLORS.burntOrange} />
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop offset="0%" stopColor={COLORS.cream} stopOpacity={0.9} />
          <stop offset="100%" stopColor={COLORS.cream} stopOpacity={0} />
        </radialGradient>
      </defs>

      <rect width={WIDTH} height={HEIGHT} fill="url(#sky)" />
      <rect width={WIDTH} height={HEIGHT} fill="url(#duskSky)" opacity={dusk * 0.55} />

      {/* sun */}
      <circle cx={800} cy={sunY} r={260} fill="url(#sunGlow)" opacity={0.6} />
      <circle cx={800} cy={sunY} r={110} fill={COLORS.cream} opacity={0.9} />

      {/* far hills */}
      <path
        d={`M 0 1180 C 200 1040 420 1060 600 1140 C 760 1210 940 1080 ${WIDTH} 1100 L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`}
        fill={COLORS.golden}
      />
      <Tree x={150} y={1120} s={0.75} color={COLORS.burntOrange} />
      <Tree x={930} y={1110} s={0.6} color={COLORS.deepRed} />

      {/* near hills */}
      <path
        d={`M 0 1330 C 240 1240 460 1280 640 1320 C 820 1360 960 1270 ${WIDTH} 1290 L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`}
        fill={COLORS.burntOrange}
      />
      <Tree x={60} y={1330} s={0.95} color={COLORS.golden} />

      {/* ground */}
      <path
        d={`M 0 1500 C 300 1440 760 1440 ${WIDTH} 1500 L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`}
        fill={COLORS.deepRed}
      />
      <path
        d={`M 0 1590 C 320 1540 760 1540 ${WIDTH} 1590 L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`}
        fill={COLORS.brown}
      />
    </svg>
  );
};
