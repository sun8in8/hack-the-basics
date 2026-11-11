import { FPS } from "./theme";

/**
 * Scene boundaries on the voiceover timeline, in seconds.
 * Boundaries sit inside the pauses between sections, so the clips tile
 * the whole voiceover with no gaps or overlaps.
 * Each clip's length = its end frame - its start frame (rounded at 29.97 fps).
 */
export const SCENES = [
  { id: "S01", name: "opening-breath", layout: "split", start: 0, end: 11.6 },
  { id: "S02", name: "story-time-starts", layout: "full", start: 11.6, end: 24.8 },
  { id: "S03", name: "a-small-smile", layout: "split", start: 24.8, end: 46.6 },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const sceneFrames = (id: SceneId) => {
  const s = SCENES.find((x) => x.id === id)!;
  const from = Math.round(s.start * FPS);
  const to = Math.round(s.end * FPS);
  return { from, to, duration: to - from };
};

/** Absolute voiceover time (seconds) → frame inside a scene clip. */
export const at = (id: SceneId, absSeconds: number) =>
  Math.round(absSeconds * FPS) - sceneFrames(id).from;
