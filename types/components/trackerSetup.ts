import {
  TrackerMode,
  TrackerMuscle,
  TrackerOptimization,
} from "@/enums/Common";

export type CreatePresetTabParamList = {
  Muscle: undefined;
  Mode: undefined;
  Optimization: undefined;
  Save: undefined;
};

export type Preset = {
  id?: number;
  muscle: TrackerMuscle;
  mode: TrackerMode;
  optimization: TrackerOptimization;
  name?: string;
};
