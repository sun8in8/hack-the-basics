import React from "react";
import { COLORS } from "../theme";

type LeafProps = {
  color: string;
  size?: number;
  rotate?: number;
  x?: number;
  y?: number;
  opacity?: number;
};

/**
 * A soft, rounded autumn leaf drawn as an SVG <g>. Coordinates are in the
 * parent SVG's space; (x, y) is the leaf's centre.
 */
export const Leaf: React.FC<LeafProps> = ({
  color,
  size = 60,
  rotate = 0,
  x = 0,
  y = 0,
  opacity = 1,
}) => {
  const s = size / 100;
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`}
      opacity={opacity}
    >
      {/* stem */}
      <path
        d="M0 48 Q 4 60 10 66"
        stroke={COLORS.brown}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      {/* blade */}
      <path
        d="M0 -50 C 34 -34 40 18 0 50 C -40 18 -34 -34 0 -50 Z"
        fill={color}
        stroke={COLORS.brown}
        strokeOpacity={0.25}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* vein */}
      <path
        d="M0 -38 L0 44 M0 -6 L14 -20 M0 -6 L-14 -20 M0 14 L16 0 M0 14 L-16 0"
        stroke={COLORS.cream}
        strokeOpacity={0.55}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
};
