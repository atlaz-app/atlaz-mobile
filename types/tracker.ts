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

export type Trace = {
  id?: number;
  presetId?: number;
  muscle: TrackerMuscle;
  mode: TrackerMode;
  visual: TrackerVisual;
  totalReps: number;
  effectiveReps: number;
  effectiveness: number;
  envelopeBase: number;
  envelopeData?: string;
  repData: string;
  repPeaks?: string;
  duration?: number;
  notes?: string;
  createdAt?: string;
  videoPath?: string;
};
