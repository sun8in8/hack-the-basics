import React from "react";
import { COLORS } from "../theme";
import { Eye, Smile } from "./Face";

/**
 * The nurse, facing us, head tilted to rest against the window on her right (our left).
 * Origin = centre of the head before tilting. `rest` 0..1 is a slow, sleepy breath.
 */
export const NurseResting: React.FC<{ rest: number; tilt?: number }> = ({ rest, tilt = -26 }) => (
  <g transform={`translate(0 ${-rest * 5})`}>
    {/* body */}
    <path d="M -160 900 L -160 260 C -160 160 -110 112 0 108 C 110 112 160 160 160 260 L 160 900 Z" fill={COLORS.deepRed} transform={`translate(0 ${rest * 5}) scale(${1 + rest * 0.015} 1)`} />
    <path d="M -64 112 Q -32 160 0 128 Q 32 160 64 112 Q 0 100 -64 112 Z" fill={COLORS.cream} />
    {/* arms folded on the lap, bag */}
    <path d="M -130 230 C -150 360 -120 420 -20 430" stroke={COLORS.brown} strokeWidth={70} strokeLinecap="round" fill="none" />
    <path d="M 130 230 C 150 360 120 420 20 430" stroke={COLORS.brown} strokeWidth={70} strokeLinecap="round" fill="none" />
    <rect x={-110} y={440} width={220} height={140} rx={46} fill={COLORS.cream} />
    <path d="M -60 444 Q 0 380 60 444" stroke={COLORS.creamShade} strokeWidth={14} strokeLinecap="round" fill="none" />
    <circle cx={-20} cy={432} r={28} fill={COLORS.creamShade} />
    <circle cx={22} cy={432} r={28} fill={COLORS.creamShade} />
    {/* head, tilted onto the glass */}
    <g transform={`rotate(${tilt} 0 100)`}>
      <rect x={-26} y={50} width={52} height={56} rx={20} fill={COLORS.creamShade} />
      <ellipse cx={0} cy={-8} rx={96} ry={96} fill={COLORS.brownDark} />
      <circle cx={-92} cy={-60} r={40} fill={COLORS.brownDark} />
      <rect x={-78} y={-48} width={26} height={22} rx={10} fill={COLORS.golden} transform="rotate(-30 -65 -37)" />
      <circle cx={0} cy={6} r={86} fill={COLORS.creamShade} />
      <path d="M -88 -6 C -92 -78 -30 -104 10 -100 C 60 -96 94 -66 90 -10 C 60 -50 20 -56 -10 -48 C -40 -40 -70 -28 -88 -6 Z" fill={COLORS.brownDark} />
      <Eye x={-32} y={10} closed={1} />
      <Eye x={32} y={10} closed={1} />
      <ellipse cx={-50} cy={38} rx={16} ry={10} fill={COLORS.burntOrange} opacity={0.45} />
      <ellipse cx={50} cy={38} rx={16} ry={10} fill={COLORS.burntOrange} opacity={0.45} />
      <Smile x={0} y={48} w={20} depth={5} />
    </g>
  </g>
);
