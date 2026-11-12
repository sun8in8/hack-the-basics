import React from "react";
import { COLORS } from "../theme";

/** Blink: every 100 frames, 6 frames long (STYLE_GUIDE §5.3). Returns 0..1 lid amount. */
export const blink = (frame: number, phase = 0) => {
  const c = (frame + phase) % 100;
  return c >= 94 ? Math.sin(((c - 94) / 6) * Math.PI) : 0;
};

/** One eye: open ellipse that squashes, becoming a soft downward arc when closed. */
export const Eye: React.FC<{ x: number; y: number; closed: number; s?: number }> = ({ x, y, closed, s = 1 }) =>
  closed > 0.7 ? (
    <path
      d={`M ${x - 12 * s} ${y - 2 * s} Q ${x} ${y + 8 * s} ${x + 12 * s} ${y - 2 * s}`}
      stroke={COLORS.brownDark}
      strokeWidth={5 * s}
      strokeLinecap="round"
      fill="none"
    />
  ) : (
    <g>
      <ellipse cx={x} cy={y} rx={10 * s} ry={13 * s * (1 - closed)} fill={COLORS.brownDark} />
      {closed < 0.4 && <circle cx={x + 3 * s} cy={y - 4 * s} r={3 * s} fill={COLORS.cream} />}
    </g>
  );

export const Smile: React.FC<{ x: number; y: number; w?: number; depth?: number }> = ({ x, y, w = 20, depth = 8 }) => (
  <path
    d={`M ${x - w / 2} ${y} Q ${x} ${y + depth} ${x + w / 2} ${y}`}
    stroke={COLORS.brownDark}
    strokeWidth={4.5}
    strokeLinecap="round"
    fill="none"
  />
);
