import React from "react";
import { COLORS } from "../theme";

/**
 * Soft ring that grows on the in-breath and shrinks on the out-breath.
 * Golden by default; use burnt orange in day scenes so it stands out from the golden hills.
 */
export const BreathRing: React.FC<{ x: number; y: number; r: number; opacity: number; color?: string }> = ({
  x,
  y,
  r,
  opacity,
  color = COLORS.golden,
}) =>
  opacity <= 0 ? null : (
    <circle cx={x} cy={y} r={r} fill={color} fillOpacity={0.14} stroke={color} strokeWidth={12} strokeOpacity={0.75} opacity={opacity} />
  );
