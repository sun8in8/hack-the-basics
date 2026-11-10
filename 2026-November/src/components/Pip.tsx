import React from "react";
import { interpolate } from "remotion";
import { COLORS } from "../theme";

export type PipPose = {
  /** 0 = standing, 1 = curled into a ball */
  curl: number;
  /** 0 = normal, 1 = stretched tall (breathing in) */
  stretch: number;
  /** 0 = open, 1 = closed (blinks or sleep) */
  eyesClosed: number;
  /** walk cycle phase in radians; leave undefined when standing still */
  walkPhase?: number;
  /** small body tilt in degrees */
  tilt?: number;
  /** 0..1, how big the smile is */
  smile?: number;
};

type Props = PipPose & {
  /** Feet position in the parent SVG's coordinates */
  x: number;
  y: number;
  scale?: number;
  /** -1 to face left */
  facing?: 1 | -1;
};

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Pip, drawn in a 400×400 local box with her feet at (200, 360).
 * Every part is a rounded shape so she reads as soft and friendly.
 */
export const Pip: React.FC<Props> = ({
  x,
  y,
  scale = 1,
  facing = 1,
  curl,
  stretch,
  eyesClosed,
  walkPhase,
  tilt = 0,
  smile = 1,
}) => {
  const c = Math.min(1, Math.max(0, curl));

  // Body shape: wide oval when standing, round ball when curled.
  const cx = mix(190, 200, c);
  const cy = mix(255, 262, c);
  const rx = mix(150, 104, c);
  const ry = mix(100, 98, c);

  // Spikes cover her back when standing and wrap all the way round when curled.
  const a0 = mix(158, 90 - 180, c); // degrees
  const a1 = mix(338, 90 + 180, c);
  const spikeCount = 20;
  const spikeLen = mix(58, 46, c);

  const spikes = new Array(spikeCount).fill(0).map((_, i) => {
    const step = (a1 - a0) / spikeCount;
    // Two rows for a fluffy look: outer row offset by half a step.
    const deg = a0 + (i + 0.5) * step;
    const t = (deg * Math.PI) / 180;
    const px = cx + rx * 0.88 * Math.cos(t);
    const py = cy + ry * 0.88 * Math.sin(t);
    // Outward normal of the ellipse
    let nx = Math.cos(t) / rx;
    let ny = Math.sin(t) / ry;
    const nl = Math.hypot(nx, ny);
    nx /= nl;
    ny /= nl;
    const tx = -ny;
    const ty = nx;
    const w = 22;
    const L = spikeLen * (i % 2 === 0 ? 1 : 0.86);
    const tipX = px + nx * L;
    const tipY = py + ny * L;
    const d = [
      `M ${px - tx * w} ${py - ty * w}`,
      `Q ${px + nx * L * 0.55 - tx * w * 0.45} ${py + ny * L * 0.55 - ty * w * 0.45} ${tipX} ${tipY}`,
      `Q ${px + nx * L * 0.55 + tx * w * 0.45} ${py + ny * L * 0.55 + ty * w * 0.45} ${px + tx * w} ${py + ty * w}`,
      "Z",
    ].join(" ");
    return (
      <path
        key={i}
        d={d}
        fill={i % 2 === 0 ? COLORS.brown : COLORS.deepRed}
        stroke={i % 2 === 0 ? COLORS.brown : COLORS.deepRed}
        strokeWidth={8}
        strokeLinejoin="round"
      />
    );
  });

  // Face: a long snout when standing, tucked into a small round face when curled.
  const faceX = mix(292, 246, c);
  const faceY = mix(272, 290, c);
  const faceScale = mix(1, 0.62, c);
  const feetOpacity = interpolate(c, [0, 0.5], [1, 0], {
    extrapolateRight: "clamp",
  });

  const step = walkPhase === undefined ? 0 : Math.sin(walkPhase);
  const bob = walkPhase === undefined ? 0 : Math.abs(Math.sin(walkPhase)) * -6;

  // Stretching tall: taller and a touch narrower, anchored at her feet.
  const sy = 1 + 0.24 * stretch;
  const sx = 1 - 0.07 * stretch;

  const eyeOpen = 1 - Math.min(1, Math.max(0, eyesClosed));

  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale * facing} ${scale}) translate(-200 -360)`}
    >
      {/* soft ground shadow */}
      <ellipse
        cx={200}
        cy={362}
        rx={mix(150, 118, c) * (1 + 0.05 * stretch)}
        ry={16}
        fill={COLORS.brownDark}
        opacity={0.18}
      />
      <g
        transform={`translate(200 360) rotate(${tilt}) scale(${sx} ${sy}) translate(-200 ${-360 + bob})`}
      >
        {/* feet */}
        <g opacity={feetOpacity}>
          <ellipse
            cx={140 + step * 10}
            cy={350 - Math.max(0, step) * 10}
            rx={26}
            ry={16}
            fill={COLORS.brownDark}
          />
          <ellipse
            cx={250 - step * 10}
            cy={350 - Math.max(0, -step) * 10}
            rx={26}
            ry={16}
            fill={COLORS.brownDark}
          />
        </g>

        {/* spikes behind the coat */}
        {spikes}

        {/* coat */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={COLORS.brown} />
        {/* soft belly */}
        <ellipse
          cx={mix(222, 216, c)}
          cy={mix(300, 300, c)}
          rx={mix(92, 58, c)}
          ry={mix(52, 40, c)}
          fill={COLORS.creamShade}
          opacity={mix(1, 0.6, c)}
        />

        {/* face */}
        <g
          transform={`translate(${faceX} ${faceY}) scale(${faceScale}) translate(-292 -272)`}
        >
          {/* ear */}
          <circle cx={262} cy={196} r={18} fill={COLORS.creamShade} />
          <circle cx={262} cy={196} r={9} fill={COLORS.deepRed} opacity={0.5} />
          {/* head + snout */}
          <path
            d="M 236 210 C 280 190 340 222 372 258 C 382 270 374 286 360 290 C 320 302 262 312 236 296 C 214 282 212 222 236 210 Z"
            fill={COLORS.cream}
          />
          {/* nose */}
          <circle cx={372} cy={266} r={13} fill={COLORS.brownDark} />
          <circle cx={368} cy={261} r={4} fill={COLORS.cream} opacity={0.8} />
          {/* cheek */}
          <ellipse
            cx={282}
            cy={276}
            rx={17}
            ry={11}
            fill={COLORS.burntOrange}
            opacity={0.45}
          />
          {/* eye */}
          {eyeOpen > 0.15 ? (
            <g transform={`translate(300 240) scale(1 ${eyeOpen}) translate(-300 -240)`}>
              <ellipse cx={300} cy={240} rx={10} ry={13} fill={COLORS.brownDark} />
              <circle cx={303} cy={235} r={4} fill={COLORS.cream} />
            </g>
          ) : (
            <path
              d="M 288 240 Q 300 250 312 240"
              stroke={COLORS.brownDark}
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
            />
          )}
          {/* smile */}
          <path
            d={`M 322 ${284} Q 334 ${284 + 10 * smile} 348 ${282}`}
            stroke={COLORS.brownDark}
            strokeWidth={4.5}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </g>
    </g>
  );
};
