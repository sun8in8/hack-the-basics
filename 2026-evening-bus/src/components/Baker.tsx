import React from "react";
import { COLORS } from "../theme";
import { Eye, Smile, blink } from "./Face";

/**
 * A baker behind a counter, kneading dough, inside a lit window.
 * Origin = centre of the window (window is 600 × 560: x ±300, y ±280).
 */
export const Baker: React.FC<{ frame: number }> = ({ frame }) => {
  const push = Math.sin(frame * 0.12); // slow press-and-fold
  const p = 0.5 + 0.5 * push;
  const lid = blink(frame, 30);
  const bob = p * 10;
  return (
    <g>
      {/* shelf with loaves */}
      <rect x={-270} y={-170} width={540} height={18} rx={9} fill={COLORS.deepRed} />
      {[-200, -90, 90, 200].map((lx, i) => (
        <g key={lx}>
          <ellipse cx={lx} cy={-196} rx={44} ry={28} fill={i % 2 ? COLORS.burntOrange : COLORS.golden} />
          <path d={`M ${lx - 18} -208 Q ${lx - 12} -198 ${lx - 6} -208 M ${lx + 6} -208 Q ${lx + 12} -198 ${lx + 18} -208`} stroke={COLORS.goldenLight} strokeWidth={5} strokeLinecap="round" fill="none" />
        </g>
      ))}
      <g transform={`translate(0 ${bob * 0.6})`}>
        {/* body: shirt + apron */}
        <path d="M -150 280 L -150 80 C -150 10 -100 -20 0 -20 C 100 -20 150 10 150 80 L 150 280 Z" fill={COLORS.burntOrange} />
        <path d="M -90 280 L -90 40 C -90 20 -70 12 -50 12 L 50 12 C 70 12 90 20 90 40 L 90 280 Z" fill={COLORS.cream} />
        {/* head */}
        <rect x={-24} y={-60} width={48} height={50} rx={18} fill={COLORS.creamShade} />
        <circle cx={0} cy={-100} r={70} fill={COLORS.creamShade} />
        <ellipse cx={-66} cy={-96} rx={14} ry={20} fill={COLORS.brownDark} />
        <ellipse cx={66} cy={-96} rx={14} ry={20} fill={COLORS.brownDark} />
        {/* baker's hat */}
        <rect x={-62} y={-170} width={124} height={34} rx={14} fill={COLORS.cream} />
        <circle cx={-38} cy={-190} r={36} fill={COLORS.cream} />
        <circle cx={38} cy={-190} r={36} fill={COLORS.cream} />
        <circle cx={0} cy={-206} r={42} fill={COLORS.cream} />
        <Eye x={-25} y={-92} closed={Math.max(lid, 0.45)} s={0.85} />
        <Eye x={25} y={-92} closed={Math.max(lid, 0.45)} s={0.85} />
        <ellipse cx={-42} cy={-68} rx={13} ry={9} fill={COLORS.burntOrange} opacity={0.45} />
        <ellipse cx={42} cy={-68} rx={13} ry={9} fill={COLORS.burntOrange} opacity={0.45} />
        <Smile x={0} y={-62} w={24} depth={9} />
      </g>
      {/* counter */}
      <rect x={-300} y={180} width={600} height={100} fill={COLORS.brown} />
      <rect x={-300} y={172} width={600} height={22} rx={11} fill={COLORS.deepRed} />
      {/* dough */}
      <ellipse cx={0} cy={170 - 4 * p} rx={110 + 18 * p} ry={44 - 8 * p} fill={COLORS.golden} />
      <ellipse cx={-30} cy={156 - 4 * p} rx={34} ry={10} fill={COLORS.goldenLight} opacity={0.8} />
      {/* arms pressing the dough */}
      {[-1, 1].map((side) => (
        <g key={side}>
          <path
            d={`M ${side * 118} ${40 + bob * 0.6} C ${side * 130} ${110} ${side * 90} ${130 + bob} ${side * (46 + 6 * p)} ${136 + bob}`}
            stroke={COLORS.burntOrange}
            strokeWidth={56}
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={side * (40 + 6 * p)} cy={140 + bob} r={28} fill={COLORS.creamShade} />
        </g>
      ))}
    </g>
  );
};
