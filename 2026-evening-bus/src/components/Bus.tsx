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
            <g>
              <path d={`M ${winX(i) + 30} -210 C ${winX(i) + 30} -255 ${winX(i) + 100} -255 ${winX(i) + 100} -210 Z`} fill={COLORS.brown} />
              <circle cx={winX(i) + 62} cy={-270} r={28} fill={COLORS.deepRed} />
              <path d={`M ${winX(i) + 40} -268 C ${winX(i) + 40} -310 ${winX(i) + 90} -310 ${winX(i) + 92} -262 L ${winX(i) + 94} -238 C ${winX(i) + 84} -232 ${winX(i) + 78} -240 ${winX(i) + 76} -262 Z`} fill={COLORS.brownDark} />
            </g>
          )}
          {i === 3 && (
            <g transform={`rotate(-16 ${winX(i) + 70} -222)`}>
              <path d={`M ${winX(i) + 34} -210 C ${winX(i) + 34} -255 ${winX(i) + 104} -255 ${winX(i) + 104} -210 Z`} fill={COLORS.deepRed} />
              <circle cx={winX(i) + 66} cy={-270} r={27} fill={COLORS.deepRed} />
              <circle cx={winX(i) + 92} cy={-276} r={13} fill={COLORS.brownDark} />
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
