import { Easing, interpolate } from "remotion";

const gentle = Easing.inOut(Easing.cubic);

/** Clamped, eased interpolation between two values over a frame range. */
export const ease = (
  frame: number,
  [start, end]: [number, number],
  [from, to]: [number, number],
  easing: (t: number) => number = gentle,
) =>
  interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Fades in over `fade` frames from `start`, and out over `fade` frames before `end`. */
export const fadeInOut = (
  frame: number,
  start: number,
  end: number,
  fade = 12,
) =>
  interpolate(frame, [start, start + fade, end - fade, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: gentle,
  });
