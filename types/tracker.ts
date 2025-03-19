import { TrackerMode, TrackerMuscle, TrackerVisual } from '@/enums/Common';

export type CreatePresetTabParamList = {
  Muscle: undefined;
  Mode: undefined;
  Visual: undefined;
  Save: undefined;
};

export type Preset = {
  id?: number;
  muscle: TrackerMuscle;
  mode: TrackerMode;
  visual: TrackerVisual;
  name?: string;
};
