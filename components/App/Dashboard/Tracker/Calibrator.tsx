import React from "react";
import {
  ScrollView,
  View,
  Image,
  Text,
  Pressable,
  Modal,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Button,
} from "react-native";
import { BaseButton } from "@/core/Buttons";
import { Link, router, useRouter } from "expo-router";
import { useTrackerStore } from "@/store/trackerStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TrackerMode } from "@/enums/Common";
import { useGlobalStore } from "@/store";
import {
  CallibriSignalType,
  SensorADCInput,
  SensorCommand,
  SensorDataOffset,
  SensorFilter,
  SensorGain,
} from "react-native-neurosdk2";
import Svg, { Circle } from "react-native-svg";

export default function Calibrator() {
  const router = useRouter();
  const { sessionBase, setMode, setSessionBase } = useTrackerStore();
  const { sensor } = useGlobalStore();

  const sampleCountRef = React.useRef(0);
  const envelopeRef = React.useRef<number[]>([]);
  const [envelope, setEnvelope] = React.useState<number[]>([]);
  const [isTracking, setTracking] = React.useState(false);

  const MAX_DATA_POINTS = 100;
  const CIRCLE_RADIUS = 45;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  const calAvg = (arr: number[]) => {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum / arr.length;
  };

  const calibrateSensor = async () => {
    if (isTracking) return;
    envelopeRef.current = [];
    setEnvelope([]);
    sampleCountRef.current = 0;

    sensor?.AddEnvelopeDataChanged((data) => {
      if (data !== null && sampleCountRef.current > 5) {
        console.log(envelopeRef.current, envelope, sampleCountRef.current);

        const newEntry = data[0].Sample;

        envelopeRef.current = [...envelopeRef.current, newEntry];

        if (envelopeRef.current.length > MAX_DATA_POINTS) {
          sensor?.RemoveEnvelopeDataChanged();
          sensor?.execute(SensorCommand.StopEnvelope);

          const base = calAvg(envelopeRef.current);
          setSessionBase(base);
          setTracking(false);
        }

        setEnvelope([...envelopeRef.current]);
      }

      sampleCountRef.current = sampleCountRef.current + 1;
    });

    const filters = [
      SensorFilter.FilterBSFBwhLvl2CutoffFreq45_55Hz,
      SensorFilter.FilterBSFBwhLvl2CutoffFreq55_65Hz,
      SensorFilter.FilterHPFBwhLvl2CutoffFreq10Hz,
      SensorFilter.FilterLPFBwhLvl2CutoffFreq400Hz,
    ];
    sensor?.setHardwareFilters(filters);

    try {
      await sensor?.execute(SensorCommand.StartEnvelope);
      setTracking(true);
    } catch (e) {
      console.log("Failed start envelope:", e);
    }
  };

  // Calculate progress (0 to 1) based on envelope length
  const progress = envelope.length / MAX_DATA_POINTS;
  // Calculate the stroke offset to animate the fill
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  console.log(sessionBase);

  return (
    <Pressable onPress={calibrateSensor}>
      <View className="w-full h-full pt-[180px] flex items-center bg-black">
        <Svg height="50%" width="50%" viewBox="0 0 100 100">
          {/* Background circle (gray outline) */}
          <Circle
            cx="50"
            cy="50"
            r={CIRCLE_RADIUS}
            stroke="gray"
            opacity={0.5}
            strokeWidth="10"
            fill="transparent"
          />
          {/* Progress circle (white, fills as calibration progresses) */}
          <Circle
            cx="50"
            cy="50"
            r={CIRCLE_RADIUS}
            stroke="white"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={
              isTracking ? strokeDashoffset : CIRCLE_CIRCUMFERENCE
            }
            rotation="-90" // Start from the top
            origin="50, 50" // Rotate around the center
          />
        </Svg>
        <Text className="text-white text-center text-4xl font-bold w-3/4">
          {isTracking ? "Calibrating..." : "Calibrate device before starting"}
        </Text>
        <Text className="text-white/50 text-base mt-3">
          Keep muscle still & relaxed
        </Text>
        {!isTracking && (
          <Text className="text-white text-lg mt-20">
            Tap anywhere to start
          </Text>
        )}
      </View>
    </Pressable>
  );
}
