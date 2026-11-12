import React from "react";
import { COLORS } from "../theme";
import { Eye, Smile, blink } from "./Face";

/**
 * Dad reading to a sleepy child tucked up in bed, inside a lit window.
 * Origin = centre of the window (620 × 520: x ±310, y ±260). `sleepy` 0..1 closes the child's eyes.
 */
/** Both characters have brown skin. */
const SKIN = COLORS.deepRed;

/** Dad's spiky hair: rounded tips via a same-colour stroke with round joins. */
const SPIKES = "M -252 -100 C -256 -140 -236 -160 -226 -164 L -232 -186 L -206 -168 L -196 -194 L -180 -170 L -160 -190 L -156 -164 L -134 -172 C -122 -150 -124 -124 -128 -100 C -150 -128 -226 -130 -252 -100 Z";

export const DadAndChild: React.FC<{ frame: number; sleepy: number }> = ({ frame, sleepy }) => {
  const dadLid = Math.max(blink(frame, 50), 0.35);
  const childLid = Math.max(sleepy, blink(frame, 10));
  const page = Math.sin(frame * 0.05) * 3;
  return (
    <g>
      {/* bed */}
      <rect x={-40} y={150} width={340} height={110} rx={30} fill={COLORS.brown} />
      <rect x={-60} y={40} width={36} height={220} rx={18} fill={COLORS.brown} />
      <ellipse cx={30} cy={120} rx={78} ry={44} fill={COLORS.cream} />
      {/* child */}
      <g transform={`rotate(${-8 + sleepy * 6} 40 90)`}>
        <circle cx={40} cy={84} r={52} fill={SKIN} />
        <path d="M -6 70 C -10 20 50 10 84 40 C 70 44 40 36 20 50 C 8 58 0 66 -6 70 Z" fill={COLORS.brownDark} />
        <Eye x={28} y={86} closed={childLid} s={0.8} />
        <Eye x={64} y={84} closed={childLid} s={0.8} />
        <ellipse cx={18} cy={106} rx={11} ry={8} fill={COLORS.burntOrange} opacity={0.45} />
        <ellipse cx={76} cy={104} rx={11} ry={8} fill={COLORS.burntOrange} opacity={0.45} />
        <Smile x={46} y={112} w={14} depth={4 + 2 * sleepy} />
      </g>
      {/* blanket */}
      <path d="M 60 140 C 60 116 90 110 120 112 L 280 112 C 300 112 310 124 310 140 L 310 220 L 60 220 Z" fill={COLORS.golden} />
      <rect x={64} y={124} width={70} height={30} rx={15} fill={COLORS.cream} />
      <rect x={60} y={150} width={250} height={14} rx={7} fill={COLORS.goldenLight} opacity={0.7} />
      {/* dad, sitting at the bedside */}
      <path d="M -300 260 L -300 60 C -300 0 -260 -20 -190 -20 C -120 -20 -80 0 -80 60 L -80 260 Z" fill={COLORS.brown} />
      <rect x={-212} y={-60} width={44} height={50} rx={18} fill={SKIN} />
      <circle cx={-190} cy={-100} r={64} fill={SKIN} />
      <path d={SPIKES} fill={COLORS.brownDark} stroke={COLORS.brownDark} strokeWidth={14} strokeLinejoin="round" />
      <Eye x={-212} y={-94} closed={dadLid} s={0.85} />
      <Eye x={-168} y={-94} closed={dadLid} s={0.85} />
      <ellipse cx={-226} cy={-70} rx={12} ry={8} fill={COLORS.burntOrange} opacity={0.45} />
      <ellipse cx={-154} cy={-70} rx={12} ry={8} fill={COLORS.burntOrange} opacity={0.45} />
      <Smile x={-190} y={-62} w={24} depth={8} />
      {/* open book */}
      <g transform={`translate(-150 70) rotate(${-10 + page})`}>
        <path d="M -90 -50 Q -45 -64 0 -46 Q 45 -64 90 -50 L 90 40 Q 45 26 0 44 Q -45 26 -90 40 Z" fill={COLORS.burntOrange} stroke={COLORS.burntOrange} strokeWidth={10} strokeLinejoin="round" />
        <path d="M -80 -46 Q -40 -58 0 -40 L 0 36 Q -40 20 -80 32 Z" fill={COLORS.cream} />
        <path d="M 80 -46 Q 40 -58 0 -40 L 0 36 Q 40 20 80 32 Z" fill={COLORS.creamShade} />
      </g>
      {/* hands holding the book */}
      <circle cx={-236} cy={86} r={24} fill={SKIN} />
      <circle cx={-64} cy={56} r={24} fill={SKIN} />
    </g>
  );
};
