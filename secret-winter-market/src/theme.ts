import "@fontsource/patrick-hand/400.css";

/** The 2026 winter palette. Use only these values. */
export const COLORS = {
  burntOrange: "#D2691E",
  golden: "#E8A33D",
  deepRed: "#A0522D",
  cream: "#FFF4E0",
  brown: "#6B4226",
  // tints mixed from the palette
  creamShade: "#F6E2C0",
  goldenLight: "#F3C978",
  brownDark: "#553319",
} as const;

/** Patrick Hand is used only for the breath count numbers (and approved one-off words). */
/**
 * One-off, approved by Su for this video: the main lady's green coat.
 * A muted olive so it sits with the warm autumn palette.
 */
export const COAT_GREEN = "#6F7A3A";
export const COAT_GREEN_DARK = "#555E2B";

export const FONT_FAMILY = "'Patrick Hand', 'Comic Sans MS', cursive";

export const FPS = 30;
/** Default: vertical Short. Other formats are listed in STYLE_GUIDE.md §2. */
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const sec = (s: number) => Math.round(s * FPS);
