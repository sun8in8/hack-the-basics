import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease } from "../anim";
import { BreathRing } from "../components/BreathRing";
import { FallingLeaves } from "../components/FallingLeaves";
import { Landscape } from "../components/Landscape";
import { Leaf } from "../components/Leaf";
import { Voiceover } from "../components/Voiceover";
import { COLORS } from "../theme";
import { at, sceneFrames } from "../timeline";
import { SceneProps } from "./common";

/**
 * S01 · 0:00.0–0:11.6 · split
 * "Ready? … and a breath out … simple pauses like this"
 * One big golden leaf breathes with the voice: it rises and grows on the
 * in-breath (the pause after "Ready?") and settles on "a breath out".
 */
export const S01OpeningBreath: React.FC<SceneProps> = ({ withAudio }) => {
  const f = useCurrentFrame();
  const t = (s: number) => at("S01", s);

  // In-breath: the silence after "Ready?" (0.53–2.61s). Out-breath: from "breath out" (3.5s).
  const breath = f < t(3.3) ? ease(f, [t(0.6), t(2.7)], [0, 1]) : ease(f, [t(3.4), t(7.4)], [1, 0]);
  const ringOn = ease(f, [t(0.1), t(0.7)], [0, 1]) * ease(f, [t(9.4), t(11.0)], [1, 0]);
  const leafScale = 1 + 0.12 * breath;
  const leafY = 470 - 36 * breath;
  const sway = Math.sin(f * 0.03) * 6;
  const fadeFromCream = ease(f, [0, 18], [1, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cream }}>
      <Landscape dusk={0.45} moon={{ x: 300, y: 250, r: 58, opacity: 0.85 }} />
      <FallingLeaves count={10} seed="s01" />
      <svg width={960} height={1080} viewBox="0 0 960 1080" style={{ position: "absolute", inset: 0 }}>
        <BreathRing x={480} y={470} r={175 + 115 * breath} opacity={ringOn} />
        <ellipse cx={480} cy={800} rx={150 - 20 * breath} ry={18} fill={COLORS.brownDark} opacity={0.12} />
        <Leaf x={480} y={leafY} size={300 * leafScale} rotate={-18 + sway} color={COLORS.golden} />
      </svg>
      <AbsoluteFill style={{ backgroundColor: COLORS.cream, opacity: fadeFromCream }} />
      <Voiceover fromFrame={sceneFrames("S01").from} withAudio={withAudio} />
    </AbsoluteFill>
  );
};
