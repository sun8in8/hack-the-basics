import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { ease } from "../anim";
import { FallingLeaves } from "../components/FallingLeaves";
import { Landscape } from "../components/Landscape";
import { Leaf } from "../components/Leaf";
import { Pip } from "../components/Pip";
import { Voiceover } from "../components/Voiceover";
import { COLORS, LEAF_COLORS } from "../theme";
import { at, sceneFrames } from "../timeline";
import { blinkAt, SceneProps } from "./common";

/**
 * S03 · 0:24.8–0:46.6 · split
 * "Well, today's story is a little bit silly … a dark evening … a small smile."
 * A big leaf pile wiggles on "silly", Pip's face slowly rises out of it, a
 * leaf drifts down and lands on her head, the evening deepens, and on
 * "small smile" she smiles.
 */
const PILE = { x: 480, y: 925, rx: 390, ry: 175 };
const PIP_X = 430;
const PIP_SCALE = 1.7;
const PIP_HIDDEN_Y = 1240;
const PIP_SHOWN_Y = 830;

type PileLeaf = { x: number; y: number; rot: number; size: number; color: string; back: boolean };
const PILE_LEAVES: PileLeaf[] = (() => {
  const leaves: PileLeaf[] = [];
  const color = (i: number) => LEAF_COLORS[Math.floor(random(`pile-c-${i}`) * LEAF_COLORS.length)];
  // A ruffled edge of leaves along the top of the mound (some behind Pip).
  for (let i = 0; i < 26; i++) {
    const r = (k: string) => random(`pile-edge-${i}-${k}`);
    const a = Math.PI + ((i + 0.5) / 26) * Math.PI;
    leaves.push({
      x: PILE.x + Math.cos(a) * PILE.rx * 0.97,
      y: PILE.y + Math.sin(a) * PILE.ry * 0.97 + 10,
      rot: r("rot") * 360,
      size: 96 + r("s") * 34,
      color: color(i),
      back: i % 3 === 0,
    });
  }
  // Fill the body of the mound evenly (rejection sampling inside its outline).
  let n = 0;
  for (let i = 0; n < 70 && i < 2000; i++) {
    const r = (k: string) => random(`pile-fill-${i}-${k}`);
    const x = PILE.x + (r("x") * 2 - 1) * PILE.rx * 1.02;
    const y = PILE.y - PILE.ry + r("y") * (1080 + 40 - (PILE.y - PILE.ry));
    const dx = (x - PILE.x) / PILE.rx;
    const edgeY = PILE.y - PILE.ry * Math.sqrt(Math.max(0, 1 - dx * dx));
    if (y < edgeY + 40) continue;
    leaves.push({ x, y, rot: r("rot") * 360, size: 92 + r("s") * 44, color: color(100 + n), back: false });
    n++;
  }
  // Draw from top to bottom so lower leaves overlap the ones above.
  return leaves.sort((a, b) => a.y - b.y);
})();

export const S03ASmallSmile: React.FC<SceneProps> = ({ withAudio }) => {
  const f = useCurrentFrame();
  const t = (s: number) => at("S03", s);

  // "a little bit silly" → the pile wiggles (gently, about 1.5s)
  const wiggle = ease(f, [t(28.5), t(29.2)], [0, 1]) * ease(f, [t(29.8), t(30.6)], [1, 0]);
  // "that's on purpose" → Pip rises slowly out of the pile
  const pipY = ease(f, [t(30.4), t(32.8)], [PIP_HIDDEN_Y, PIP_SHOWN_Y]);
  // she looks around while "sometimes the kindest thing…"
  const look = ease(f, [t(33.6), t(34.6)], [0, 1]) * ease(f, [t(38.6), t(39.6)], [1, 0]);
  const tilt = Math.sin((f - t(33.6)) * 0.05) * 5 * look;

  // A leaf drifts down and lands on her head
  const landT = ease(f, [t(35.2), t(39.4)], [0, 1]);
  const headX = PIP_X + (190 - 200) * PIP_SCALE;
  const headY = PIP_SHOWN_Y - (360 - 120) * PIP_SCALE;
  const fallLeafX = headX + 160 * (1 - landT) + Math.sin(landT * 7) * 50 * (1 - landT);
  const fallLeafY = -120 + (headY + 120) * landT;
  const surprisedBlink = f > t(39.4) && f < t(39.4) + 8 ? Math.sin(((f - t(39.4)) / 8) * Math.PI) : 0;

  // "on a dark evening" → the sky deepens
  const dusk = 0.45 + ease(f, [t(39.8), t(43.0)], [0, 0.3]);
  // "a small smile"
  const smile = ease(f, [t(44.3), t(45.6)], [0.3, 1]);
  const warm = ease(f, [t(44.3), t(46.2)], [0, 1]);

  const pileLeaf = (l: PileLeaf, i: number) => (
    <Leaf
      key={i}
      x={l.x}
      y={l.y + Math.sin(f * 0.5 + i) * 3 * wiggle}
      rotate={l.rot + Math.sin(f * 0.35 + i * 1.7) * 7 * wiggle}
      size={l.size}
      color={l.color}
    />
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cream }}>
      <Landscape dusk={dusk} moon={{ x: 300, y: 250, r: 58, opacity: 0.85 }} />
      <FallingLeaves count={10} seed="s03" />
      <svg width={960} height={1080} viewBox="0 0 960 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="smileGlow">
            <stop offset="0%" stopColor={COLORS.goldenLight} stopOpacity={0.85} />
            <stop offset="100%" stopColor={COLORS.goldenLight} stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={PIP_X + 60} cy={640} rx={360} ry={300} fill="url(#smileGlow)" opacity={warm * 0.7} />

        {PILE_LEAVES.filter((l) => l.back).map(pileLeaf)}

        <Pip
          x={PIP_X}
          y={pipY}
          scale={PIP_SCALE}
          curl={0}
          stretch={0}
          eyesClosed={Math.max(blinkAt(f, 40), surprisedBlink)}
          tilt={tilt}
          smile={smile}
        />

        {/* the front of the pile hides Pip's body */}
        <path
          d={`M ${PILE.x - PILE.rx - 40} 1080 Q ${PILE.x - PILE.rx} 1040 ${PILE.x - PILE.rx} ${PILE.y} A ${PILE.rx} ${PILE.ry} 0 0 1 ${PILE.x + PILE.rx} ${PILE.y} Q ${PILE.x + PILE.rx} 1040 ${PILE.x + PILE.rx + 40} 1080 Z`}
          fill={COLORS.deepRed}
        />
        {PILE_LEAVES.filter((l) => !l.back).map(pileLeaf)}

        {landT > 0 && (
          <Leaf x={fallLeafX} y={fallLeafY} size={110} rotate={-30 + Math.sin(landT * 6) * 40 * (1 - landT) + tilt} color={COLORS.golden} />
        )}
      </svg>
      <Voiceover fromFrame={sceneFrames("S03").from} withAudio={withAudio} />
    </AbsoluteFill>
  );
};
