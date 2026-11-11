# The Hedgehog Who Was Late for Bed: long-form animation

Split-screen animation for the long-form video (7:46.8 voiceover). The presenter is on the left
and this animation fills the **right panel at 960×1080**. Some scenes go **full-frame at 1920×1080**.
Frame rate is **29.97 fps** (exactly 30000/1001). The style follows
[`../2026 winter/STYLE_GUIDE.md`](../2026%20winter/STYLE_GUIDE.md): same colours, easing and feel,
with slower pacing and no text except counting.

## Setup

Your voiceover isn't committed. Copy it in first:

```bash
cp "/path/to/2-LF-VoiceOver-The_Hedgehog_Who_Was_Late_for_Bed.m4a" public/voiceover.m4a
npm install
npm run dev
```

## Render

```bash
npm run render
node render.mjs S03
```

- `out/clips/` holds silent clips for editing. Each is exactly the length of its section.
- `out/review/` holds the same clips with the matching slice of the voiceover, for checking sync.

## Scenes built so far

The clips tile the voiceover with no gaps. Each boundary sits inside a pause. Edit the timings in `src/timeline.ts`.

| Clip | Voiceover time | Layout | Frames |
| --- | --- | --- | --- |
| S01-opening-breath | 0:00.0–0:11.6 | split 960×1080 | 348 |
| S02-story-time-starts | 0:11.6–0:24.8 | full 1920×1080 | 395 |
| S03-a-small-smile | 0:24.8–0:46.6 | split 960×1080 | 654 |

Safe zone: nothing important in the bottom 15% of the frame or in the top corners.
