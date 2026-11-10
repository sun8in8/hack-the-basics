import React from "react";
import { COLORS } from "../theme";

/** The breathing guide ring (style guide §6.6). Radius is driven by the scene. */
export const BreathRing: React.FC<{ x: number; y: number; r: number; opacity: number }> = ({ x, y, r, opacity }) =>
  opacity <= 0 ? null : (
    <circle
      cx={x}
      cy={y}
      r={r}
      fill={COLORS.golden}
      fillOpacity={0.14}
      stroke={COLORS.golden}
      strokeWidth={12}
      strokeOpacity={0.7}
      opacity={opacity}
    />
  );
