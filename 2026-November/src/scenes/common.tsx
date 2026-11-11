import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

export type SceneProps = { withAudio: boolean };

/** Waits for Patrick Hand before rendering (used by any scene that shows numbers). */
export const useFont = () => {
  const [handle] = useState(() => delayRender("Loading Patrick Hand font"));
  useEffect(() => {
    document.fonts
      .load(`64px 'Patrick Hand'`)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

/** Blink every 100 frames, 6 frames long (style guide §5.4). */
export const blinkAt = (frame: number, offset = 0) => {
  const c = (frame + offset) % 100;
  return c > 94 ? Math.sin(((c - 94) / 6) * Math.PI) : 0;
};
