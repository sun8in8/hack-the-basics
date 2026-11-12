import React from "react";
import { Composition } from "remotion";
import { MARKET_DURATION, SecretMarket } from "./scenes/SecretMarket";
import { FPS, HEIGHT, WIDTH } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SecretMarket" component={SecretMarket} durationInFrames={MARKET_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
