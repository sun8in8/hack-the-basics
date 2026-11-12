import React from "react";
import { COLORS } from "../theme";

export type Pt = { x: number; y: number };

type Props = {
  /** World position of her hips (the body pivot). */
  x: number;
  y: number;
  scale?: number;
  /** 0 = resting, 1 = full in-breath (shoulders up, chest wide). */
  breath?: number;
  /** 0 = open, 1 = closed (a soft curved line). */
  eyesClosed?: number;
  /** 0 = flat mouth, 1 = full smile. */
  smile?: number;
  /** Head tilt in degrees. */
  tilt?: number;
  /** Hand positions in WORLD coordinates. */
  leftHand: Pt;
  rightHand: Pt;
  /** World y of the floor her boots stand on. */
  floorY?: number;
  /** Drawn after her body but before her arms (table, candle, lantern). */
  behindArms?: React.ReactNode;
  /** Drawn after her arms but before her hands (things she holds). */
  held?: React.ReactNode;
};

const ARM_LEN = 330;

/**
 * The lighthouse keeper. A flat, rounded storybook woman drawn facing us in a
 * local box with her hips at (0, 0). Arms bend softly towards whatever hand
 * positions the scene gives, so props can be held and moved in world space.
 */
export const Keeper: React.FC<Props> = ({
  x,
  y,
  scale = 1.25,
  breath = 0,
  eyesClosed = 0,
  smile = 1,
  tilt = 0,
  leftHand,
  rightHand,
  floorY = 1770,
  behindArms,
  held,
}) => {
  const lift = breath * 16;
  const toLocal = (p: Pt) => ({ x: (p.x - x) / scale, y: (p.y - y) / scale });
  const place = `translate(${x} ${y}) scale(${scale})`;

  const arm = (side: -1 | 1, hand: Pt) => {
    const s = { x: side * 118, y: -272 - lift };
    const h = toLocal(hand);
    const dx = h.x - s.x;
    const dy = h.y - s.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    const bend = Math.min(70, Math.max(0, ARM_LEN - d) * 0.45);
    // perpendicular, pointing away from the body
    let px = -dy / d;
    let py = dx / d;
    if (px * side < 0) {
      px = -px;
      py = -py;
    }
    const cx = s.x + dx / 2 + px * bend * 2;
    const cy = s.y + dy / 2 + py * bend * 2;
    return { s, h, c: { x: cx, y: cy } };
  };

  const L = arm(-1, leftHand);
  const R = arm(1, rightHand);
  const open = 1 - eyesClosed;

  return (
    <>
      {/* legs and boots */}
      <g transform={place}>
        {[-1, 1].map((side) => {
          const foot = (floorY - y) / scale - 14;
          return (
            <g key={side}>
              <rect x={side * 58 - 30} y={20} width={60} height={Math.max(40, foot - 20)} rx={30} fill={COLORS.brown} />
              <ellipse cx={side * 66} cy={foot} rx={46} ry={22} fill={COLORS.brownDark} />
            </g>
          );
        })}
      </g>

      {/* body and head */}
      <g transform={place}>
        <g transform={`scale(${1 + breath * 0.035} ${1 + breath * 0.05})`}>
          {/* coat */}
          <path
            d="M -96 -300 C -150 -300 -152 -250 -150 -190 L -142 30 Q 0 52 142 30 L 150 -190 C 152 -250 150 -300 96 -300 Z"
            fill={COLORS.burntOrange}
            strokeLinejoin="round"
          />
          {/* knitted rib down the middle */}
          <path
            d="M 0 -280 L 0 40"
            stroke={COLORS.deepRed}
            strokeOpacity={0.35}
            strokeWidth={10}
            strokeLinecap="round"
          />
          {[-200, -130, -60].map((by) => (
            <circle key={by} cx={0} cy={by} r={10} fill={COLORS.golden} />
          ))}
          {/* pocket */}
          <rect x={46} y={-110} width={64} height={54} rx={18} fill={COLORS.deepRed} opacity={0.35} />
        </g>

        <g transform={`translate(0 ${-lift}) rotate(${tilt} 0 -320)`}>
          {/* medium-length hair, behind her neck and scarf */}
          <path
            transform="translate(0 -440)"
            d="M -102 6 C -108 -84 -54 -114 0 -114 C 54 -114 108 -84 102 6 C 106 60 116 104 118 132 Q 120 152 98 152 L -98 152 Q -120 152 -118 132 C -116 104 -106 60 -102 6 Z"
            fill={COLORS.brownDark}
            strokeLinejoin="round"
          />
          {/* neck */}
          <rect x={-24} y={-352} width={48} height={60} rx={22} fill={COLORS.creamShade} />
          {/* scarf */}
          <rect x={-86} y={-322} width={172} height={48} rx={24} fill={COLORS.sage} />
          <g transform="rotate(-14 44 -300)">
            <rect x={26} y={-306} width={42} height={128} rx={21} fill={COLORS.sage} />
            <path
              d="M 34 -226 L 60 -226 M 34 -200 L 60 -200"
              stroke={COLORS.sageDark}
              strokeWidth={8}
              strokeLinecap="round"
            />
          </g>

          <g transform="translate(0 -440)">
            {/* ears */}
            <circle cx={-80} cy={20} r={17} fill={COLORS.creamShade} />
            <circle cx={80} cy={20} r={17} fill={COLORS.creamShade} />
            {/* face */}
            <ellipse cx={0} cy={12} rx={80} ry={88} fill={COLORS.cream} />
            {/* fringe, swept to one side */}
            <path
              d="M -84 4 C -90 -78 -40 -94 0 -92 C 44 -94 90 -76 84 4 C 74 -36 44 -54 10 -52 C -22 -50 -62 -38 -84 4 Z"
              fill={COLORS.brownDark}
              strokeLinejoin="round"
            />
            {/* cheeks */}
            <ellipse cx={-50} cy={42} rx={17} ry={11} fill={COLORS.burntOrange} opacity={0.45} />
            <ellipse cx={50} cy={42} rx={17} ry={11} fill={COLORS.burntOrange} opacity={0.45} />
            {/* eyes */}
            {[-32, 32].map((ex) =>
              open > 0.15 ? (
                <g key={ex}>
                  <ellipse cx={ex} cy={12} rx={10} ry={13 * open} fill={COLORS.brownDark} />
                  <circle cx={ex + 3} cy={12 - 5 * open} r={4 * open} fill={COLORS.cream} />
                </g>
              ) : (
                <path
                  key={ex}
                  d={`M ${ex - 12} 12 Q ${ex} 22 ${ex + 12} 12`}
                  stroke={COLORS.brownDark}
                  strokeWidth={5}
                  strokeLinecap="round"
                  fill="none"
                />
              ),
            )}
            {/* nose */}
            <ellipse cx={0} cy={32} rx={7} ry={5} fill={COLORS.burntOrange} opacity={0.5} />
            {/* mouth */}
            <path
              d={`M -18 54 Q 0 ${54 + 12 * smile} 18 54`}
              stroke={COLORS.brownDark}
              strokeWidth={4.5}
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </g>
      </g>

      {behindArms}

      {/* arms (knitted sleeves) */}
      <g transform={place}>
        {[L, R].map((a, i) => (
          <path
            key={i}
            d={`M ${a.s.x} ${a.s.y} Q ${a.c.x} ${a.c.y} ${a.h.x} ${a.h.y}`}
            stroke={COLORS.burntOrange}
            strokeWidth={54}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </g>

      {held}

      {/* hands */}
      <g transform={place}>
        {[L, R].map((a, i) => (
          <g key={i}>
            <circle cx={a.h.x} cy={a.h.y} r={30} fill={COLORS.cream} />
            <circle cx={a.h.x} cy={a.h.y + 6} r={18} fill={COLORS.creamShade} opacity={0.7} />
          </g>
        ))}
      </g>
    </>
  );
};
