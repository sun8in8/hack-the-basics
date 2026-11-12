import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, random, useCurrentFrame } from "remotion";
import { ease, fadeInOut } from "../anim";
import { BreathCircles } from "../components/BreathCircles";
import { BreathRing } from "../components/BreathRing";
import { Glow } from "../components/Glow";
import {
  BAY,
  BiscuitStand,
  COMFORTS,
  COUNTER_Y,
  Counter,
  Hall,
  HEART,
  Jar,
  STALL_X,
  STEP,
  Stairs,
} from "../components/Market";
import { BirdLady, Boy, MoustacheMan, NOZZLE, VelvetWoman } from "../components/People";
import { FoldedBlanket, Walker } from "../components/Walker";
import { COLORS, sec } from "../theme";

/* Timeline in seconds. Every value below is derived from this table. */
export const T = {
  stairs: [1.0, 3.6], // you step down 3 steps from the glowing door; lanterns light
  pan1: [4.5, 6.0], // → birdsong jars
  pan2: [10.0, 11.5], // → moustache man
  socksUp: [11.5, 12.7],
  smile: [14.2, 16.0], // after a pause, he smiles
  pan3: [16.0, 17.3], // → woman in velvet
  bottleUp: [17.3, 18.4],
  spray: [18.6, 20.6], // three puffs of mist
  breath: [21.0, 27.0], // 1 breath: 1-2-3 in, 1-2-3 out
  pan4: [28.5, 29.8], // → biscuits
  hearts: [30.0, 34.0],
  pan5: [35.0, 36.3], // → blankets
  blanketFloat: [36.8, 39.0], // blanket floats over to you
  blanketWrap: [39.0, 41.0], // ...and hugs you
  blanketUnwrap: [43.0, 44.6], // after a long hug, it lets go
  blanketBack: [44.6, 46.8], // ...and floats back to its pile
  pan6: [47.6, 48.9], // → small boy
  boyIn: [48.6, 50.2],
  boyOffer: [50.2, 51.2], // then a pause
  comforts: [52.2, 54.6], // five comforts float in and stay
  end: [59.0, 60.0], // fade to cream
} as const;
export const MARKET_DURATION = sec(60);
const S = (k: keyof typeof T) => [sec(T[k][0]), sec(T[k][1])] as [number, number];

const FEET = 1610;
const WALKER_X = 360;
const BREATHS = 1;
const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

const useFont = () => {
  const [handle] = useState(() => delayRender("Loading Patrick Hand"));
  useEffect(() => {
    document.fonts.load(`64px 'Patrick Hand'`).then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};

const PANS = ["pan1", "pan2", "pan3", "pan4", "pan5", "pan6"] as const;

export const SecretMarket: React.FC = () => {
  useFont();
  const f = useCurrentFrame();

  /* ---- camera: glides bay to bay ---- */
  let camX = 0;
  PANS.forEach((p) => {
    camX += ease(f, S(p), [0, BAY]);
  });
  const moving = (w: [number, number]) => ease(f, [w[0] - 8, w[0] + 8], [0, 1]) * ease(f, [w[1] - 8, w[1] + 8], [1, 0]);
  let walk = moving(S("stairs"));
  PANS.forEach((p) => {
    walk = Math.max(walk, moving(S(p)));
  });
  const phase = f * 0.26;

  /* ---- you: down the steps, then along the stalls ---- */
  const [stS, stE] = S("stairs");
  const p = ease(f, [stS, stE], [0, STEP.n], (t) => t);
  const step = Math.floor(Math.min(p, STEP.n - 0.0001));
  const frac = p - step;
  const stepY = STEP.top + STEP.rise * (step + Easing.inOut(Easing.quad)(Math.min(1, Math.max(0, (frac - 0.6) / 0.4))));
  const stairsX = STEP.x0 + 50 + STEP.run * p;
  const onFloor = f >= stE;
  const descendY = p >= STEP.n ? FEET : Math.min(FEET, stepY);
  const pan1 = S("pan1");
  const walkerX = f < pan1[0] ? stairsX : ease(f, pan1, [stairsX, WALKER_X], easeOutQuad);
  const walkerY = onFloor ? FEET : descendY;
  const walkerIn = ease(f, [0, 18], [0, 1]);

  /* ---- breathing ---- */
  const [bS, bE] = S("breath");
  const cycle = sec(6);
  const k = Math.floor((f - bS) / cycle);
  let breath = 0;
  if (f >= bS && f < bE && k < BREATHS) {
    const c0 = bS + k * cycle;
    breath = f < c0 + sec(3) ? ease(f, [c0, c0 + sec(3)], [0, 1]) : ease(f, [c0 + sec(3), c0 + cycle], [1, 0]);
  }
  const ringOn = ease(f, [bS - 12, bS], [0, 1]) * ease(f, [bE, bE + 15], [1, 0]);
  const mistGlow = ease(f, [sec(19.4), sec(21)], [0, 1]) * ease(f, [bE, bE + sec(1)], [1, 0]);

  /* ---- sellers ---- */
  const socksUp = ease(f, S("socksUp"), [0, 1]);
  const smile = ease(f, S("smile"), [0, 1]);
  const bottleUp = ease(f, S("bottleUp"), [0, 1]) * ease(f, [bS + sec(0.5), bS + sec(2.5)], [1, 0]);
  const [spS] = S("spray");
  const puffs = [0, 0.8, 1.6].map((d) => spS + sec(d));
  const squeeze = Math.max(...puffs.map((t0) => fadeInOut(f, t0, t0 + 14, 6)));
  const walkerEyes = ease(f, [bS, bS + sec(1)], [0, 1]) * ease(f, [bE, bE + sec(1)], [1, 0]);
  const velvetEyes = ease(f, [bS, bS + sec(1.5)], [0, 1]) * ease(f, [bE - sec(1), bE], [1, 0]);

  /* ---- blanket: floats over, hugs you, lets go, floats back to the pile ---- */
  const [blS, blE] = S("blanketFloat");
  const [bbS, bbE] = S("blanketBack");
  const bt = f < bbS ? ease(f, [blS, blE], [0, 1]) : ease(f, [bbS, bbE], [1, 0]);
  const floatOn = (f >= blS && f < blE + 12) || (f >= bbS - 12 && f < bbE);
  const capeOn = ease(f, [blE - 6, blE + 6], [0, 1]) * ease(f, [bbS - 6, bbS + 6], [1, 0]);
  const wrap = ease(f, S("blanketWrap"), [0, 1]) * ease(f, S("blanketUnwrap"), [1, 0]);
  const blanketOnPile = f < blS || f >= bbE;
  const blanketStart = { x: STALL_X + 40, y: COUNTER_Y - 168 };
  const blanketEnd = { x: WALKER_X, y: FEET - 395 };
  const bx = blanketStart.x + (blanketEnd.x - blanketStart.x) * bt;
  const by = blanketStart.y + (blanketEnd.y - blanketStart.y) * bt - Math.sin(bt * Math.PI) * 200;

  /* ---- boy ---- */
  const [biS, biE] = S("boyIn");
  const boyX = ease(f, [biS, biE], [1160, 720], easeOutQuad);
  const boyWalk = moving([biS, biE]);
  const offer = ease(f, S("boyOffer"), [0, 1]);

  const visibleFrom = Math.floor(camX / BAY);
  const station = (n: number) => n >= visibleFrom - 1 && n <= visibleFrom + 1;
  const lit0: [number, number] = [ease(f, [sec(0.5), sec(1.3)], [0, 1]), ease(f, [sec(1.4), sec(2.2)], [0, 1])];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cream }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {/* ---------- world (pans) ---------- */}
        <g transform={`translate(${-camX} 0)`}>
          <Hall from={visibleFrom - 1} to={visibleFrom + 1} frame={f} lit0={lit0} />
          {station(0) && <Stairs />}

          {/* bay 1: jars of summer birdsong */}
          {station(1) && (
            <g transform={`translate(${BAY + STALL_X} ${COUNTER_Y})`}>
              <BirdLady frame={f} />
              <Counter />
              <Jar x={-215} w={110} h={150} frame={f} seed={1} />
              <Jar x={0} w={120} h={160} frame={f} seed={2.5} />
              <Jar x={210} w={110} h={140} frame={f} seed={4} />
            </g>
          )}

          {/* bay 2: socks that remember warm sand */}
          {station(2) && (
            <g transform={`translate(${2 * BAY + STALL_X} ${COUNTER_Y})`}>
              <MoustacheMan frame={f} raise={socksUp} smile={smile} />
              <Counter />
            </g>
          )}

          {/* bay 3: woman in velvet with a bottle of mist */}
          {station(3) && (
            <g transform={`translate(${3 * BAY + STALL_X} ${COUNTER_Y})`}>
              <VelvetWoman frame={f} lift={bottleUp} squeeze={squeeze} eyesClosed={velvetEyes} />
              <Counter />
              {/* mist puffs drifting towards you */}
              {new Array(36).fill(0).map((_, i) => {
                const r = (s: string) => random(`mist-${i}-${s}`);
                const t0 = puffs[i % 3] + Math.round(r("d") * 10);
                const life = sec(3.2);
                if (f < t0 || f > t0 + life) return null;
                const t = (f - t0) / life;
                const ox = -180 + NOZZLE.x;
                const oy = -300 + NOZZLE.y;
                const dx = -(420 + r("x") * 240);
                const dy = 80 + (r("y") - 0.3) * 380;
                return (
                  <circle
                    key={i}
                    cx={ox + dx * t}
                    cy={oy + dy * t}
                    r={14 + 60 * t + r("s") * 20}
                    fill={i % 2 ? COLORS.cream : COLORS.goldenLight}
                    opacity={fadeInOut(f, t0, t0 + life, 14) * 0.38}
                  />
                );
              })}
            </g>
          )}

          {/* bay 4: biscuits that taste like being understood */}
          {station(4) && (
            <g transform={`translate(${4 * BAY + STALL_X} ${COUNTER_Y})`}>
              <Glow id="biscuitGlow" x={0} y={-200} rx={340} ry={300} opacity={ease(f, [sec(39.5), sec(40.6)], [0.3, 0.8])} />
              <Counter />
              <BiscuitStand />
              {new Array(7).fill(0).map((_, i) => {
                const r = (s: string) => random(`heart-${i}-${s}`);
                const t0 = sec(T.hearts[0]) + Math.round(i * 12 + r("d") * 8);
                const life = sec(2.6);
                if (f < t0 || f > t0 + life) return null;
                const t = (f - t0) / life;
                const x = (r("x") - 0.5) * 320 + Math.sin(f * 0.07 + i) * 14;
                return <path key={i} d={HEART} transform={`translate(${x} ${-360 - t * 330}) scale(${0.8 + r("s") * 0.5})`} fill={COLORS.burntOrange} opacity={fadeInOut(f, t0, t0 + life, 14)} />;
              })}
            </g>
          )}

          {/* bay 5: blankets that hug back */}
          {station(5) && (
            <g transform={`translate(${5 * BAY + STALL_X} ${COUNTER_Y})`}>
              <Counter />
              <FoldedBlanket x={40} y={-36} w={330} h={70} color={COLORS.deepRed} />
              <FoldedBlanket x={40} y={-102} w={310} h={64} color={COLORS.golden} />
              {blanketOnPile && <FoldedBlanket x={40} y={-168} w={290} h={64} />}
            </g>
          )}
        </g>

        {/* ---------- screen space ---------- */}
        <Glow id="mistGlow" x={WALKER_X + 40} y={FEET - 380} rx={460} ry={520} opacity={mistGlow * (0.55 + 0.25 * breath)} />
        {mistGlow > 0 &&
          new Array(12).fill(0).map((_, i) => {
            const r = (s: string) => random(`mote-${i}-${s}`);
            const a = r("a") * Math.PI * 2 + f * 0.004 * (i % 2 ? 1 : -1);
            const d = 230 + r("d") * 160;
            return <circle key={i} cx={WALKER_X + 40 + Math.cos(a) * d} cy={FEET - 380 + Math.sin(a) * d * 1.1} r={22 + r("s") * 26} fill={COLORS.cream} opacity={0.22 * mistGlow} />;
          })}
        <BreathRing x={WALKER_X + 20} y={FEET - 380} r={200 + 140 * breath} opacity={ringOn} color={COLORS.golden} />

        {/* the small boy */}
        {f >= biS - 2 && (
          <g transform={`translate(${boyX} ${FEET + 10})`}>
            <Glow id="handGlow" x={0} y={-215} rx={90} ry={90} opacity={offer * 0.9} />
            <Boy frame={f} walk={boyWalk} phase={phase} offer={offer} />
          </g>
        )}

        {/* the blanket floating over (it passes behind you, then wraps round the front) */}
        {floatOn && (
          <g opacity={1 - capeOn}>
            <FoldedBlanket x={bx} y={by} w={290 + 150 * bt} h={64 + 330 * bt} rot={Math.sin(bt * Math.PI) * -8} />
          </g>
        )}
        <g opacity={walkerIn}>
          <Walker x={walkerX} y={walkerY} walk={walk} phase={phase} breath={breath} blanket={capeOn} wrap={wrap} frame={f} eyesClosed={walkerEyes} />
        </g>

        {/* little hearts once the blanket hugs you */}
        {new Array(4).fill(0).map((_, i) => {
          const t0 = sec(T.blanketWrap[1] - 0.4) + i * 12;
          const life = sec(2.2);
          if (f < t0 || f > t0 + life) return null;
          const t = (f - t0) / life;
          return <path key={i} d={HEART} transform={`translate(${WALKER_X - 120 + i * 80} ${FEET - 760 - t * 220}) scale(0.9)`} fill={COLORS.burntOrange} opacity={fadeInOut(f, t0, t0 + life, 12)} />;
        })}

        {/* five comforts: choose one yourself */}
        {COMFORTS.map((C, i) => {
          const t0 = sec(T.comforts[0]) + Math.round(i * sec(0.45));
          if (f < t0) return null;
          const a = Math.PI * (5 / 6 - (i / 4) * (4 / 6));
          const cx = 600 + Math.cos(a) * 380;
          const cy = 900 - Math.sin(a) * 380 + Math.sin(f * 0.1 + i * 1.3) * 6;
          const g = ease(f, [t0, t0 + 30], [0, 1]);
          return (
            <g key={i} transform={`translate(${cx} ${cy + (1 - g) * 40}) scale(${0.6 + 0.4 * g})`} opacity={g}>
              <C frame={f} />
            </g>
          );
        })}
      </svg>

      {/* breath count: 1 2 3 in, 1 2 3 out */}
      {new Array(BREATHS * 2).fill(0).map((_, i) => (
        <BreathCircles key={i} start={bS + i * sec(3)} />
      ))}

      <AbsoluteFill style={{ backgroundColor: COLORS.cream, opacity: Math.max(ease(f, [0, 18], [1, 0]), ease(f, S("end"), [0, 1])) }} />
    </AbsoluteFill>
  );
};
