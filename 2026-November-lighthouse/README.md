# The lighthouse keeper (Short)

Remotion project in the 2026 winter house style (see `../2026 winter/STYLE_GUIDE.md`, §10, for
the approved variations). 1080×1920, 30fps, 60s, no audio.

The whole timeline is the `T` table at the top of `src/scenes/Lighthouse.tsx`. Each beat is in
seconds, with the script line beside it. When the voiceover is recorded, change those numbers.
Many in-between key times in the same file follow those beats (for example, the strike at
26.8s), so move them too.

```bash
npm install
npm run dev
npx remotion render Lighthouse out/lighthouse.mp4 --browser-executable=/opt/pw-browsers/chromium
```
