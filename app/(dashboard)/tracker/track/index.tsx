import React from "react";
import { useTrackerStore } from "@/store/trackerStore";
import { TrackerMode } from "@/enums/Common";
import BlindTracker from "@/components/App/Dashboard/Tracker/Blind";
import VisualTracker from "@/components/App/Dashboard/Tracker/Visual";
import { Pressable } from "react-native";
import { View } from "react-native-reanimated/lib/typescript/Animated";
import { SensorFilter } from "react-native-neurosdk2";
import Calibrator from "@/components/App/Dashboard/Tracker/Calibrator";

export default function TrackScreen() {
  const { config, sessionBase } = useTrackerStore();

  if (!sessionBase) {
    return <Calibrator />;
  }

  return config?.mode === TrackerMode.Blind ? (
    <BlindTracker />
  ) : (
    <VisualTracker />
  );
}
