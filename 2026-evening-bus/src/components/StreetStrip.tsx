import React from "react";
import { random } from "remotion";
import { COLORS } from "../theme";

const W = 300;

/**
 * An endless row of rounded houses with lit (and a few dark) windows.
 * `offset` scrolls the row to the left; houses are seeded by their index so they never change.
 */
export const StreetStrip: React.FC<{
  offset: number;
  baseY: number;
  span: number;
  scale?: number;
  seed: string;
  body?: string;
  off?: string;
}> = ({ offset, baseY, span, scale = 1, seed, body = COLORS.brownDark, off = COLORS.brown }) => {
  const step = W * scale;
  const k0 = Math.floor(offset / step) - 1;
  const n = Math.ceil(span / step) + 3;
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const k = k0 + i;
        const r = (s: string) => random(`${seed}-${k}-${s}`);
        const x = k * step - offset;
        const h = (190 + r("h") * 130) * scale;
        const bw = (W - 24) * scale;
        const top = baseY - h;
        const roof = 70 * scale;
        const rows = h > 260 * scale ? 2 : 1;
        return (
          <g key={k}>
            <path
              d={`M ${x + 6 * scale} ${top} L ${x + bw / 2} ${top - roof} L ${x + bw - 6 * scale} ${top} Z`}
              fill={body}
              stroke={body}
              strokeWidth={24 * scale}
              strokeLinejoin="round"
            />
            <rect x={x} y={top} width={bw} height={h + 4} rx={14 * scale} fill={body} />
            {new Array(rows * 2).fill(0).map((__, j) => {
              const col = j % 2;
              const row = Math.floor(j / 2);
              const lit = random(`${seed}-${k}-w${j}`) > 0.18;
              const wx = x + bw * (col === 0 ? 0.18 : 0.6);
              const wy = top + (36 + row * 110) * scale;
              return (
                <rect key={j} x={wx} y={wy} width={bw * 0.22} height={70 * scale} rx={12 * scale} fill={lit ? COLORS.goldenLight : off} />
              );
            })}
          </g>
        );
      })}
    </g>
  );
};
