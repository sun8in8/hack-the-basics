import React from "react";
import { COLORS } from "../theme";

/** Warm radial glow (cosy moments, focus). Fade its opacity in slowly; never flash it. */
export const Glow: React.FC<{ x: number; y: number; rx: number; ry: number; opacity: number; id?: string }> = ({ x, y, rx, ry, opacity, id = "glow" }) => (
  <>
    <defs>
      <radialGradient id={id}>
        <stop offset="0%" stopColor={COLORS.goldenLight} stopOpacity={0.85} />
        <stop offset="100%" stopColor={COLORS.goldenLight} stopOpacity={0} />
      </radialGradient>
    </defs>
    <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id})`} opacity={opacity} />
  </>
);
