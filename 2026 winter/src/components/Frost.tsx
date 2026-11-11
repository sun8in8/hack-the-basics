import React from "react";
import { random, useCurrentFrame } from "remotion";
import { HEIGHT, WIDTH } from "../theme";

/** A soft, pale frost veil with slowly twinkling sparkles. No sudden changes. */
export const Frost: React.FC<{ amount: number }> = ({ amount }) => {
  const frame = useCurrentFrame();
  if (amount <= 0) return null;
  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="frostVeil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.45} />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#frostVeil)" opacity={amount} />
      {new Array(28).fill(0).map((_, i) => {
        const r = (k: string) => random(`frost-${i}-${k}`);
        const x = r("x") * WIDTH;
        const y = 120 + r("y") * (HEIGHT - 240);
        const s = 8 + r("s") * 12;
        const tw = 0.45 + 0.35 * Math.sin(frame * 0.06 + r("p") * 6.28);
        return (
          <path
            key={i}
            transform={`translate(${x} ${y}) rotate(${frame * 0.3 + r("rot") * 90})`}
            d={`M 0 ${-s} Q 2 -2 ${s} 0 Q 2 2 0 ${s} Q -2 2 ${-s} 0 Q -2 -2 0 ${-s} Z`}
            fill="#FFFFFF"
            opacity={tw * amount}
          />
        );
      })}
    </svg>
  );
};
