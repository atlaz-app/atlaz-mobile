import {
  Platform,
  Button,
  View,
  Text,
  Dimensions,
  ScrollView,
  Pressable,
} from "react-native";
import React from "react";

import { Link, router } from "expo-router";

import {
  CallibriSensor,
  CallibriSignalType,
  Sensor,
  SensorAccelerometerSensitivity,
  SensorADCInput,
  SensorCommand,
  SensorDataOffset,
  SensorFamily,
  SensorFeature,
  SensorFilter,
  SensorGain,
  SensorSamplingFrequency,
} from "react-native-neurosdk2";

import { LineChart } from "react-native-gifted-charts";
import { useGlobalStore } from "@/store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTrackerStore } from "@/store/trackerStore";
import clsx from "clsx";

const screenWidth = Dimensions.get("window").width;

export default function BlindTracker() {
  const defaultEnvelopeRef = Array.from(
    { length: 50 },
    () => useTrackerStore.getState().sessionBase!
  );
  const defaultEnvelope = Array.from({ length: 50 }, () => ({
    value: useTrackerStore.getState().sessionBase!,
  }));
  const { sensor } = useGlobalStore();
  const sessionBase = useTrackerStore().sessionBase!;

  const sampleCountRef = React.useRef(0);
  const envelopeRef = React.useRef<number[]>(defaultEnvelopeRef);
  const [envelope, setEnvelope] =
    React.useState<{ value: number }[]>(defaultEnvelope);

  const [totalReps, setTotalReps] = React.useState(0);
  const [effectiveReps, setEffectiveReps] = React.useState(0);

  const [isTracking, setTracking] = React.useState(false);
  const [muscleState, setMuscleState] = React.useState("relaxed");

  const startTracking = async () => {
    sensor?.AddEnvelopeDataChanged((data) => {
      if (data !== null && sampleCountRef.current > 5) {
        const newEntry = data[0].Sample;

        envelopeRef.current = [...envelopeRef.current, newEntry];

        const MAX_DATA_POINTS = 50;

        if (envelopeRef.current.length > MAX_DATA_POINTS) {
          envelopeRef.current.shift();
        }

        const envelopeGraphMapping = envelopeRef.current.map((value) => ({
          value,
        }));

        setEnvelope([...envelopeGraphMapping]);
      }

      sampleCountRef.current = sampleCountRef.current + 1;
    });

    const filters = [
      SensorFilter.FilterBSFBwhLvl2CutoffFreq45_55Hz,
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

  const stopTracking = async () => {
    if (!isTracking) return;

    sensor?.RemoveEnvelopeDataChanged();
    try {
      await sensor?.execute(SensorCommand.StopEnvelope);
      setTracking(false);
      setTotalReps(0);
      setEffectiveReps(0);
      setMuscleState("relaxed");
      sampleCountRef.current = 0;
    } catch (e) {
      console.log("Failed start envelope:", e);
    }
  };

  React.useEffect(() => {
    if (
      envelope?.[envelope.length - 1]?.value > sessionBase * 10 &&
      muscleState === "relaxed"
    ) {
      setMuscleState("regular");
    }

    if (envelope?.[envelope.length - 1]?.value > sessionBase * 35) {
      setMuscleState("effective");
    }

    if (
      envelope?.[envelope.length - 1]?.value < sessionBase * 4 &&
      (muscleState === "regular" || muscleState === "effective")
    ) {
      setMuscleState("relaxed");
      setTotalReps(totalReps + 1);

      if (muscleState === "effective") {
        setEffectiveReps(effectiveReps + 1);
      }
    }
  }, [envelope]);

  const graphOffset = sessionBase - sessionBase / 2;

  const graphMaxValue = sessionBase * 50;

  // const graphMaxValue =
  //   sessionBase * 10 > Math.max(...envelopeRef.current)
  //     ? sessionBase * 10
  //     : Math.max(...envelopeRef.current);

  console.log(
    // sampleCountRef.current,
    // muscleState,
    envelope?.[0]?.value,
    sessionBase
    // envelopeRef.current.length,
    // envelope.length,
    // graphOffset,
  );

  return (
    <Pressable onPress={stopTracking}>
      <View className="w-full h-full pt-[180px] flex items-center justify-between bg-black">
        <View
          className={clsx(
            "absolute top-24 flex flex-row items-center gap-2",
            !isTracking && "hidden"
          )}
        >
          <View className="bg-red-500 w-4 h-4 rounded-full"></View>
          <Text className="text-white font-semibold text-lg">
            Tap anywhere to stop
          </Text>
        </View>

        <View className="flex flex-row justify-between w-full px-16">
          <View className="flex items-start">
            <Text className="text-white text-3xl">{totalReps}</Text>
            <Text className="text-white/50">Total</Text>
          </View>

          <View className="flex items-end">
            <Text className="text-white text-3xl">{effectiveReps}</Text>
            <Text className="text-white/50">Effective</Text>
          </View>
        </View>
        <Text className="text-white text-6xl mt-4 font-bold">
          {((effectiveReps / totalReps) * 100 || 0).toFixed(0)}%
        </Text>
        <LineChart
          data={envelope}
          width={screenWidth - 20}
          adjustToWidth
          curved
          thickness={3}
          hideDataPoints
          maxValue={graphMaxValue}
          mostNegativeValue={0}
          hideRules
          yAxisOffset={graphOffset}
          height={200}
          showYAxisIndices={false}
          showXAxisIndices={false}
          showFractionalValues={false}
          hideAxesAndRules
          hideYAxisText
          yAxisLabelWidth={0}
          color={"white"}
        />
        <View
          className={clsx(
            "flex flex-row justify-between items-center mb-12  px-8 py-2 w-full rounded-full",
            isTracking && "invisible pointer-events-none"
          )}
        >
          <Pressable
            onPress={() => router.navigate("/(dashboard)/tracker/setup")}
          >
            <View className="flex flex-row gap-4 items-center">
              <Ionicons size={24} color="white" name="settings-outline" />
              <Text className="text-white text-2xl font-semibold">
                Workout 3
              </Text>
            </View>
          </Pressable>
          <View className="bg-white p-4 rounded-full">
            <Ionicons
              size={24}
              color="black"
              name="play"
              onPress={startTracking}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
