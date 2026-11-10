import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, FONT_FAMILY } from "../theme";

type Props = { x: number; y: number; size?: number; opacity?: number; seed?: number };

/** Three little z's drifting up and fading, on a slow loop. */
export const Zzz: React.FC<Props> = ({ x, y, size = 40, opacity = 1, seed = 0 }) => {
  const frame = useCurrentFrame();
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      {[0, 1, 2].map((k) => {
        const t = ((frame + seed * 17) / 75 + k / 3) % 1;
        return (
          <text
            key={k}
            x={x + Math.sin(t * Math.PI * 2) * size * 0.3 + t * size}
            y={y - t * size * 2.4}
            fontFamily={FONT_FAMILY}
            fontSize={size * (0.7 + t * 0.6)}
            fill={COLORS.brown}
            opacity={Math.sin(t * Math.PI) * 0.85}
          >
            z
          </text>
        );
      })}
    </g>
  );
};
