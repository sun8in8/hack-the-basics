import React from "react";
import { random } from "remotion";
import { COLORS } from "../theme";

/** Soft cream breath-steam on glass. `grow` 0..1 spreads it out; `opacity` fades it. */
export const Steam: React.FC<{ x: number; y: number; grow: number; opacity: number; id: string }> = ({ x, y, grow, opacity, id }) =>
  opacity <= 0 || grow <= 0 ? null : (
    <g opacity={opacity}>
      <defs>
        <radialGradient id={`${id}-blob`}>
          <stop offset="0%" stopColor={COLORS.cream} stopOpacity={0.85} />
          <stop offset="55%" stopColor={COLORS.cream} stopOpacity={0.6} />
          <stop offset="100%" stopColor={COLORS.cream} stopOpacity={0} />
        </radialGradient>
      </defs>
      {new Array(10).fill(0).map((_, i) => {
        const r = (k: string) => random(`${id}-${i}-${k}`);
        const a = r("a") * Math.PI * 2;
        const d = (i === 0 ? 0 : 60 + r("d") * 110) * grow;
        const size = (110 + r("s") * 90) * (0.35 + 0.65 * grow);
        return (
          <ellipse
            key={i}
            cx={x + Math.cos(a) * d * 1.15}
            cy={y + Math.sin(a) * d * 0.85}
            rx={size}
            ry={size * 0.85}
            fill={`url(#${id}-blob)`}
          />
        );
      })}
    </g>
  );
