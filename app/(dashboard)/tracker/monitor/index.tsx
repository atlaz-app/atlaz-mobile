import React from 'react';
import { BlindTracker, Calibrator, VisualTracker } from './_components';
import { useTrackerStore } from '@/store/trackerStore';
import { TrackerVisual } from '@/enums/Common';

export default function TrackerMonitor() {
  const { config, sessionBase } = useTrackerStore();

  if (!sessionBase) {
    return <Calibrator />;
  }

  return config?.visual === TrackerVisual.Off ? <BlindTracker /> : <VisualTracker />;
}
