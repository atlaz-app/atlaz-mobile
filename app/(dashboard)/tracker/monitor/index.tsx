import React from 'react';
import { BlindTracker, Calibrator, VisualTracker } from './_components';
import { useTrackerStore } from '@/store/trackerStore';
import { TrackerVisual } from '@/enums/Common';

export default function TrackerMonitor() {
  const { preset, sessionBase } = useTrackerStore();

  if (!sessionBase) {
    return <Calibrator />;
  }

  return preset?.visual === TrackerVisual.Off ? <BlindTracker /> : <VisualTracker />;
}
