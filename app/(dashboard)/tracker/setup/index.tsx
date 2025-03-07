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

export default function SetupScreen() {
  const router = useRouter();
  const { sessionBase, setMode, setSessionBase } = useTrackerStore();
  const { sensor } = useGlobalStore();

  const sampleCountRef = React.useRef(0);
  const envelopeRef = React.useRef<number[]>([]);
  const [envelope, setEnvelope] = React.useState<number[]>([]);
  const [isTracking, setTracking] = React.useState(false);

  const calAvg = (arr: number[]) => {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum / arr.length;
  };

  const calibrateSensor = async () => {
    envelopeRef.current = [];
    setEnvelope([]);
    sensor?.AddEnvelopeDataChanged((data) => {
      if (data !== null && sampleCountRef.current > 5) {
        const newEntry = data[0].Sample;

        envelopeRef.current = [...envelopeRef.current, newEntry];

        const MAX_DATA_POINTS = 100;

        if (envelopeRef.current.length > MAX_DATA_POINTS) {
          sensor?.RemoveEnvelopeDataChanged();
          sensor?.execute(SensorCommand.StopEnvelope);

          const base = calAvg(envelopeRef.current);
          setSessionBase(base);
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
    // sensor?.setSignalType(CallibriSignalType.EMG);
    // sensor?.setGain(SensorGain.Gain2);
    // sensor?.setADCInput(SensorADCInput.Electrodes);

    try {
      await sensor?.execute(SensorCommand.StartEnvelope);
      setTracking(true);
    } catch (e) {
      console.log("Failed start envelope:", e);
    }
  };

  console.log("envelope", envelope);
  console.log("base", sessionBase);

  return (
    <View className="justify-center w-full h-full bg-black flex items-center gap-16">
      <View className="flex flex-row gap-8">
        <Ionicons
          size={24}
          color="white"
          name="map-outline"
          onPress={() => setMode(TrackerMode.Blind)}
        />
        <Ionicons
          size={24}
          color="white"
          name="videocam-outline"
          onPress={() => setMode(TrackerMode.Visual)}
        />
      </View>
      <BaseButton onPress={calibrateSensor} content="Calibrate" className="" />
      <BaseButton
        onPress={() => router.push("/(dashboard)/tracker/track")}
        content="Track"
      />
    </View>
  );
}
