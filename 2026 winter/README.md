# Pip the hedgehog — winter Short (Remotion)

Vertical YouTube Short, **1080×1920 @ 30fps**, made with [Remotion](https://www.remotion.dev/).

## Scene 1 (55s, no words)

There are no story captions. The only text is the "rejected" counter that climbs to 300, the
"4 good leaves" tag, and the numbered 1‑2‑3 breath circles.

1. **Story (0–45s):** follows the script beat by beat. Pip walks in, dreams of a perfect nest, the
   other hedgehogs fall asleep, she has 4 leaves and rejects 300, the frost comes, she has a big
   thought, scoops up any old leaves and curls into the cosiest nest.
2. **Breathing (45–58s):** Pip uncurls, then does one breath:
   **breathe in for 3s and stretch tall**, **breathe out for 3s and curl small**. A soft golden
   ring grows and shrinks with the breath, and three numbered circles fill one per second. The video ends with a 1-second fade to cream.

Style: autumn palette (`#D2691E`, `#E8A33D`, `#A0522D`, `#FFF4E0`, `#6B4226`), rounded SVG
shapes, falling leaves in the background a hand-drawn *Patrick Hand* font for the little "z"s, and only eased fades with no flashes.

## Use it

```bash
npm install
npm run dev        # opens Remotion Studio to preview and scrub
npm run render     # writes out/scene1.mp4
```

If Remotion can't download its own headless Chrome, point it at an existing Chromium:

```bash
npx remotion render Scene1 out/scene1.mp4 --browser-executable=/path/to/chromium
```

## Where things live

| File | What it does |
| --- | --- |
| `src/scenes/Scene1.tsx` | Timeline `T` (seconds per beat) and all the scene choreography |
| `src/components/Pip.tsx` | Pip, posed with `curl` (0 standing → 1 ball), `stretch`, `eyesClosed`, `tilt`, `smile`, `walkPhase` |
| `src/components/FallingLeaves.tsx` | Deterministic, slow, swaying background leaves |
| `src/components/Background.tsx` | Sky, sun, hills, trees, ground (`dusk` 0–1) |
| `src/components/ThoughtBubble.tsx`, `Frost.tsx`, `Zzz.tsx`, `Leaf.tsx` | Supporting pieces |
| `src/theme.ts` | Colours, font, size and fps |

To re-time it (for example to match a voiceover), edit the `T` table at the top of
`src/scenes/Scene1.tsx`. Everything else follows it.

## Style guide

The full house style (colours, font, easing, timings, shapes, Pip's character sheet) is in
[`STYLE_GUIDE.md`](STYLE_GUIDE.md), with reference stills in [`style-guide/`](style-guide/).
This guide documents the Pip Short as built. The reusable house style now lives in the
`/yt-26winter-animation` skill on Su's claude.ai account, which has no fixed characters.
