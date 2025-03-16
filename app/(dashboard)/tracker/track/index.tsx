import React from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { TrackerMode } from '@/enums/Common';
import { BlindTracker, Calibrator, VisualTracker } from '@/components/App/Dashboard/Tracker';

export default function TrackScreen() {
  const { config, sessionBase } = useTrackerStore();

  if (!sessionBase) {
    return <Calibrator />;
  }

  return config?.mode === TrackerMode.Blind ? <BlindTracker /> : <VisualTracker />;
}
