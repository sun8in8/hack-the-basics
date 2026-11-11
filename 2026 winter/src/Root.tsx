import React from "react";
import { Composition } from "remotion";
import { SCENE1_DURATION, Scene1 } from "./scenes/Scene1";
import { FPS, HEIGHT, WIDTH } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Scene1"
      component={Scene1}
      durationInFrames={SCENE1_DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
