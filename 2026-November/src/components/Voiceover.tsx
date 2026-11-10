import React from "react";
import { Audio, staticFile } from "remotion";

/**
 * Plays the matching slice of the voiceover for review renders.
 * `withAudio` is false for the silent editing clips.
 */
export const Voiceover: React.FC<{ fromFrame: number; withAudio: boolean }> = ({ fromFrame, withAudio }) =>
  withAudio ? <Audio src={staticFile("voiceover.m4a")} trimBefore={fromFrame} /> : null;
