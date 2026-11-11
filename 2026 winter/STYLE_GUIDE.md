# 2026 Winter Shorts: Pip the Hedgehog style guide

This guide is the source of truth for the look and motion of the "Pip the hedgehog" YouTube Shorts.
Every number here comes from the working Remotion code in this folder. To recreate the style, use
these values exactly. When the guide and the code disagree, the code in `src/` is right, so update
this guide to match it.

Reference stills (540×960, half size) are in [`style-guide/`](style-guide/):

| Still | Frame | Shows |
| --- | --- | --- |
| `01-pip-standing.png` | 120 (4.0s) | Pip standing, default pose and scale |
| `02-perfect-nest-thought.png` | 240 (8.0s) | Small thought bubble with the "perfect nest" |
| `03-leaf-counters.png` | 600 (20.0s) | Rejected pile and counter, the 4 good leaves and tag, sleeping hedgehogs |
| `04-frost-big-thought.png` | 820 (27.3s) | Frost veil and sparkles, big thought bubble with the idea glow |
| `05-cosy-nest-curled.png` | 1300 (43.3s) | Pip curled in the nest, warm glow, rising hearts |
| `06-breathe-in-stretch-tall.png` | 1520 (50.7s) | Breathing in: stretched tall, ring large, 1‑2‑3 circles |
| `07-breathe-out-curl-small.png` | 1610 (53.7s) | Breathing out: curled small, ring small |

---

## 1. Mood

- **Feeling:** a warm, quiet bedtime-story autumn afternoon sliding into dusk. Cosy, kind and
  unhurried, for young children and calm grown-ups.
- **Message:** good enough is enough. Pip is gentle, a little fussy, and ends up content.
- **Motion personality:** everything floats, eases and settles. Nothing snaps, flashes, shakes
  hard or cuts. Even the "shiver" is a 3px wobble.
- **Visual personality:** flat, rounded, storybook vector shapes. There are no outlines on big
  shapes, no textures, no gradients except soft sky, glow and frost washes, no realism, and no
  sharp corners.
- **Words:** as few as possible. The current scene has **no captions**. The only text is the
  counters (`300 rejected`, `4 good leaves`) and the numbered breath circles (`1 2 3`). The story
  is told through pictures.

### Hard rules (never break)
1. **No harsh flashes.** No brightness change faster than a 10-frame fade (⅓s). No full-frame
   colour pops, strobing, white flashes or hard cuts. Scene changes are crossfades or eased moves.
2. **Only the palette below.** Use the 5 core colours, the 3 tints made from them, and white
   for frost.
3. **Everything is rounded.** Use `strokeLinecap="round"` and `strokeLinejoin="round"`, round rect
   corners, and curved paths (`Q` and `C`). Even Pip's spikes have rounded tips.
4. **Gentle motion only.** Use eased interpolation (§4). The only springs are the soft ones listed.
   Ambient loops are slow sines.
5. **Leaves are always falling** in the background (§6.3), in every scene.
6. **Deterministic.** All randomness uses Remotion's `random("seed-string")`, never `Math.random()`.

---

## 2. Canvas and format

| Setting | Value |
| --- | --- |
| Size | **1080 × 1920** (vertical, 9:16 YouTube Short) |
| Frame rate | **30 fps** |
| Seconds to frames | `sec(s) = Math.round(s * 30)` |
| Scene 1 length | 55s = 1650 frames |
| Root background | `#FFF4E0` cream, behind everything |
| Video format | MP4, `Config.setVideoImageFormat("jpeg")` |
| Safe area | Keep important elements between y ≈ 250 and y ≈ 1750 (YouTube UI covers the top and bottom). The breath circles sit at top 300. |

The framework is **Remotion 4.0.542** with **React 19.2.0** and **TypeScript 5.9.3**. All artwork
is inline SVG drawn in a single `0 0 1080 1920` viewBox. Only the breath-count circles are HTML
`div`s.

---

## 3. Colour

### 3.1 Core palette (exact)

| Token (`COLORS.`) | Hex | Name | Used for |
| --- | --- | --- | --- |
| `burntOrange` | **`#D2691E`** | Burnt orange | Near hills, leaves, accent text (counter numbers), hearts, cheek blush (45%), dusk sky bottom |
| `golden` | **`#E8A33D`** | Golden yellow | Far hills, leaves, all outlines on cream UI (tags, bubbles, circles), breathing ring, sparkles, dusk sky top |
| `deepRed` | **`#A0522D`** | Deep red / sienna | Ground band, leaves, alternate spikes, inner ear (50%), tree, perfect-nest base |
| `cream` | **`#FFF4E0`** | Cream | Background and sky top, Pip's face, sun, bubble/tag/circle fills, leaf veins (55%), text on golden |
| `brown` | **`#6B4226`** | Soft brown | Pip's coat and main spikes, lower ground, tree trunks, leaf stems, small label text, shadows |

### 3.2 Tints (mixed from the palette; use only these)

| Token | Hex | Used for |
| --- | --- | --- |
| `creamShade` | **`#F6E2C0`** | Pip's belly, ear |
| `goldenLight` | **`#F3C978`** | Sky gradient bottom, a fourth leaf colour, idea glow halo, cosy glow |
| `brownDark` | **`#553319`** | Pip's eyes, nose, feet, mouth, ground shadow |
| white | `#FFFFFF` | Frost only (veil and sparkles) |

### 3.3 Colour lists
- **Leaf colours** (`LEAF_COLORS`, picked at random): `#D2691E`, `#E8A33D`, `#A0522D`, `#F3C978`.
- **Shadows:** CSS `box-shadow` uses brown with alpha, e.g. `0 10px 30px #6B422622`. A caption
  card shadow used `0 14px 0 #E8A33D55, 0 22px 50px #6B422622`.

### 3.4 Light and time of day
- **Sky:** vertical linear gradient from `#FFF4E0` at 0% to `#F3C978` at 70%.
- **Dusk overlay:** a second gradient on top, from `#E8A33D` at 0% to `#D2691E` at 75%, with
  `opacity = dusk × 0.55`. `dusk` goes from 0 (afternoon) to 1 (warm evening). It is never dark:
  the darkest moment is still orange-gold.
- **Frost** (cold moments): white veil with gradient stops 0.45 at 0%, 0.12 at 60% and 0.05 at
  100%, multiplied by `amount` (0–1). It must not grey out the ground. Frost is a pale wash, not blue.
- **Cosy glow:** radial gradient from `#F3C978` at 0.85 to 0 alpha. Ellipse rx 520, ry 460,
  centred 120px above Pip's feet, overall opacity up to 0.8.

---

## 4. Typography

| Role | Font | Size | Colour |
| --- | --- | --- | --- |
| All on-screen text | **Patrick Hand** (Google font, weight 400) | — | — |
| Counter number (`300`, `4`) | Patrick Hand | 64px | `#D2691E` |
| Counter label (`rejected`, `good leaves`) | Patrick Hand | 30px | `#6B4226` |
| Breath circle numbers `1 2 3` | Patrick Hand | 64px | `#E8A33D` when empty, `#FFF4E0` when filled |
| Sleep "z" letters | Patrick Hand | size × (0.7 → 1.3) | `#6B4226` |
| Captions, if ever brought back | Patrick Hand | 84px (96px for breathing prompts), line-height 1.15, centred | `#6B4226`, emphasised words `#D2691E` |

- **Font stack:** `'Patrick Hand', 'Comic Sans MS', cursive`.
- **Loading:** install the npm package `@fontsource/patrick-hand@5.3.0` and import
  `@fontsource/patrick-hand/400.css`, so no network is needed at render time. The scene blocks
  rendering until `document.fonts.load("84px 'Patrick Hand'")` resolves (with `delayRender` and
  `continueRender`).
- Text is always centred, and always sits on a cream rounded shape or appears as a quiet ambient
  symbol ("z"). Text never goes straight onto busy artwork.

---

## 5. Motion

### 5.1 Easing curves (exact)

```ts
import { Easing, interpolate } from "remotion";
const gentle = Easing.inOut(Easing.cubic);          // DEFAULT for everything

// Clamped, eased interpolation
ease(frame, [start, end], [from, to], easing = gentle)
  = interpolate(frame, [start, end], [from, to],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

// Fade in over `fade` frames, hold, fade out over `fade` frames
fadeInOut(frame, start, end, fade = 12)
  = interpolate(frame, [start, start + fade, end - fade, end], [0, 1, 1, 0],
      { clamp both sides, easing: gentle });
```

| Curve | Formula | Used for |
| --- | --- | --- |
| **Gentle (default)** | `Easing.inOut(Easing.cubic)` | Fades, curl and stretch, moves, glow, bubble growth, scoop, ring |
| Ease-out quad | `t => 1 - (1 - t)²` | Pip walking in (arrives and slows down) |
| Ease-out cubic | `t => 1 - (1 - t)³` | Counter climbing 0 → 300 (fast start, settles) |
| Linear | `t => t` | Rising hearts' path progress, curl-to-eyes-closed mapping |

### 5.2 Springs (the only ones allowed)

| Use | Config |
| --- | --- |
| Pip's little hop | `{ damping: 9, stiffness: 120 }`, height = `sin(min(1, spring) × π) × 40px` up, between 3.1s and 4.4s |
| Card or caption rise-in | `{ damping: 18, stiffness: 90 }`, translateY `(1 − s) × 30px`, scale `0.96 + 0.04 s` |

### 5.3 Standard durations

| What | Frames | Seconds |
| --- | --- | --- |
| Fade in or out of any element (minimum) | 8–12 | 0.27–0.4 |
| Default `fadeInOut` | 12 | 0.4 |
| Leaf dropping into a pile (opacity / 160px drop) | 8 / 14 | 0.27 / 0.47 |
| Stagger between the 4 good leaves | 9 | 0.3 |
| Thought bubble growing in | 24–34 | 0.8–1.1 |
| Thought bubble fading out | 14 | 0.47 |
| Pip curling or uncurling | 60 | 2.0 |
| One leaf scooped to the nest (+ random 0–1.2s delay) | 48 | 1.6 |
| Frost coming in / leaving | 60 / 90 | 2 / 3 |
| Walk in from off-screen (x −260 → 540) | 54 | 1.8 |
| Breath in / breath out | 90 / 90 | 3 / 3 |
| Breath circle filling | 12 | 0.4, one circle per second |
| Final fade to cream | 30 | 1.0 |
| A story beat | 75–150 | 2.5–5 |

### 5.4 Ambient loops (slow sines, `frame` = current frame)

| Loop | Formula |
| --- | --- |
| Falling-leaf sway | `x += sin(frame × f + phase) × amp`, f ∈ [0.02, 0.04], amp ∈ [30, 80]px; rotation `sin(...) × 35° + random × 360°` |
| Blink | Every 100 frames. Frames 95–100 of each cycle: `eyesClosed = sin(((cycle − 94)/6) × π)` |
| Thinking tilt (looking around) | `tilt = sin(t × 0.07) × 5°` |
| "No" head shake | `tilt = sin(t × 0.35) × 4°`, faded in and out over 10 frames |
| Cold shiver | `x += sin(frame × 1.3) × 3px × frostAmount` |
| Idea glow pulse | `scale = 1 + sin(frame × 0.09) × 0.04` |
| Sparkle twinkle (bubble) | `size × (0.85 + 0.15 sin(frame × 0.12 + i))` |
| Frost sparkle twinkle | `opacity = 0.45 + 0.35 sin(frame × 0.06 + phase)`, rotating at `frame × 0.3°` |
| Heart bob in the bubble | `y += sin(frame × 0.1) × 6px` |
| Sleep "z"s | 75-frame loop, 3 letters offset by ⅓ of the loop, rise `2.4 × size`, opacity `sin(t × π) × 0.85` |

---

## 6. Shapes and components

All coordinates are in the 1080×1920 SVG unless a local box is given.

### 6.1 Shape language
- Rounded strokes everywhere: `strokeLinecap="round"`, `strokeLinejoin="round"`.
- UI shapes are cream (`#FFF4E0`) with a **6px golden (`#E8A33D`) stroke**. Corner radius is about
  ⅓ of the height (tag: rx 40 on 124 high; circles: full round).
- Character and prop shapes have **no outline**. They are separated by flat colour only. Leaves
  are the one exception: a 3px brown outline at 25% opacity.
- Depth comes from layering and soft shadows (ellipse, `#553319`, 18% opacity), never from
  gradients on objects.

### 6.2 Leaf (`Leaf.tsx`): the signature shape
Drawn in a 100-unit local box centred at (0, 0), then `scale(size/100)`:
- **Blade:** `M0 -50 C 34 -34 40 18 0 50 C -40 18 -34 -34 0 -50 Z`. Fill is the leaf colour,
  stroke `#6B4226` at 25% opacity, 3px, round join.
- **Stem:** `M0 48 Q 4 60 10 66`, `#6B4226`, 5px, round cap.
- **Veins:** `M0 -38 L0 44 M0 -6 L14 -20 M0 -6 L-14 -20 M0 14 L16 0 M0 14 L-16 0`, cream at
  55% opacity, 3.5px, round cap.
- Typical sizes: background 40–80, pile 62–88, "good" leaves 80, thought-bubble leaves 52–66.

### 6.3 Falling leaves (background, always on)
- **14 leaves** (component default 16), overall opacity **0.8**, drawn behind every character.
- Per leaf, seeded `random("leaves-{i}-{key}")`: x across the full width; fall speed
  **1.4–3.0 px/frame**; size 40–80; sway amp 30–80px; sway freq 0.02–0.04; random start offset.
- They wrap vertically over `1920 + 300` px, starting at y = −150.
- The speed multiplier must stay constant during a scene. Changing it mid-scene makes leaves jump.

### 6.4 Background (`Background.tsx`)
Layers, back to front:
1. Sky gradient, then dusk overlay (§3.4).
2. **Sun:** centre (800, `520 + dusk × 380`). Glow circle r 260 (radial cream 0.9 → 0, layer
   opacity 0.6) plus a solid disc r 110, `#FFF4E0` at 0.9. It sinks as dusk rises.
3. **Far hills** `#E8A33D`:
   `M 0 1180 C 200 1040 420 1060 600 1140 C 760 1210 940 1080 1080 1100 L 1080 1920 L 0 1920 Z`
4. Trees on the far hills: (150, 1120) scale 0.75 `#D2691E`; (930, 1110) scale 0.6 `#A0522D`.
5. **Near hills** `#D2691E`:
   `M 0 1330 C 240 1240 460 1280 640 1320 C 820 1360 960 1270 1080 1290 L 1080 1920 L 0 1920 Z`
6. Tree on the near hills: (60, 1330) scale 0.95 `#E8A33D`.
7. **Ground band** `#A0522D`: `M 0 1500 C 300 1440 760 1440 1080 1500 L 1080 1920 L 0 1920 Z`
8. **Lower ground** `#6B4226`: `M 0 1590 C 320 1540 760 1540 1080 1590 L 1080 1920 L 0 1920 Z`

**Lollipop tree** (local, then scaled): trunk rect x −14, y −40, 28×140, rx 14, `#6B4226`.
Crown circles: (0, −110) r 95, (−70, −60) r 60, (70, −60) r 60 in the tree colour. Highlight
circle (−30, −140) r 30, cream at 18%.

### 6.5 Pip: character sheet (`Pip.tsx`)

Pip is drawn in a **400×400 local box, facing right, with her feet at (200, 360)**. She is placed with
`translate(x y) scale(scale × facing, scale) translate(-200 -360)`. In scene 1 her default spot
is **(540, 1585) at scale 1.25**. `facing = -1` mirrors her.

**Pose parameters** (all 0–1 unless noted):

| Param | Meaning |
| --- | --- |
| `curl` | 0 = standing, 1 = curled into a ball |
| `stretch` | 0 = normal, 1 = stretched tall (scaleY 1.24, scaleX 0.93, anchored at the feet) |
| `eyesClosed` | 0 = open, 1 = closed (a curved line) |
| `walkPhase` | radians; when set, feet step ±10px and the body bobs up to 6px |
| `tilt` | degrees, rotates the body around the feet |
| `smile` | 0 = flat mouth, 1 = full smile (mouth curve depth `10 × smile`) |

Every shape value blends linearly as `mix(standing, curled, curl)`:

| Part | Standing (curl 0) | Curled (curl 1) | Colour |
| --- | --- | --- | --- |
| Body / coat ellipse centre | (190, 255) | (200, 262) | `#6B4226` |
| Body rx × ry | 150 × 100 | 104 × 98 | |
| Spike arc (degrees, SVG angles, 0 = right, 90 = down) | 158° → 338° (her back) | −90° → 270° (all round) | alternate `#6B4226` / `#A0522D` |
| Spike length | 58 (every other spike × 0.86) | 46 | |
| Belly ellipse | (222, 300) 92 × 52, opacity 1 | (216, 300) 58 × 40, opacity 0.6 | `#F6E2C0` |
| Face group: position / scale | (292, 272) / 1 | (246, 290) / 0.62 | |
| Feet opacity | 1 | 0 (gone by curl 0.5) | `#553319` |
| Ground shadow rx | 150 (× 1 + 0.05 × stretch) | 118 | `#553319` at 18%, ry 16, at (200, 362) |

**Spikes:** 20 rounded triangles spaced evenly along the arc, based on the ellipse at 0.88 of its
radius and pointing along the ellipse normal. Base half-width 22. Path:
`M base−t·w  Q (base + n·L·0.55 − t·w·0.45) tip  Q (base + n·L·0.55 + t·w·0.45) base+t·w Z`.
Each has a same-colour stroke 8px with a round join, which rounds the tips. They are drawn
**behind** the coat ellipse.

**Face** (local coordinates, before the face transform):
- Ear: circle (262, 196) r 18 `#F6E2C0`; inner circle r 9 `#A0522D` at 50%.
- Head and snout: `M 236 210 C 280 190 340 222 372 258 C 382 270 374 286 360 290 C 320 302 262 312 236 296 C 214 282 212 222 236 210 Z`, `#FFF4E0`.
- Nose: circle (372, 266) r 13 `#553319` with a highlight (368, 261) r 4, cream at 80%.
- Cheek: ellipse (282, 276) 17 × 11, `#D2691E` at 45%.
- Eye open: ellipse (300, 240) 10 × 13 `#553319`, highlight (303, 235) r 4 cream. Squashes
  vertically with `1 − eyesClosed`.
- Eye closed (when open amount < 0.15): `M 288 240 Q 300 250 312 240`, `#553319`, 5px, round cap.
- Mouth: `M 322 284 Q 334 (284 + 10·smile) 348 282`, `#553319`, 4.5px, round cap.
- Feet: ellipses 26 × 16 at (140, 350) and (250, 350), `#553319`.

**Behaviour:**
- Eyes close automatically as she curls: `eyesClosed = max(blink, linear(curl 0.45 → 0.85))`.
- Curled-up Pip still shows a tiny face with closed eyes. She is never a faceless ball.
- Worried or cold moments lower her smile to 0.25. It returns to 1 when she is content.

**Other hedgehogs** use the same `Pip` component, curled (`curl` 1, `eyesClosed` 1, `smile` 0.6),
at small scales on the hills: (250, 1290) ×0.30, (880, 1300) ×0.27 mirrored, (450, 1078) ×0.20,
each with a 26px "z" loop.

### 6.6 Props and UI

**Counter tag** (`Tag`): rect −105, −62, 210 × 124, rx 40, cream fill, golden 6px stroke. Big number
64px `#D2691E` at y 4, small label 30px `#6B4226` at y 44, both centred.
- `4 good leaves` at (890, 1560). `rejected` at (200, 1530), counting 0 → 300 with ease-out cubic
  between 17.7s and 20.6s.
- The 4 good leaves sit in a neat row at x = 790 + k × 78, y 1700, rotated 90°, size 80.
- The rejected pile is a mound of 36 leaves centred at (190, 1705), rx 150, ry 110, filled from the
  bottom up.

**Breath circles** (`BreathCount`, HTML): three 110×110 circles, `gap: 44px`, centred, `top: 300px`.
They have an 8px golden border, cream fill and shadow `0 10px 30px #6B422622`. Circle k fills from
`start + k` seconds over 12 frames: a golden overlay goes from opacity 0 to 1 and the circle scales
`0.8 + 0.2 × on`. The number is golden while empty and cream once more than half filled. The group
fades in and out over 8 frames around each 3-second breath.

**Breathing ring:** circle centred 170px above Pip's feet (540, 1415). Fill `#E8A33D` at 14%,
stroke `#E8A33D` 12px at 70%. The radius eases **190 → 330** on the in-breath and **330 → 190** on
the out-breath. It fades in and out over 10 frames.

**Thought bubble** (`ThoughtBubble`): three trailing circles from Pip's head toward the cloud (at
20%, 42% and 62% of the way; r 14, 26, 38). The cloud is 9 puffs: circles of r = 0.38·R placed on
an ellipse (0.78·R, 0.62·R), plus a centre ellipse (0.95·R × 0.78·R) that hides inner strokes. All
are cream with a golden 6px stroke. It grows puff by puff, small circles first.
- Small bubble: (800, 980), R 160. Big thought: (560, 900), R 250.
- Contents crossfade inside the cloud (10-frame fades).

**Sparkle** (4-point rounded star): `M 0 -s Q 3 -3 s 0 Q 3 3 0 s Q -3 3 -s 0 Q -3 -3 0 -s Z`, golden.
Frost sparkles use the same shape in white with control offset 2, s 8–20, 28 of them.

**Heart:** `M 0 18 C -40 -8 -30 -40 -10 -36 C 0 -34 0 -26 0 -22 C 0 -26 0 -34 10 -36 C 30 -40 40 -8 0 18 Z`,
`#D2691E`, scale 1.1–1.2. Rising hearts: 3 of them, 25 frames apart, rising 260px over 2.6s with a
14px sway, opacity `sin(t × π) × 0.9`.

**Idea glow:** halo r 95 `#F3C978` at 45%, bulb r 62 `#E8A33D`, base rect −26, 52, 52 × 36, rx 14,
`#6B4226`. Smile-arc filament `M -18 0 Q 0 -30 18 0`, cream, 8px, round cap.

**Perfect nest** (tidy and symmetrical): base `M -110 10 Q 0 120 110 10 Z` `#A0522D`, with 6 leaves
at x −90…90 (step 36), size 52, alternating orange and golden, plus 3 golden sparkles. **Cosy
pile** (messy): 8 leaves size 66 at random angles with a heart above. *Perfect = symmetric and
sparkly. Cosy = messy, warm and loved.*

**Nest:** 56 leaves on an ellipse around Pip: centre (540, 1595), rx 265, ry 80, ring 0.78–1.08.
Leaves with `sin(θ) < −0.1` are drawn **behind** Pip, the rest **in front**, so she sits inside it.

---

## 7. Layer order (back to front)

1. Cream root fill
2. Background (sky, dusk, sun, hills, trees, ground)
3. Falling leaves
4. Sleeping hedgehogs and their "z"s
5. Cosy glow ellipse
6. Breathing ring
7. Nest leaves, back half
8. **Pip**
9. Nest leaves, front half
10. Counter tags
11. Rising hearts
12. Thought bubbles
13. Frost veil and sparkles
14. Breath circles (HTML)
15. Final cream fade

---

## 8. Scene 1 timeline (reference choreography)

The `T` table in `src/scenes/Scene1.tsx` (in seconds) drives everything.

| Beat | Time | What happens |
| --- | --- | --- |
| thisIsPip | 0–3 | Pip walks in from x −260 to 540 (1.8s, ease-out quad) |
| hedgehog | 3–5.5 | Little spring hop at 3.1s |
| perfectNest | 5.5–10 | Small thought bubble with the sparkly perfect nest |
| allAsleep | 10–14.5 | Dusk 0 → 0.7. Three hedgehogs fade in, then curl up and sleep. Pip looks around (tilt) |
| fourLeaves | 14.5–17.5 | 4 neat leaves drop in one by one, and the "4 good leaves" tag appears |
| rejected | 17.5–21 | Pile builds, counter climbs to 300, gentle "no" head shake, smile drops |
| frost | 21–24 | Frost fades in over 2s, Pip shivers |
| bigThought | 24–28.5 | Big bubble with the pulsing idea glow |
| notPerfect | 28.5–32 | Perfect nest in the bubble, its sparkles drift up and fade |
| justThere | 32–35.5 | Messy cosy pile with a heart. Smile returns |
| scoop | 35.5–40 | All 56 leaves arc into the nest. Tags fade. Pip curls up (37.6–39.6s) |
| cosiest | 40–45 | Frost fades, warm glow, dusk +0.3, three hearts rise |
| breatheIntro | 45–48 | Pip uncurls (45.4–47.4s) |
| breatheIn | 48–51 | stretch 0 → 1, ring 190 → 330, circles 1‑2‑3 |
| breatheOut | 51–54 | stretch 1 → 0, curl 0 → 1 (from 51.3s), ring 330 → 190, circles 1‑2‑3 |
| end | 54–55 | 1s fade to cream |

**Breathing exercise standard:** **3s in and stretch tall, 3s out and curl small**, one breath.
A script may add a **hold**: then it is **3s in, 3s hold, 3s out**, with a separate set of 1‑2‑3
circles for each part, and everything stays still during the hold (scene 2).
The in-breath uses `stretch`. The out-breath uses `curl` (eyes close as she curls). The breath ring
and 1‑2‑3 circles always come with it.

---

## 8b. Scene 2: the oak (`Scene2.tsx`, `Oak.tsx`, `Roots.tsx`)

- **The oak** stands at (540, 1340), with a deep-red (`#A0522D`) trunk and branches and a crown of
  rounded blobs in orange, golden and light golden with leaves on top. Her face sits on the trunk:
  brown-dark eyes with soft brows, laugh lines, orange cheeks at 45% and a smile. Her eyes close
  (curved lines) for calm moments and for the breathing.
- **Soil cut-away:** a deep-red topsoil band from y ≈ 1300, then brown soil from y ≈ 1350, with a
  few brown-dark pebbles at 35%. The roots are deep-red round strokes, 10–38px wide.
- **Roots lighting up:** a golden line (40% of the root's width) plus a blurred light-golden halo
  travel along each root from the trunk outwards (`pathLength` 1 with a dash offset) over about
  4.6s, with a soft light-golden glow in the soil. "Alive" adds twinkling light-golden sparkles
  and a slow pulse.
- **No background falling leaves in this scene** (an exception to hard rule 5, on purpose): the only
  falling leaves are the oak's own. One golden leaf hangs on her right branch tip and is the last to
  fall, on the closing question.
- **Letting go:** each leaf wiggles for 14 frames, then falls over 3.2–4.4s with a sway and lands
  flat on the ground. The crown shrinks to 55% and fades only at the very end.
- **Breathing with a tree:** the ring is centred where the trunk meets the roots. On the in-breath
  warm golden light (50%) fills the trunk from the ground up and she grows 3% taller.

## 9. Building a new scene in this style

1. Copy the patterns from `src/scenes/Scene1.tsx`: a `T` timeline table in seconds, an `S()`
   helper that converts it to frames, and every value derived with `ease` or `fadeInOut` from `T`.
2. Reuse the components: `Background`, `FallingLeaves`, `Pip`, `Leaf`, `ThoughtBubble`, `Frost`,
   `Zzz`, and the `Tag` / `BreathCount` patterns. Do not redraw Pip.
3. Register the scene in `src/Root.tsx` as a new `<Composition>` at 1080×1920, 30fps.
4. Before calling it done, render stills and compare them with `style-guide/*.png`. Check the
   palette, the roundness, that there are no flashes, that leaves are falling, and that the font
   has loaded.

### Commands (run inside `2026 winter/`)
```bash
npm install
npm run dev
npx remotion still Scene1 out/check.png --frame=120
npx remotion render Scene1 out/scene1.mp4
```
In Claude Code cloud sessions, add `--browser-executable=/opt/pw-browsers/chromium` to the
`still` and `render` commands. If npm can't reach the registry because of `NO_PROXY`, prefix npm
commands with `env -u NO_PROXY -u no_proxy npm_config_noproxy=localhost`.

### Quick checklist
- [ ] 1080×1920, 30fps
- [ ] Only the palette and tints in §3
- [ ] Patrick Hand for every piece of text; minimal words
- [ ] Every transition eased with `Easing.inOut(Easing.cubic)`, fades ≥ 8 frames, no flashes
- [ ] Rounded caps and joins on everything
- [ ] Falling leaves present
- [ ] Pip uses the `Pip` component with the poses in §6.5
- [ ] All randomness from `random(seed)`
