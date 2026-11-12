import React from "react";
import { useCurrentFrame } from "remotion";
import { ease, fadeInOut } from "../anim";
import { COLORS, FONT_FAMILY, sec } from "../theme";

/**
 * Three numbered circles that fill one per second: 1, 2, 3.
 * Use one for the in-breath (3s) and a fresh one for the out-breath (3s).
 * These numbers are the ONLY words/numbers allowed on screen by default.
 */
export const BreathCircles: React.FC<{ start: number; top?: number; size?: number }> = ({ start, top = 300, size = 110 }) => {
  const frame = useCurrentFrame();
  const end = start + sec(3);
  if (frame < start - 8 || frame > end + 8) return null;
  const opacity = fadeInOut(frame, start - 8, end + 8, 8);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", gap: size * 0.4, opacity }}>
      {[0, 1, 2].map((k) => {
        const on = ease(frame, [start + sec(k), start + sec(k) + 12], [0, 1]);
        return (
          <div
            key={k}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              border: `${Math.round(size * 0.073)}px solid ${COLORS.golden}`,
              background: COLORS.cream,
              boxSizing: "border-box",
              boxShadow: `0 10px 30px ${COLORS.brown}22`,
              transform: `scale(${0.8 + on * 0.2})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_FAMILY,
              fontSize: size * 0.58,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", inset: 0, borderRadius: size / 2, background: COLORS.golden, opacity: on }} />
            <span style={{ position: "relative", color: on > 0.5 ? COLORS.cream : COLORS.golden }}>{k + 1}</span>
          </div>
        );
      })}
    </div>
  );
};
