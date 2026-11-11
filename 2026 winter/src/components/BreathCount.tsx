import React from "react";
import { useCurrentFrame } from "remotion";
import { ease, fadeInOut } from "../anim";
import { COLORS, FONT_FAMILY, sec } from "../theme";

/**
 * Three numbered circles (1 2 3) that fill one per second across a 3-second
 * breath part (in, hold or out). Same look as the circles in Scene 1.
 */
export const BreathCount: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const frame = useCurrentFrame();
  if (frame < start - 8 || frame > end + 8) return null;
  const opacity = fadeInOut(frame, start - 8, end + 8, 8);
  return (
    <div
      style={{
        position: "absolute",
        top: 300,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 44,
        opacity,
      }}
    >
      {[0, 1, 2].map((k) => {
        const on = ease(frame, [start + sec(k), start + sec(k) + 12], [0, 1]);
        return (
          <div
            key={k}
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              border: `8px solid ${COLORS.golden}`,
              background: COLORS.cream,
              boxSizing: "border-box",
              boxShadow: `0 10px 30px ${COLORS.brown}22`,
              transform: `scale(${0.8 + on * 0.2})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_FAMILY,
              fontSize: 64,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 55,
                background: COLORS.golden,
                opacity: on,
              }}
            />
            <span style={{ position: "relative", color: on > 0.5 ? COLORS.cream : COLORS.golden }}>{k + 1}</span>
          </div>
        );
      })}
    </div>
  );
};
