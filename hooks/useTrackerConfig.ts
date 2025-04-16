import { useMemo } from 'react';
import { TrackerMode, TrackerMuscle } from '@/enums/Common';
import { Preset } from '@/types';

// Threshold settings for a mode-muscle combo
interface ThresholdConfig {
  repMultiplier: number; // Multiplier for rep threshold (e.g., 15x baseline)
  repDuration: number; // Min seconds above rep threshold
  effectiveMultiplier: number; // Multiplier for effective rep threshold
  effectiveDuration: number; // Min seconds above effective threshold
  relaxedMultiplier: number; // Multiplier for relaxed state threshold
}

// Config object keyed by TrackerMode, then TrackerMuscle
const trackerConfig: Record<TrackerMode, Record<TrackerMuscle, ThresholdConfig>> = {
  [TrackerMode.Hypertrophy]: {
    [TrackerMuscle.Biceps]: {
      repMultiplier: 12,
      repDuration: 0.1,
      effectiveMultiplier: 22,
      effectiveDuration: 0.2,
      relaxedMultiplier: 2,
    },
    [TrackerMuscle.Triceps]: {
      repMultiplier: 10,
      repDuration: 0.3,
      effectiveMultiplier: 18,
      effectiveDuration: 0.5,
      relaxedMultiplier: 3,
    },
    [TrackerMuscle.Deltoid]: {
      repMultiplier: 11,
      repDuration: 0.1,
      effectiveMultiplier: 20,
      effectiveDuration: 0.2,
      relaxedMultiplier: 3,
    },
  },
  [TrackerMode.Strength]: {
    [TrackerMuscle.Biceps]: {
      repMultiplier: 18,
      repDuration: 0.1,
      effectiveMultiplier: 30,
      effectiveDuration: 0.2,
      relaxedMultiplier: 3,
    },
    [TrackerMuscle.Triceps]: {
      repMultiplier: 16,
      repDuration: 0.1,
      effectiveMultiplier: 28,
      effectiveDuration: 0.2,
      relaxedMultiplier: 5,
    },
    [TrackerMuscle.Deltoid]: {
      repMultiplier: 15,
      repDuration: 0.1,
      effectiveMultiplier: 26,
      effectiveDuration: 0.2,
      relaxedMultiplier: 4,
    },
  },
};

export const useTrackerConfig = (preset: Preset) => {
  return useMemo(() => trackerConfig[preset.mode][preset.muscle], [preset.mode, preset.muscle]);
};
