import "@fontsource/patrick-hand/400.css";

/** Same palette as `2026 winter/STYLE_GUIDE.md` §3. */
export const COLORS = {
  burntOrange: "#D2691E",
  golden: "#E8A33D",
  deepRed: "#A0522D",
  cream: "#FFF4E0",
  brown: "#6B4226",
  creamShade: "#F6E2C0",
  goldenLight: "#F3C978",
  brownDark: "#553319",
} as const;

export const LEAF_COLORS = [COLORS.burntOrange, COLORS.golden, COLORS.deepRed, COLORS.goldenLight];

export const FONT_FAMILY = "'Patrick Hand', 'Comic Sans MS', cursive";

/** NTSC 29.97 fps, exactly 30000/1001, to match camera footage. */
export const FPS = 30000 / 1001;

/** Right-hand panel next to the presenter. */
export const SPLIT = { width: 960, height: 1080 } as const;
/** Whole frame. */
export const FULL = { width: 1920, height: 1080 } as const;

/** Seconds to frames at 29.97. */
export const sec = (s: number) => Math.round(s * FPS);

/**
 * Safe zone: nothing important below 85% of the height (bottom 15%),
 * and nothing important in the top corners.
 */
export const SAFE_BOTTOM = 0.85;
