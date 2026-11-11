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
