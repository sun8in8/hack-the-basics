import React from "react";
import { COLORS } from "../theme";

/** Blink: every 100 frames, 6 frames long (STYLE_GUIDE §5.3). */
export const blinkAmount = (frame: number, offset = 0) => {
  const cycle = (frame + offset) % 100;
  return cycle >= 94 ? Math.sin(((cycle - 94) / 6) * Math.PI) : 0;
};

type FaceProps = {
  r: number;
  frame: number;
  seed?: number;
  /** 0 = flat mouth, 1 = big smile */
  smile?: number;
  /** 0 = open eyes, 1 = softly closed (downward arcs) */
  closed?: number;
  /** 0 = normal eyes, 1 = happy smiling-eye arcs */
  happy?: number;
  /** Hide the mouth (e.g. under a big moustache) */
  mouth?: boolean;
  mouthY?: number;
};

/** House-style face, centred on the head centre. */
export const Face: React.FC<FaceProps> = ({ r, frame, seed = 0, smile = 0.6, closed = 0, happy = 0, mouth = true, mouthY = 0.36 }) => {
  const blink = blinkAmount(frame, seed);
  const shut = Math.max(closed, blink);
  const ex = r * 0.36;
  const ey = -r * 0.02;
  const rx = r * 0.11;
  const ry = r * 0.14;
  const w = rx * 1.3;

  const eye = (sx: number) => {
    const cx = sx * ex;
    if (happy > 0.5) {
      return (
        <path key={sx} d={`M ${cx - w} ${ey + 4} Q ${cx} ${ey - w * 1.3} ${cx + w} ${ey + 4}`} stroke={COLORS.brownDark} strokeWidth={r * 0.06} strokeLinecap="round" fill="none" />
      );
    }
    if (shut > 0.7) {
      return (
        <path key={sx} d={`M ${cx - w} ${ey} Q ${cx} ${ey + w * 0.9} ${cx + w} ${ey}`} stroke={COLORS.brownDark} strokeWidth={r * 0.06} strokeLinecap="round" fill="none" />
      );
    }
    const k = 1 - shut;
    return (
      <g key={sx}>
        <ellipse cx={cx} cy={ey} rx={rx} ry={ry * k} fill={COLORS.brownDark} />
        {k > 0.5 && <circle cx={cx + rx * 0.35} cy={ey - ry * 0.4} r={rx * 0.32} fill={COLORS.cream} />}
      </g>
    );
  };

  const cheekLift = happy * r * 0.06;
  const my = r * mouthY;
  const mw = r * 0.2;
  return (
    <g>
      {eye(-1)}
      {eye(1)}
      <ellipse cx={-r * 0.55} cy={r * 0.26 - cheekLift} rx={r * 0.16} ry={r * 0.1} fill={COLORS.burntOrange} opacity={0.45} />
      <ellipse cx={r * 0.55} cy={r * 0.26 - cheekLift} rx={r * 0.16} ry={r * 0.1} fill={COLORS.burntOrange} opacity={0.45} />
      {mouth && (
        <path d={`M ${-mw} ${my} Q 0 ${my + r * 0.05 + smile * r * 0.22} ${mw} ${my}`} stroke={COLORS.brownDark} strokeWidth={r * 0.055} strokeLinecap="round" fill="none" />
      )}
    </g>
  );
};
