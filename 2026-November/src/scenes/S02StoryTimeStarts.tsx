import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { ease } from "../anim";
import { FallingLeaves } from "../components/FallingLeaves";
import { Landscape } from "../components/Landscape";
import { Voiceover } from "../components/Voiceover";
import { COLORS } from "../theme";
import { at, sceneFrames } from "../timeline";
import { SceneProps } from "./common";

/**
 * S02 · 0:11.6–0:24.8 · FULL
 * "Shhh, story time starts wherever you are … you are welcome right here."
 * Series opener with no text: a big moon rises slowly over the garden,
 * golden motes drift up, and on "welcome right here" a warm glow pools in
 * the middle of the ground like an invitation.
 */
export const S02StoryTimeStarts: React.FC<SceneProps> = ({ withAudio }) => {
  const f = useCurrentFrame();
  const t = (s: number) => at("S02", s);

  const moonY = ease(f, [t(12.0), t(21.5)], [720, 330]);
  const dusk = ease(f, [0, t(24.8)], [0.45, 0.75]);
  const welcome = ease(f, [t(22.2), t(24.6)], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cream }}>
      <Landscape dusk={dusk} moon={{ x: 960, y: moonY, r: 130 }} />
      <FallingLeaves count={16} seed="s02" sizeScale={1.15} />
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="welcomeGlow">
            <stop offset="0%" stopColor={COLORS.goldenLight} stopOpacity={0.9} />
            <stop offset="100%" stopColor={COLORS.goldenLight} stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={960} cy={820} rx={520} ry={170} fill="url(#welcomeGlow)" opacity={welcome * 0.85} />
        {/* golden motes drifting slowly upward */}
        {new Array(22).fill(0).map((_, i) => {
          const r = (k: string) => random(`mote-${i}-${k}`);
          const cycle = 260 + r("c") * 160;
          const p = ((f + r("o") * cycle) % cycle) / cycle;
          const x = 160 + r("x") * 1600 + Math.sin(f * 0.02 + r("ph") * 6.28) * 30;
          const y = 860 - p * 520;
          return (
            <circle key={i} cx={x} cy={y} r={5 + r("s") * 6} fill={COLORS.cream} opacity={Math.sin(p * Math.PI) * 0.7} />
          );
        })}
      </svg>
      <Voiceover fromFrame={sceneFrames("S02").from} withAudio={withAudio} />
    </AbsoluteFill>
  );
};
