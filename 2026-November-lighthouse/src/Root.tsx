import React from "react";
import { Composition } from "remotion";
import { LIGHTHOUSE_DURATION, Lighthouse } from "./scenes/Lighthouse";
import { FPS, HEIGHT, WIDTH } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Lighthouse"
      component={Lighthouse}
      durationInFrames={LIGHTHOUSE_DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
