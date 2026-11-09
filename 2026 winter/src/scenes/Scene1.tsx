import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ease, fadeInOut } from "../anim";
import { Background } from "../components/Background";
import { FallingLeaves } from "../components/FallingLeaves";
import { Frost } from "../components/Frost";
import { Leaf } from "../components/Leaf";
import { Pip } from "../components/Pip";
import { ThoughtBubble } from "../components/ThoughtBubble";
import { Zzz } from "../components/Zzz";
import { COLORS, HEIGHT, LEAF_COLORS, WIDTH, sec } from "../theme";

/* ------------------------------------------------------------------ */
/* Timeline (seconds). Change these to re-time the whole scene.        */
/* ------------------------------------------------------------------ */
export const T = {
  thisIsPip: [0, 3],
  hedgehog: [3, 5.5],
  perfectNest: [5.5, 10],
  allAsleep: [10, 14.5],
  fourLeaves: [14.5, 17.5],
  rejected: [17.5, 21],
  frost: [21, 24],
  bigThought: [24, 28.5],
  notPerfect: [28.5, 32],
  justThere: [32, 35.5],
  scoop: [35.5, 40],
  cosiest: [40, 45],
  breatheIntro: [45, 48],
  breatheIn: [48, 51], // 3 seconds in
  breatheOut: [51, 54], // 3 seconds out
} as const;

/** Ends with a 1-second gentle fade after the out-breath. */
export const SCENE1_DURATION = sec(55);

const S = (key: keyof typeof T) => [sec(T[key][0]), sec(T[key][1])] as const;

/* Pip's spot on the ground */
const PIP_X = 540;
const PIP_Y = 1585;
const PIP_SCALE = 1.25;

/* ------------------------------------------------------------------ */
/* Leaves: the rejected pile, the four good ones, and extra strays.    */
/* Each one ends up in the nest around Pip.                            */
/* ------------------------------------------------------------------ */
type NestLeaf = {
  kind: "rejected" | "kept" | "stray";
  start: { x: number; y: number; rot: number };
  appearAt: number; // frame
  nest: { x: number; y: number; rot: number; back: boolean };
  color: string;
  size: number;
  scoopDelay: number;
};

const REJECTED = 36;
const STRAYS = 16;

const buildLeaves = (): NestLeaf[] => {
  const leaves: NestLeaf[] = [];
  const r = (i: number, k: string) => random(`nest-${i}-${k}`);
  const total = REJECTED + 4 + STRAYS;
  const [rejStart, rejEnd] = S("rejected");
  const [fourStart] = S("fourLeaves");

  for (let i = 0; i < total; i++) {
    const kind: NestLeaf["kind"] =
      i < REJECTED ? "rejected" : i < REJECTED + 4 ? "kept" : "stray";

    let start: NestLeaf["start"];
    let appearAt: number;
    if (kind === "rejected") {
      // A heap to Pip's left, filled from the bottom up.
      const a = Math.PI + r(i, "a") * Math.PI;
      const rad = Math.sqrt(1 - i / REJECTED) * 0.95;
      start = {
        x: 190 + Math.cos(a) * 150 * rad,
        y: 1705 + Math.sin(a) * 110 * rad,
        rot: r(i, "rot") * 360,
      };
      appearAt = rejStart + 6 + ((rejEnd - rejStart - 30) * i) / REJECTED;
    } else if (kind === "kept") {
      const k = i - REJECTED;
      start = { x: 790 + k * 78, y: 1700, rot: 90 };
      appearAt = fourStart + 8 + k * 9;
    } else {
      // Strays blow in from the right edge during the scoop.
      start = {
        x: WIDTH + 80 + r(i, "sx") * 200,
        y: 1450 + r(i, "sy") * 300,
        rot: r(i, "rot") * 360,
      };
      appearAt = 0;
    }

    const theta = (i / total) * Math.PI * 2 + r(i, "t") * 0.25;
    const ring = 0.78 + r(i, "ring") * 0.3;
    leaves.push({
      kind,
      start,
      appearAt,
      nest: {
        x: PIP_X + Math.cos(theta) * 265 * ring,
        y: PIP_Y + 10 + Math.sin(theta) * 80 * ring,
        rot: r(i, "nrot") * 360,
        back: Math.sin(theta) < -0.1,
      },
      color: LEAF_COLORS[Math.floor(r(i, "c") * LEAF_COLORS.length)],
      size: kind === "kept" ? 80 : 62 + r(i, "s") * 26,
      scoopDelay: r(i, "d") * sec(1.2),
    });
  }
  return leaves;
};

const LEAVES = buildLeaves();

const leafState = (leaf: NestLeaf, frame: number) => {
  const [scoopStart] = S("scoop");
  const sStart = scoopStart + leaf.scoopDelay;
  const t = ease(frame, [sStart, sStart + sec(1.6)], [0, 1]);

  let visible = 1;
  let dropY = 0;
  if (leaf.kind !== "stray") {
    // Drop gently into place when it first appears.
    visible = ease(frame, [leaf.appearAt, leaf.appearAt + 8], [0, 1]);
    dropY = ease(frame, [leaf.appearAt, leaf.appearAt + 14], [-160, 0]);
  }
  // A little arc while being scooped.
  const hop = Math.sin(t * Math.PI) * -90;
  return {
    x: leaf.start.x + (leaf.nest.x - leaf.start.x) * t,
    y: leaf.start.y + dropY + (leaf.nest.y - leaf.start.y) * t + hop,
    rot: leaf.start.rot + (leaf.nest.rot - leaf.start.rot) * t,
    visible,
  };
};

const NestLeaves: React.FC<{ layer: "back" | "front" }> = ({ layer }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {LEAVES.filter((l) => l.nest.back === (layer === "back")).map((leaf, i) => {
        const s = leafState(leaf, frame);
        if (s.visible <= 0) return null;
        return (
          <Leaf
            key={i}
            x={s.x}
            y={s.y}
            rotate={s.rot}
            size={leaf.size}
            color={leaf.color}
            opacity={s.visible}
          />
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Thought bubble contents                                             */
/* ------------------------------------------------------------------ */
const Sparkle: React.FC<{ x: number; y: number; s: number; opacity?: number }> = ({ x, y, s, opacity = 1 }) => (
  <path
    transform={`translate(${x} ${y})`}
    d={`M 0 ${-s} Q 3 -3 ${s} 0 Q 3 3 0 ${s} Q -3 3 ${-s} 0 Q -3 -3 0 ${-s} Z`}
    fill={COLORS.golden}
    opacity={opacity}
  />
);

/** A tidy, symmetrical "perfect" nest. */
const PerfectNest: React.FC<{ sparkle: number; frame: number }> = ({ sparkle, frame }) => (
  <g>
    <path d="M -110 10 Q 0 120 110 10 Z" fill={COLORS.deepRed} />
    {[-90, -54, -18, 18, 54, 90].map((x, i) => (
      <Leaf key={i} x={x} y={18 + Math.abs(x) * -0.25} size={52} rotate={x * 0.9} color={i % 2 ? COLORS.golden : COLORS.burntOrange} />
    ))}
    {[
      [-120, -70, 18],
      [110, -80, 14],
      [0, -105, 20],
    ].map(([x, y, s], i) => (
      <Sparkle
        key={i}
        x={x}
        y={y - (1 - sparkle) * 60}
        s={s * (0.85 + 0.15 * Math.sin(frame * 0.12 + i))}
        opacity={sparkle}
      />
    ))}
  </g>
);

/** A messy, cosy heap with a heart. */
const CosyPile: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    {[
      [-80, 40, 20, COLORS.golden],
      [-30, 55, 140, COLORS.deepRed],
      [30, 45, 250, COLORS.burntOrange],
      [85, 40, 60, COLORS.goldenLight],
      [-50, 10, 300, COLORS.burntOrange],
      [10, 5, 110, COLORS.golden],
      [60, 0, 200, COLORS.deepRed],
      [-10, -25, 30, COLORS.goldenLight],
    ].map(([x, y, rot, color], i) => (
      <Leaf key={i} x={x as number} y={y as number} rotate={rot as number} size={66} color={color as string} />
    ))}
    <path
      transform={`translate(0 ${-95 + Math.sin(frame * 0.1) * 6}) scale(1.1)`}
      d="M 0 18 C -40 -8 -30 -40 -10 -36 C 0 -34 0 -26 0 -22 C 0 -26 0 -34 10 -36 C 30 -40 40 -8 0 18 Z"
      fill={COLORS.burntOrange}
    />
  </g>
);

/** A soft, round idea-glow. Pulses slowly, never flashes. */
const IdeaGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = 1 + Math.sin(frame * 0.09) * 0.04;
  return (
    <g transform={`scale(${pulse})`}>
      <circle r={95} fill={COLORS.goldenLight} opacity={0.45} />
      <circle r={62} fill={COLORS.golden} />
      <rect x={-26} y={52} width={52} height={36} rx={14} fill={COLORS.brown} />
      <path d="M -18 0 Q 0 -30 18 0" stroke={COLORS.cream} strokeWidth={8} strokeLinecap="round" fill="none" />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Waits for the hand-drawn font before rendering frames.              */
/* ------------------------------------------------------------------ */
const useFont = () => {
  const [handle] = useState(() => delayRender("Loading Patrick Hand font"));
  useEffect(() => {
    document.fonts
      .load(`84px 'Patrick Hand'`)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

/* ------------------------------------------------------------------ */
/* The scene                                                           */
/* ------------------------------------------------------------------ */
export const Scene1: React.FC = () => {
  useFont();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame;

  /* --- Pip's pose over time --- */
  const walkIn = ease(f, [0, sec(1.8)], [-260, PIP_X], (t) => 1 - Math.pow(1 - t, 2));
  const walking = f < sec(1.8);
  const hop = spring({ frame: f - sec(3.1), fps, config: { damping: 9, stiffness: 120 } });
  const hopY = f > sec(3.1) && f < sec(4.4) ? -Math.sin(Math.min(1, hop) * Math.PI) * 40 : 0;

  // Curling: into the nest, out for breathing, and small again on the out-breath.
  let curl = 0;
  let stretch = 0;
  const [scoopS, scoopE] = S("scoop");
  const [introS] = S("breatheIntro");
  const [inS, inE] = S("breatheIn");
  const [outS, outE] = S("breatheOut");
  if (f < introS) {
    curl = ease(f, [scoopE - sec(2.4), scoopE - sec(0.4)], [0, 1]);
  } else if (f < inS) {
    curl = ease(f, [introS + sec(0.4), introS + sec(2.4)], [1, 0]);
  } else if (f < outS) {
    stretch = ease(f, [inS, inE], [0, 1]);
  } else {
    stretch = ease(f, [outS, outE], [1, 0]);
    curl = ease(f, [outS + sec(0.3), outE], [0, 1]);
  }

  // Blinks every few seconds; eyes close as she curls up.
  const blinkCycle = f % 100;
  const blink = blinkCycle > 94 ? Math.sin(((blinkCycle - 94) / 6) * Math.PI) : 0;
  const sleepy = ease(curl, [0.45, 0.85], [0, 1], (t) => t);
  const eyesClosed = Math.max(blink, sleepy);

  // Little movements for each story beat.
  let tilt = 0;
  let shiverX = 0;
  const inBeat = (k: keyof typeof T) => f >= S(k)[0] && f < S(k)[1];
  if (inBeat("allAsleep")) tilt = Math.sin((f - S("allAsleep")[0]) * 0.07) * 5;
  if (inBeat("rejected")) tilt = Math.sin((f - S("rejected")[0]) * 0.35) * 4 * fadeInOut(f, ...S("rejected"), 10);
  const frostAmount =
    ease(f, [S("frost")[0], S("frost")[0] + sec(2)], [0, 1]) * ease(f, [S("cosiest")[0], S("cosiest")[0] + sec(3)], [1, 0]);
  const shiver = frostAmount * ease(f, [scoopS, scoopS + sec(1)], [1, 0]);
  shiverX = Math.sin(f * 1.3) * 3 * shiver;
  const smile = 1 - 0.75 * ease(f, [S("rejected")[0], S("rejected")[0] + sec(1)], [0, 1]) * ease(f, [S("justThere")[0], S("justThere")[0] + sec(1)], [1, 0]);

  /* --- world --- */
  const dusk = ease(f, [S("allAsleep")[0], S("allAsleep")[1]], [0, 0.7]) + ease(f, [S("cosiest")[0], S("cosiest")[1]], [0, 0.3]);

  // Other hedgehogs curl up and fall asleep.
  const sleepersIn = ease(f, [S("allAsleep")[0], S("allAsleep")[0] + sec(0.8)], [0, 1]);
  const sleepersCurl = ease(f, [S("allAsleep")[0] + sec(0.8), S("allAsleep")[0] + sec(2.6)], [0, 1]);





  const smallBubble = ease(f, [S("perfectNest")[0] + 6, S("perfectNest")[0] + 30], [0, 1]) * ease(f, [S("perfectNest")[1] - 14, S("perfectNest")[1]], [1, 0]);
  const bigBubble = ease(f, [S("bigThought")[0] + 6, S("bigThought")[0] + 40], [0, 1]) * ease(f, [S("justThere")[1] - 14, S("justThere")[1]], [1, 0]);
  const ideaOpacity = fadeInOut(f, S("bigThought")[0], S("bigThought")[1] + 6, 10);
  const perfectOpacity = fadeInOut(f, S("notPerfect")[0] - 6, S("notPerfect")[1] + 6, 10);
  const perfectSparkle = ease(f, [S("notPerfect")[0] + 30, S("notPerfect")[1] - 10], [1, 0]);
  const cosyOpacity = fadeInOut(f, S("justThere")[0] - 6, S("justThere")[1] + 20, 10);

  const glow = ease(f, [scoopE - sec(0.5), S("cosiest")[0] + sec(2)], [0, 1]);
  const ringOn = fadeInOut(f, inS - 10, outE + 10, 10);
  const ringR = f < outS ? ease(f, [inS, inE], [190, 330]) : ease(f, [outS, outE], [330, 190]);

  const endFade = ease(f, [outE, SCENE1_DURATION], [0, 1]);

  const pipX = walkIn + shiverX;
  const pipY = PIP_Y + hopY;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cream }}>
      <Background dusk={dusk} />
      <FallingLeaves count={14} opacity={0.8} />

      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="cosyGlow">
            <stop offset="0%" stopColor={COLORS.goldenLight} stopOpacity={0.85} />
            <stop offset="100%" stopColor={COLORS.goldenLight} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* sleeping hedgehogs on the hills */}
        <g opacity={sleepersIn}>
          {[
            { x: 250, y: 1290, s: 0.3, flip: 1 as const },
            { x: 880, y: 1300, s: 0.27, flip: -1 as const },
            { x: 450, y: 1078, s: 0.2, flip: 1 as const },
          ].map((h, i) => (
            <g key={i}>
              <Pip x={h.x} y={h.y} scale={h.s} facing={h.flip} curl={sleepersCurl} stretch={0} eyesClosed={sleepersCurl} smile={0.6} />
              <Zzz x={h.x + 20} y={h.y - 110 * h.s * 3} size={26} opacity={sleepersCurl} seed={i} />
            </g>
          ))}
        </g>

        {/* warm glow behind the finished nest */}
        <ellipse cx={PIP_X} cy={PIP_Y - 120} rx={520} ry={460} fill="url(#cosyGlow)" opacity={glow * 0.8} />

        {/* breathing guide ring */}
        {ringOn > 0 && (
          <circle
            cx={PIP_X}
            cy={PIP_Y - 170}
            r={ringR}
            fill={COLORS.golden}
            fillOpacity={0.14}
            stroke={COLORS.golden}
            strokeWidth={12}
            strokeOpacity={0.7}
            opacity={ringOn}
          />
        )}

        <NestLeaves layer="back" />

        <Pip
          x={pipX}
          y={pipY}
          scale={PIP_SCALE}
          curl={curl}
          stretch={stretch}
          eyesClosed={eyesClosed}
          walkPhase={walking ? f * 0.45 : undefined}
          tilt={tilt}
          smile={smile}
        />

        <NestLeaves layer="front" />

        {/* hearts rising from the cosy nest */}
        {[0, 1, 2].map((k) => {
          const start = S("cosiest")[0] + sec(1) + k * 25;
          const t = ease(f, [start, start + sec(2.6)], [0, 1], (x) => x);
          if (t <= 0 || t >= 1) return null;
          return (
            <path
              key={k}
              transform={`translate(${PIP_X - 90 + k * 90 + Math.sin(t * 6) * 14} ${PIP_Y - 260 - t * 260}) scale(1.2)`}
              d="M 0 18 C -40 -8 -30 -40 -10 -36 C 0 -34 0 -26 0 -22 C 0 -26 0 -34 10 -36 C 30 -40 40 -8 0 18 Z"
              fill={COLORS.burntOrange}
              opacity={Math.sin(t * Math.PI) * 0.9}
            />
          );
        })}

        {/* the small "perfect nest" daydream */}
        <ThoughtBubble x={800} y={980} toX={680} toY={1300} radius={160} progress={smallBubble}>
          <g transform="scale(0.9)">
            <PerfectNest sparkle={1} frame={f} />
          </g>
        </ThoughtBubble>

        {/* the BIG thought */}
        <ThoughtBubble x={560} y={900} toX={620} toY={1290} radius={250} progress={bigBubble}>
          <g opacity={ideaOpacity}>
            <IdeaGlow frame={f} />
          </g>
          <g opacity={perfectOpacity} transform="scale(1.3)">
            <PerfectNest sparkle={perfectSparkle} frame={f} />
          </g>
          <g opacity={cosyOpacity} transform="translate(0 30) scale(1.4)">
            <CosyPile frame={f} />
          </g>
        </ThoughtBubble>
      </svg>

      <Frost amount={frostAmount} />

      <AbsoluteFill style={{ backgroundColor: COLORS.cream, opacity: endFade }} />
    </AbsoluteFill>
  );
};
