// Renders one clip per scene.
//   out/review/<id>-<name>.mp4  with the voiceover slice (to check sync)
//   out/clips/<id>-<name>.mp4   silent, for your editor
// Usage: node render.mjs            (all scenes)
//        node render.mjs S02 S03    (only these)
// Optional: BROWSER=/path/to/chromium node render.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

const src = readFileSync("src/timeline.ts", "utf8");
const scenes = [...src.matchAll(/id: "(S\d+)", name: "([^"]+)"/g)].map((m) => ({ id: m[1], name: m[2] }));
const wanted = process.argv.slice(2);
const list = wanted.length ? scenes.filter((s) => wanted.includes(s.id)) : scenes;

mkdirSync("out/review", { recursive: true });
mkdirSync("out/clips", { recursive: true });
const browser = process.env.BROWSER ? ["--browser-executable", process.env.BROWSER] : [];

for (const { id, name } of list) {
  const comp = `${id}-${name}`;
  const review = `out/review/${comp}.mp4`;
  console.log(`Rendering ${comp}…`);
  execFileSync("npx", ["remotion", "render", comp, review, "--log=error", ...browser], { stdio: "inherit" });
  // Silent copy: same video stream, audio removed (no re-encode).
  execFileSync("npx", ["remotion", "ffmpeg", "-v", "error", "-y", "-i", review, "-an", "-c:v", "copy", `out/clips/${comp}.mp4`], {
    stdio: "inherit",
  });
}
