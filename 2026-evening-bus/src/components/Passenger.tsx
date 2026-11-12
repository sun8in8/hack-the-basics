import React from "react";
import { COLORS } from "../theme";
import { Eye, Smile } from "./Face";

/**
 * A seated passenger in profile, facing left (towards the window).
 * Origin = centre of the head. Body reaches down to y = 560.
 */
export const Passenger: React.FC<{
  kind: "lady" | "nurse";
  breath?: number; // 0..1 sits a little taller on the in-breath
  mouthO?: number; // 0..1 rounded "haaa" mouth
  eyesClosed?: number;
  tilt?: number; // degrees, head tilt around the neck (negative = towards the window)
}> = ({ kind, breath = 0, mouthO = 0, eyesClosed = 0, tilt = 0 }) => {
  const lady = kind === "lady";
  const coat = lady ? COLORS.brown : COLORS.deepRed;
  const arm = lady ? COLORS.brownDark : COLORS.brown;
  const sy = 1 + 0.07 * breath;
  const sx = 1 - 0.02 * breath;
  return (
    <g transform={`translate(0 560) scale(${sx} ${sy}) translate(0 -560)`}>
      {/* body */}
      <path d="M -70 108 C -125 125 -140 210 -140 310 L -140 900 L 160 900 L 160 300 C 160 190 120 118 40 104 Z" fill={coat} />
      {/* hair behind the shoulders (lady: medium length, falls onto the coat) */}
      <g transform={`rotate(${tilt} 0 100)`}>
        {lady ? (
          <path
            d="M -40 -80 C 10 -118 95 -100 112 -30 C 126 30 118 100 128 158 C 131 178 108 186 86 176 C 62 166 40 168 14 172 C 30 120 40 60 30 10 Z"
            fill={COLORS.brownDark}
          />
        ) : (
          <g>
            <ellipse cx={14} cy={-14} rx={94} ry={92} fill={COLORS.brownDark} />
            <ellipse cx={108} cy={18} rx={30} ry={42} fill={COLORS.brownDark} />
            <rect x={78} y={-6} width={22} height={34} rx={10} fill={COLORS.golden} />
          </g>
        )}
      </g>
      {/* scarf (lady) or collar (nurse) */}
      {lady ? (
        <g>
          <rect x={-58} y={168} width={44} height={150} rx={22} fill={COLORS.burntOrange} transform="rotate(8 -36 168)" />
          <rect x={-80} y={86} width={170} height={58} rx={29} fill={COLORS.burntOrange} />
        </g>
      ) : (
        <g>
          <path d="M -62 104 Q -30 150 0 120 Q 30 150 66 104 Q 0 92 -62 104 Z" fill={COLORS.cream} />
        </g>
      )}
      {/* arm resting on the lap */}
      <path d="M 10 190 C -20 290 -60 360 -150 380" stroke={arm} strokeWidth={74} strokeLinecap="round" fill="none" />
      <circle cx={-168} cy={382} r={30} fill={COLORS.creamShade} />
      {!lady && (
        <g>
          <rect x={-250} y={400} width={170} height={120} rx={40} fill={COLORS.cream} />
          <path d="M -210 404 Q -165 340 -120 404" stroke={COLORS.creamShade} strokeWidth={14} strokeLinecap="round" fill="none" />
        </g>
      )}
      {/* head */}
      <g transform={`rotate(${tilt} 0 100)`}>
        {lady && <rect x={-26} y={50} width={52} height={50} rx={20} fill={COLORS.creamShade} />}
        <circle cx={0} cy={0} r={88} fill={COLORS.creamShade} />
        <circle cx={-84} cy={14} r={17} fill={COLORS.creamShade} />
        {/* fringe / top of the hair */}
        {lady ? (
          <path d="M -90 -18 C -98 -86 -36 -116 22 -110 C 70 -104 104 -76 112 -30 C 70 -66 20 -62 -24 -50 C -56 -40 -78 -30 -90 -18 Z" fill={COLORS.brownDark} />
        ) : (
          <path d="M -86 -26 C -86 -90 -20 -114 30 -106 C 76 -98 104 -66 106 -26 C 60 -60 0 -62 -86 -26 Z" fill={COLORS.brownDark} />
        )}
        <Eye x={-44} y={-6} closed={eyesClosed} />
        <ellipse cx={-30} cy={34} rx={17} ry={11} fill={COLORS.burntOrange} opacity={0.45} />
        <g opacity={1 - mouthO}>
          <Smile x={-62} y={50} w={22} depth={eyesClosed > 0.7 ? 5 : 8} />
        </g>
        {mouthO > 0 && <ellipse cx={-66} cy={52} rx={9 * mouthO} ry={12 * mouthO} fill={COLORS.brownDark} />}
      </g>
    </g>
  );
};
