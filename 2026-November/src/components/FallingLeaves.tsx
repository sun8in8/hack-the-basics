import React from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { LEAF_COLORS } from "../theme";
import { Leaf } from "./Leaf";

type Props = {
  count?: number;
  seed?: string;
  opacity?: number;
  /** Scales leaf size, e.g. 1.2 for the full frame. Keep constant within a clip. */
  sizeScale?: number;
  /** Shifts the animation clock so clips can continue each other's leaves. */
  timeOffset?: number;
};

/** Slow, swaying leaves drifting down behind everything (style guide §6.3). Fully deterministic. */
export const FallingLeaves: React.FC<Props> = ({
  count = 12,
  seed = "leaves",
  opacity = 0.8,
  sizeScale = 1,
  timeOffset = 0,
}) => {
  const frame = useCurrentFrame() + timeOffset;
  const { width, height } = useVideoConfig();
  const span = height + 300;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const baseX = r("x") * width;
        // Slightly slower than the Shorts (1.2–2.4 px/frame) for the calm long-form pace.
        const fallSpeed = 1.2 + r("speed") * 1.2;
        const size = (44 + r("size") * 40) * sizeScale;
        const swayAmp = 30 + r("sway") * 50;
        const swayFreq = 0.02 + r("freq") * 0.02;
        const phase = r("phase") * Math.PI * 2;
        const offset = r("offset") * span;
        const color = LEAF_COLORS[Math.floor(r("color") * LEAF_COLORS.length)];
        const y = ((frame * fallSpeed + offset) % span) - 150;
        const x = baseX + Math.sin(frame * swayFreq + phase) * swayAmp;
        const rotate = Math.sin(frame * swayFreq + phase) * 35 + r("rot") * 360;
        return <Leaf key={i} x={x} y={y} size={size} rotate={rotate} color={color} opacity={opacity} />;
      })}
    </svg>
  );
};
