import React from "react";
import { Composition } from "remotion";
import { S01OpeningBreath } from "./scenes/S01OpeningBreath";
import { S02StoryTimeStarts } from "./scenes/S02StoryTimeStarts";
import { S03ASmallSmile } from "./scenes/S03ASmallSmile";
import { FPS, FULL, SPLIT } from "./theme";
import { SCENES, SceneId, sceneFrames } from "./timeline";

const COMPONENTS: Record<SceneId, React.FC<{ withAudio: boolean }>> = {
  S01: S01OpeningBreath,
  S02: S02StoryTimeStarts,
  S03: S03ASmallSmile,
};

export const RemotionRoot: React.FC = () => (
  <>
    {SCENES.map((s) => {
      const size = s.layout === "full" ? FULL : SPLIT;
      return (
        <Composition
          key={s.id}
          id={`${s.id}-${s.name}`}
          component={COMPONENTS[s.id]}
          durationInFrames={sceneFrames(s.id).duration}
          fps={FPS}
          width={size.width}
          height={size.height}
          defaultProps={{ withAudio: true }}
        />
      );
    })}
  </>
);
