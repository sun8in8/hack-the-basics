import React from "react";
import { Composition } from "remotion";
import { EVENING_BUS_DURATION, EveningBus } from "./scenes/EveningBus";
import { FPS, HEIGHT, WIDTH } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition id="EveningBus" component={EveningBus} durationInFrames={EVENING_BUS_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
);
