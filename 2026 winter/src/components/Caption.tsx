import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_FAMILY } from "../theme";
import { fadeInOut } from "../anim";

type Props = {
  /** Wrap words in *asterisks* to colour them burnt orange. */
  text: string;
  start: number;
  end: number;
  fontSize?: number;
  children?: React.ReactNode;
};

const renderEmphasis = (text: string) =>
  text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <span key={i} style={{ color: COLORS.burntOrange }}>
        {part.slice(1, -1)}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );

/** One line of the story in a soft cream card near the top of the frame. */
export const Caption: React.FC<Props> = ({
  text,
  start,
  end,
  fontSize = 84,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start || frame > end) return null;

  const opacity = fadeInOut(frame, start, end, 10);
  const rise = spring({
    frame: frame - start,
    fps,
    config: { damping: 18, stiffness: 90 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 230,
        left: 70,
        right: 70,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${(1 - rise) * 30}px) scale(${0.96 + rise * 0.04})`,
      }}
    >
      <div
        style={{
          background: COLORS.cream,
          borderRadius: 56,
          padding: "38px 54px",
          boxShadow: `0 14px 0 ${COLORS.golden}55, 0 22px 50px ${COLORS.brown}22`,
          border: `6px solid ${COLORS.golden}`,
          fontFamily: FONT_FAMILY,
          fontSize,
          lineHeight: 1.15,
          color: COLORS.brown,
          textAlign: "center",
        }}
      >
        {renderEmphasis(text)}
        {children}
      </div>
    </div>
  );
};
