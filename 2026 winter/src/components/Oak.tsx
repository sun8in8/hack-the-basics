import React from "react";
import { COLORS } from "../theme";

/**
 * The 300-year-old oak. Drawn straight into the 1080x1920 scene, standing at
 * (540, OAK_BASE_Y). Trunk and branches are deep red, the crown is a cluster
 * of rounded blobs that fade away as her leaves let go.
 */
export const OAK_X = 540;
export const OAK_BASE_Y = 1340;

/** Crown blobs: [cx, cy, r, colour]. Back ones first. */
export const CROWN: [number, number, number, string][] = [
  [540, 380, 140, COLORS.goldenLight],
  [420, 440, 160, COLORS.burntOrange],
  [670, 440, 160, COLORS.golden],
  [540, 560, 230, COLORS.golden],
  [330, 660, 170, COLORS.burntOrange],
  [750, 660, 170, COLORS.burntOrange],
  [230, 790, 115, COLORS.golden],
  [850, 790, 115, COLORS.golden],
  [540, 800, 180, COLORS.burntOrange],
];

/** Bare branches: [path, width]. All round caps, so the joins melt together. */
const BRANCHES: [string, number][] = [
  ["M 540 960 C 540 840 535 720 545 560", 64],
  ["M 545 720 C 500 640 460 560 420 460", 36],
  ["M 545 640 C 590 560 630 500 670 430", 34],
  ["M 545 580 C 545 500 540 440 540 360", 26],
  ["M 520 960 C 460 880 380 820 300 700", 52],
  ["M 380 820 C 320 820 260 800 215 770", 26],
  ["M 320 730 C 320 660 340 610 330 560", 22],
  ["M 560 960 C 620 880 700 820 780 700", 52],
  ["M 700 820 C 760 820 820 800 865 770", 26],
  ["M 760 730 C 760 660 740 610 750 560", 22],
  ["M 420 460 C 400 420 380 400 360 390", 14],
  ["M 670 430 C 690 390 710 370 735 360", 14],
  ["M 300 700 C 270 680 250 650 240 620", 14],
  ["M 780 700 C 810 680 830 650 840 620", 14],
  ["M 540 360 C 525 330 515 310 500 295", 12],
  ["M 215 770 C 195 770 175 760 160 745", 12],
  ["M 865 770 C 885 770 905 760 920 745", 12],
];

/** Branch tips, where the energy orbs start their journey down. */
export const BRANCH_TIPS: [number, number][] = [
  [360, 390], [735, 360], [240, 620], [840, 620], [500, 295], [160, 745], [920, 745], [540, 360],
];

const TRUNK =
  "M 360 1345 C 430 1310 445 1240 445 1150 C 445 1060 455 990 470 930 " +
  "C 480 880 500 840 515 800 L 565 800 C 580 840 600 880 610 930 " +
  "C 625 990 635 1060 635 1150 C 635 1240 650 1310 720 1345 Z";

type Props = {
  /** 1 = full autumn crown, 0 = bare */
  fullness: number;
  eyesClosed: number;
  /** 0..1 depth of the smile */
  smile: number;
  /** 0..1 warm golden light filling the trunk from the ground up (breathing) */
  warmth: number;
};

const Eye: React.FC<{ x: number; y: number; closed: number }> = ({ x, y, closed }) => {
  const open = 1 - closed;
  return (
    <g>
      {/* soft brow, a little wise */}
      <path
        d={`M ${x - 17} ${y - 24} Q ${x} ${y - 33} ${x + 17} ${y - 24}`}
        stroke={COLORS.brownDark}
        strokeOpacity={0.55}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      {open < 0.15 ? (
        <path
          d={`M ${x - 15} ${y} Q ${x} ${y + 11} ${x + 15} ${y}`}
          stroke={COLORS.brownDark}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <g transform={`translate(${x} ${y}) scale(1 ${open}) translate(${-x} ${-y})`}>
          <ellipse cx={x} cy={y} rx={11} ry={14} fill={COLORS.brownDark} />
          <circle cx={x + 3} cy={y - 5} r={4} fill={COLORS.cream} />
        </g>
      )}
    </g>
  );
};

export const Oak: React.FC<Props> = ({ fullness, eyesClosed, smile, warmth }) => {
  // the crown stays solid while it shrinks, then melts away at the end
  const crownOpacity = Math.min(1, Math.max(0, fullness) * 2.5);
  const crownScale = 0.55 + 0.45 * fullness;
  const warmTop = OAK_BASE_Y + 5 - (OAK_BASE_Y + 5 - 790) * warmth;
  return (
    <g>
      <defs>
        <clipPath id="oakTrunkClip">
          <path d={TRUNK} />
        </clipPath>
      </defs>

      {/* branches (hidden by the crown until the leaves let go) */}
      {BRANCHES.map(([d, w], i) => (
        <path
          key={i}
          d={d}
          stroke={COLORS.deepRed}
          strokeWidth={w}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}

      {/* trunk */}
      <path d={TRUNK} fill={COLORS.deepRed} />
      {/* bark lines and a knot: she is old */}
      <g stroke={COLORS.brown} strokeOpacity={0.4} strokeWidth={6} strokeLinecap="round" fill="none">
        <path d="M 466 1180 Q 472 1240 458 1300" />
        <path d="M 614 1190 Q 608 1250 622 1305" />
        <path d="M 522 950 Q 516 990 524 1020" />
        <path d="M 488 1250 Q 494 1280 488 1310" />
      </g>
      <ellipse cx={598} cy={985} rx={10} ry={15} fill={COLORS.brown} opacity={0.45} />

      {/* warm light rising inside the trunk while she breathes */}
      {warmth > 0.001 && (
        <g clipPath="url(#oakTrunkClip)">
          <rect x={340} y={warmTop} width={400} height={OAK_BASE_Y + 10 - warmTop} fill={COLORS.golden} opacity={0.5} />
        </g>
      )}

      {/* crown */}
      {crownOpacity > 0.001 && (
        <g opacity={crownOpacity}>
          {CROWN.map(([cx, cy, r, c], i) => (
            <g key={i} transform={`translate(${cx} ${cy}) scale(${crownScale}) translate(${-cx} ${-cy})`}>
              <circle cx={cx} cy={cy} r={r} fill={c} />
              <circle cx={cx - r * 0.32} cy={cy - r * 0.32} r={r * 0.3} fill={COLORS.cream} opacity={0.16} />
            </g>
          ))}
        </g>
      )}

      {/* face */}
      <Eye x={505} y={1075} closed={eyesClosed} />
      <Eye x={575} y={1075} closed={eyesClosed} />
      {/* laugh lines at the corners of her eyes */}
      <g stroke={COLORS.brownDark} strokeOpacity={0.35} strokeWidth={3.5} strokeLinecap="round" fill="none">
        <path d="M 478 1068 Q 472 1076 477 1086" />
        <path d="M 602 1068 Q 608 1076 603 1086" />
      </g>
      <ellipse cx={482} cy={1112} rx={18} ry={11} fill={COLORS.burntOrange} opacity={0.45} />
      <ellipse cx={598} cy={1112} rx={18} ry={11} fill={COLORS.burntOrange} opacity={0.45} />
      <path
        d={`M 516 1124 Q 540 ${1124 + 14 * smile} 564 1124`}
        stroke={COLORS.brownDark}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
};
