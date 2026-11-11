import React from "react";
import { COLORS } from "../theme";

/** A soft teardrop flame with a gentle flicker. Centre of its base at (x, y). */
export const Flame: React.FC<{
  x: number;
  y: number;
  size: number; // 0 = not lit, 1 = full
  frame: number;
  seed?: number;
}> = ({ x, y, size, frame, seed = 0 }) => {
  if (size <= 0.001) return null;
  const flick = 1 + Math.sin(frame * 0.23 + seed) * 0.05 + Math.sin(frame * 0.11 + seed * 2) * 0.03;
  const sway = Math.sin(frame * 0.09 + seed) * 4;
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway}) scale(${size} ${size * flick})`}>
      <path
        d="M 0 -62 C 22 -32 30 -8 27 6 C 24 26 -24 26 -27 6 C -30 -8 -22 -32 0 -62 Z"
        fill={COLORS.golden}
        strokeLinejoin="round"
      />
      <path
        d="M 0 -36 C 12 -18 16 -4 14 6 C 12 16 -12 16 -14 6 C -16 -4 -12 -18 0 -36 Z"
        fill={COLORS.goldenLight}
      />
      <ellipse cx={0} cy={8} rx={6} ry={8} fill={COLORS.cream} opacity={0.9} />
    </g>
  );
};

/** Warm glow halo behind a flame. Needs <GlowDefs/> in the same svg. */
export const Glow: React.FC<{ x: number; y: number; r: number; opacity: number; frame: number }> = ({
  x,
  y,
  r,
  opacity,
  frame,
}) =>
  opacity <= 0.001 ? null : (
    <circle
      cx={x}
      cy={y}
      r={r * (1 + Math.sin(frame * 0.07) * 0.03)}
      fill="url(#flameGlow)"
      opacity={opacity}
    />
  );

export const GlowDefs: React.FC = () => (
  <defs>
    <radialGradient id="flameGlow">
      <stop offset="0%" stopColor={COLORS.goldenLight} stopOpacity={0.85} />
      <stop offset="55%" stopColor={COLORS.golden} stopOpacity={0.25} />
      <stop offset="100%" stopColor={COLORS.golden} stopOpacity={0} />
    </radialGradient>
  </defs>
);

export const CANDLE_H = 150;

/** Candle on a little golden holder. (x, y) is the bottom of the holder. */
export const Candle: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <ellipse cx={0} cy={-6} rx={62} ry={16} fill={COLORS.golden} />
    <path d="M 52 -10 C 84 -10 84 -34 60 -30" stroke={COLORS.golden} strokeWidth={10} strokeLinecap="round" fill="none" />
    <rect x={-28} y={-136} width={56} height={128} rx={20} fill={COLORS.cream} />
    <path d="M -28 -116 Q -16 -100 -10 -116" stroke={COLORS.creamShade} strokeWidth={10} strokeLinecap="round" fill="none" />
    <rect x={8} y={-128} width={10} height={80} rx={5} fill={COLORS.creamShade} />
    <path d="M 0 -136 L 0 -150" stroke={COLORS.brownDark} strokeWidth={6} strokeLinecap="round" />
  </g>
);

/** Where the candle's flame sits for a given base position and tilt. */
export const candleFlame = (x: number, y: number, rot: number) => {
  const a = (rot * Math.PI) / 180;
  return { x: x + Math.sin(a) * CANDLE_H, y: y - Math.cos(a) * CANDLE_H };
};

/** Lantern. (x, y) is the bottom of its base. Flame sits at (x, y - 66). */
export const Lantern: React.FC<{ x: number; y: number; lit: number }> = ({ x, y, lit }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={0} cy={-292} r={24} stroke={COLORS.brownDark} strokeWidth={10} fill="none" />
    <path d="M -84 -206 Q -70 -246 0 -262 Q 70 -246 84 -206 Z" fill={COLORS.brownDark} strokeLinejoin="round" />
    <rect x={-60} y={-210} width={120} height={180} rx={26} fill={COLORS.goldenLight} opacity={0.28 + lit * 0.5} />
    <rect x={-60} y={-210} width={120} height={180} rx={26} stroke={COLORS.brownDark} strokeWidth={10} fill="none" />
    <path d="M 0 -206 L 0 -150 M 0 -60 L 0 -34" stroke={COLORS.brownDark} strokeWidth={8} strokeLinecap="round" />
    <rect x={-20} y={-60} width={40} height={30} rx={10} fill={COLORS.brownDark} />
    <path d="M 0 -60 L 0 -70" stroke={COLORS.brownDark} strokeWidth={5} strokeLinecap="round" />
    <rect x={-74} y={-34} width={148} height={34} rx={14} fill={COLORS.brownDark} />
  </g>
);

/** Matchbox with its tray slid open. One match rattles inside. */
export const Matchbox: React.FC<{
  x: number;
  y: number;
  rot?: number;
  trayOpen: number; // 0..1
  matchInTray: number; // 0..1 opacity
  matchSlide: number; // px
}> = ({ x, y, rot = 0, trayOpen, matchInTray, matchSlide }) => {
  const trayX = -trayOpen * 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {/* tray */}
      <g transform={`translate(${trayX} 0)`}>
        <rect x={-62} y={-34} width={124} height={68} rx={14} fill={COLORS.creamShade} />
        <rect x={-52} y={-24} width={104} height={48} rx={10} fill={COLORS.brown} />
        <g opacity={matchInTray} transform={`translate(${matchSlide} 0)`}>
          <path d="M -34 2 L 26 2" stroke={COLORS.goldenLight} strokeWidth={9} strokeLinecap="round" />
          <circle cx={-36} cy={2} r={10} fill={COLORS.deepRed} />
        </g>
      </g>
      {/* sleeve */}
      <rect x={-66} y={-40} width={132} height={80} rx={18} fill={COLORS.golden} />
      <rect x={52} y={-30} width={10} height={60} rx={5} fill={COLORS.brownDark} />
      <circle cx={-6} cy={0} r={18} fill={COLORS.cream} opacity={0.9} />
      <path d="M -6 10 C -14 4 -12 -6 -6 -12 C 0 -6 2 4 -6 10 Z" fill={COLORS.burntOrange} />
    </g>
  );
};

export const MATCH_LEN = 96;

/** A match held at its foot (x, y), pointing at angle `rot` (0 = straight up). */
export const Match: React.FC<{ x: number; y: number; rot: number; opacity: number }> = ({ x, y, rot, opacity }) =>
  opacity <= 0.001 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={opacity}>
      <path d={`M 0 0 L 0 ${-MATCH_LEN + 10}`} stroke={COLORS.goldenLight} strokeWidth={10} strokeLinecap="round" />
      <circle cx={0} cy={-MATCH_LEN + 8} r={11} fill={COLORS.deepRed} />
    </g>
  );

export const matchTip = (x: number, y: number, rot: number) => {
  const a = (rot * Math.PI) / 180;
  return { x: x + Math.sin(a) * MATCH_LEN, y: y - Math.cos(a) * MATCH_LEN };
};

export const HEART =
  "M 0 18 C -40 -8 -30 -40 -10 -36 C 0 -34 0 -26 0 -22 C 0 -26 0 -34 10 -36 C 30 -40 40 -8 0 18 Z";
