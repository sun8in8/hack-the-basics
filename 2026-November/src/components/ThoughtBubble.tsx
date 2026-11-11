import React from "react";
import { COLORS } from "../theme";

type Props = {
  /** centre of the main cloud */
  x: number;
  y: number;
  /** where the little trailing bubbles point (Pip's head) */
  toX: number;
  toY: number;
  radius: number;
  /** 0..1 grows the bubble in, puff by puff */
  progress: number;
  children?: React.ReactNode;
};

/** A fluffy cloud-shaped thought bubble. Children are drawn centred at (0,0). */
export const ThoughtBubble: React.FC<Props> = ({
  x,
  y,
  toX,
  toY,
  radius,
  progress,
  children,
}) => {
  if (progress <= 0) return null;
  const p = (start: number) =>
    Math.min(1, Math.max(0, (progress - start) / (1 - start)));

  const trail = [0.2, 0.42, 0.62].map((t, i) => ({
    cx: toX + (x - toX) * t,
    cy: toY + (y - toY) * t,
    r: 14 + i * 12,
    show: p(i * 0.12),
  }));

  const puffs = 9;
  const main = p(0.35);

  return (
    <g>
      {trail.map((b, i) => (
        <circle
          key={i}
          cx={b.cx}
          cy={b.cy}
          r={b.r * b.show}
          fill={COLORS.cream}
          stroke={COLORS.golden}
          strokeWidth={6}
        />
      ))}
      <g transform={`translate(${x} ${y}) scale(${main})`} opacity={main}>
        {new Array(puffs).fill(0).map((_, i) => {
          const a = (i / puffs) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * radius * 0.78}
              cy={Math.sin(a) * radius * 0.62}
              r={radius * 0.38}
              fill={COLORS.cream}
              stroke={COLORS.golden}
              strokeWidth={6}
            />
          );
        })}
        <ellipse cx={0} cy={0} rx={radius * 0.95} ry={radius * 0.78} fill={COLORS.cream} />
        {children}
      </g>
    </g>
  );
};
