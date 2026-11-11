import React from "react";
import { random, useCurrentFrame } from "remotion";
import { HEIGHT, LEAF_COLORS, WIDTH } from "../theme";
import { Leaf } from "./Leaf";

type Props = {
  count?: number;
  seed?: string;
  /** 0..1, lets a scene slow the leaves (e.g. when the frost arrives). */
  speed?: number;
  opacity?: number;
};

/** Slow, swaying leaves drifting down behind everything. Fully deterministic. */
export const FallingLeaves: React.FC<Props> = ({
  count = 16,
  seed = "leaves",
  speed = 1,
  opacity = 0.85,
}) => {
  const frame = useCurrentFrame();
  const span = HEIGHT + 300;

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0 }}
    >
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const baseX = r("x") * WIDTH;
        const fallSpeed = 1.4 + r("speed") * 1.6; // px per frame
        const size = 40 + r("size") * 40;
        const swayAmp = 30 + r("sway") * 50;
        const swayFreq = 0.02 + r("freq") * 0.02;
        const phase = r("phase") * Math.PI * 2;
        const offset = r("offset") * span;
        const color = LEAF_COLORS[Math.floor(r("color") * LEAF_COLORS.length)];

        const travelled = frame * fallSpeed * speed + offset;
        const y = (travelled % span) - 150;
        const x = baseX + Math.sin(frame * swayFreq + phase) * swayAmp;
        const rotate =
          Math.sin(frame * swayFreq + phase) * 35 + r("rot") * 360;

        return (
          <Leaf
            key={i}
            x={x}
            y={y}
            size={size}
            rotate={rotate}
            color={color}
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
};
