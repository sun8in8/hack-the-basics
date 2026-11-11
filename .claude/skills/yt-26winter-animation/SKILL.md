---
name: yt-26winter-animation
description: House style for the 2026 winter YouTube Shorts featuring Pip the hedgehog (Remotion, 1080x1920, 30fps, warm autumn palette, gentle motion, no flashes). Use whenever the user asks for a new scene, Short or animation in this style, mentions Pip the hedgehog, the "2026 winter" project or a breathing exercise animation, or types /yt-26winter-animation.
---

# 2026 winter animation style (Pip the hedgehog)

The user makes calm, friendly vertical YouTube Shorts in a fixed house style. They should never
have to explain the style again. Follow it exactly unless they ask for a change in this
conversation.

## Before you write any code

1. Read `2026 winter/STYLE_GUIDE.md` in full. It has the exact hex colours, font, easing curves,
   durations, shape paths, Pip's character sheet, layer order and the scene 1 timeline.
2. Look at the reference stills in `2026 winter/style-guide/*.png` so you know the target look.
3. Skim `2026 winter/src/scenes/Scene1.tsx`. It is the working example of how a scene is built
   (the `T` timeline in seconds, the `S()` helper, `ease` and `fadeInOut`).

## Non-negotiables (summary; the guide has the details)

- Remotion project in `2026 winter/`, **1080×1920, 30fps**.
- Palette only: burnt orange `#D2691E`, golden `#E8A33D`, deep red `#A0522D`, cream `#FFF4E0`,
  soft brown `#6B4226`, plus the tints `#F6E2C0`, `#F3C978`, `#553319`, and white for frost.
- Font: **Patrick Hand** via `@fontsource/patrick-hand`. Use as few words as possible on screen (the
  user removed the captions; only the counters and the breath numbers stay).
- Motion: `Easing.inOut(Easing.cubic)` by default. Fades of at least 8 frames, no flashes, no hard
  cuts, slow sine loops, and only the soft springs listed in the guide.
- Rounded everything. Falling leaves are always in the background.
- Reuse the existing components (`Pip`, `Leaf`, `FallingLeaves`, `Background`, `ThoughtBubble`,
  `Frost`, `Zzz`). Never redraw Pip. Pose her with `curl`, `stretch`, `eyesClosed`, `tilt` and `smile`.
- Breathing exercises: 3s in while stretching tall, then 3s out while curling small, with the
  golden ring and the 1‑2‑3 circles.
- Use `random(seed)`, never `Math.random()`.

## Workflow

1. Add the new scene as `src/scenes/SceneN.tsx` and register it in `src/Root.tsx`.
2. Ask the user about anything the script leaves open (pacing, words on screen or not, how many
   breaths) before building.
3. Typecheck with `npx tsc --noEmit`, render stills, and compare them with `style-guide/*.png`.
   Then render the MP4 and send it to the user.
4. If you change the style on purpose, at the user's request, update `STYLE_GUIDE.md` in the same
   commit so the guide stays the source of truth.

Cloud session tips: render with `--browser-executable=/opt/pw-browsers/chromium`. If npm can't
reach the registry, prefix npm commands with
`env -u NO_PROXY -u no_proxy npm_config_noproxy=localhost`.
