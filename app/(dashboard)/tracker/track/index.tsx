import React from "react";
import { useTrackerStore } from "@/store/trackerStore";
import { TrackerMode } from "@/enums/Common";
import BlindTracker from "@/components/App/Dashboard/Tracker/Blind";
import VisualTracker from "@/components/App/Dashboard/Tracker/Visual";

export default function TrackScreen() {
  const { mode } = useTrackerStore();

  return mode === TrackerMode.Blind ? <BlindTracker /> : <VisualTracker />;
}
