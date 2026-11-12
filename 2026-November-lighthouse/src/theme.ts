import "@fontsource/patrick-hand/400.css";

export const COLORS = {
  burntOrange: "#D2691E",
  golden: "#E8A33D",
  deepRed: "#A0522D",
  cream: "#FFF4E0",
  brown: "#6B4226",
  // Softer tints mixed from the palette (used for shading only)
  creamShade: "#F6E2C0",
  goldenLight: "#F3C978",
  brownDark: "#553319",
  // Night (lighthouse keeper Short): sky, sea and silhouettes
  nightSky: "#141B2E",
  nightSkyLow: "#2B3A5C",
  nightSea: "#1A2440",
  nightWave: "#33466E",
  nightRock: "#0E1424",
  // Soft sage green (the keeper's scarf)
  sage: "#9DB58A",
  sageDark: "#7A9468",
} as const;

export const LEAF_COLORS = [
  COLORS.burntOrange,
  COLORS.golden,
  COLORS.deepRed,
  COLORS.goldenLight,
];

export const FONT_FAMILY = "'Patrick Hand', 'Comic Sans MS', cursive";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const sec = (s: number) => Math.round(s * FPS);
