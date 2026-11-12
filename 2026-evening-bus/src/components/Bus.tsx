import React from "react";
import { COLORS } from "../theme";

/**
 * A rounded storybook bus, 920 wide, facing right. Origin = wheel line, centre.
 * `roll` is the distance travelled (turns the wheels). Window 1 has the lady, window 3 the nurse.
 */
export const Bus: React.FC<{ roll: number; id: string }> = ({ roll, id }) => {
  const winX = (i: number) => -400 + i * 150;
  const angle = roll / 62;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-body`}>
          <rect x={-460} y={-420} width={920} height={400} rx={80} />
        </clipPath>
        <radialGradient id={`${id}-lamp`}>
          <stop offset="0%" stopColor={COLORS.goldenLight} stopOpacity={0.85} />
          <stop offset="100%" stopColor={COLORS.goldenLight} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={50} rx={470} ry={26} fill={COLORS.brownDark} opacity={0.18} />
      <ellipse cx={560} cy={-90} rx={200} ry={110} fill={`url(#${id}-lamp)`} />
      <g clipPath={`url(#${id}-body)`}>
        <rect x={-460} y={-420} width={920} height={400} fill={COLORS.burntOrange} />
        <rect x={-460} y={-130} width={920} height={110} fill={COLORS.deepRed} />
        <rect x={-460} y={-420} width={920} height={34} fill={COLORS.golden} />
      </g>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={winX(i)} y={-360} width={130} height={150} rx={32} fill={COLORS.goldenLight} />
          {i === 1 && (
            <g transform={`translate(${winX(i) + 65} -210)`}>
              {/* the lady: full, shoulder-length hair */}
              <path d="M -44 0 C -52 -50 -50 -102 0 -104 C 50 -102 52 -50 44 0 Z" fill={COLORS.brownDark} />
              <path d="M -38 0 C -38 -36 38 -36 38 0 Z" fill={COLORS.brown} />
              <circle cx={0} cy={-62} r={25} fill={COLORS.deepRed} />
              <path d="M -30 -60 C -34 -98 34 -98 30 -60 C 14 -78 -14 -78 -30 -60 Z" fill={COLORS.brownDark} />
            </g>
          )}
          {i === 3 && (
            <g transform={`translate(${winX(i) + 65} -210)`}>
              {/* a passenger sitting up, hair in a bun */}
              <path d="M -38 0 C -38 -36 38 -36 38 0 Z" fill={COLORS.brown} />
              <circle cx={0} cy={-62} r={25} fill={COLORS.deepRed} />
              <path d="M -26 -62 C -28 -94 28 -94 26 -62 C 12 -76 -12 -76 -26 -62 Z" fill={COLORS.brownDark} />
              <circle cx={0} cy={-98} r={15} fill={COLORS.brownDark} />
            </g>
          )}
        </g>
      ))}
      <rect x={320} y={-370} width={120} height={200} rx={40} fill={COLORS.goldenLight} />
      <circle cx={438} cy={-80} r={20} fill={COLORS.golden} />
      {[-300, 290].map((wx) => (
        <g key={wx} transform={`translate(${wx} 0)`}>
          <circle r={64} fill={COLORS.brownDark} />
          <circle r={28} fill={COLORS.brown} />
          <circle cx={Math.cos(angle) * 42} cy={Math.sin(angle) * 42} r={8} fill={COLORS.deepRed} />
        </g>
      ))}
    </g>
  );
};
