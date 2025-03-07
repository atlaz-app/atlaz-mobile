import {
  Platform,
  Button,
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
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
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import clsx from "clsx";

const screenWidth = Dimensions.get("window").width;

const defaultEnvelope = Array.from({ length: 50 }, () => ({ value: 0.0009 }));

export default function VisualTracker() {
  const { sensor } = useGlobalStore();

  const sampleCountRef = React.useRef(0);
  const envelopeRef = React.useRef<{ value: number }[]>(defaultEnvelope);
  const [envelope, setEnvelope] =
    React.useState<{ value: number }[]>(defaultEnvelope);

  const [totalReps, setTotalReps] = React.useState(0);
  const [effectiveReps, setEffectiveReps] = React.useState(0);

  const [isTracking, setTracking] = React.useState(false);
  const [muscleState, setMuscleState] = React.useState("relaxed");

  const [facing, setFacing] = React.useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);
  const [imageUri, setImageUri] = React.useState<string>();

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    const picture = await cameraRef.current?.takePictureAsync();
    setImageUri(picture?.uri);
    console.log("ds", picture);
  };

  const startTracking = async () => {
    sensor?.AddEnvelopeDataChanged((data) => {
      if (data !== null && sampleCountRef.current > 5) {
        const newEntry = {
          value: data[0].Sample,
        };

        envelopeRef.current = [...envelopeRef.current, newEntry];

        const MAX_DATA_POINTS = 50;

        if (envelopeRef.current.length > MAX_DATA_POINTS) {
          envelopeRef.current.shift();
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
    sensor?.setSignalType(CallibriSignalType.EMG);
    sensor?.setGain(SensorGain.Gain1);
    sensor?.setADCInput(SensorADCInput.Electrodes);

    try {
      await sensor?.execute(SensorCommand.StartEnvelope);
      setTracking(true);
    } catch (e) {
      console.log("Failed start envelope:", e);
    }
  };

  const stopTracking = async () => {
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
      envelope?.[envelope.length - 1]?.value > 0.0025 &&
      muscleState === "relaxed"
    ) {
      setMuscleState("regular");
    }

    if (envelope?.[envelope.length - 1]?.value > 0.004) {
      setMuscleState("effective");
    }

    if (
      envelope?.[envelope.length - 1]?.value < 0.0022 &&
      (muscleState === "regular" || muscleState === "effective")
    ) {
      setMuscleState("relaxed");
      setTotalReps(totalReps + 1);

      if (muscleState === "effective") {
        setEffectiveReps(effectiveReps + 1);
      }
    }
  }, [envelope]);

  console.log(sampleCountRef.current, muscleState, envelope?.[0]?.value);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <Pressable onPress={stopTracking}>
      <View className="w-full h-full bg-black">
        <View className="h-2/3 w-full top-0">
          <CameraView facing={facing} ref={cameraRef}>
            <View className="h-full flex items-end flex-row w-full justify-center">
              <View
                className={clsx(
                  "absolute top-24 flex flex-row items-center gap-2",
                  !isTracking && "hidden"
                )}
              >
                <View className="bg-red-500 w-4 h-4 rounded-full"></View>
                <Text className="text-black font-semibold text-lg">
                  Tap anywhere to stop
                </Text>
              </View>
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,1)"]}
                locations={[0, 0.8]}
                style={{
                  flex: 1,
                  gap: 84,
                  flexDirection: "row",
                  justifyContent: "center",
                  paddingTop: 128,
                  paddingBottom: 16,
                }}
              >
                <View className="flex items-start">
                  <Text className="text-white text-3xl">{totalReps}</Text>
                  <Text className="text-white/50">Total</Text>
                </View>
                <Text className="text-white text-4xl mt-4 font-bold">
                  {((effectiveReps / totalReps) * 100 || 0).toFixed(0)}%
                </Text>
                <View className="flex items-end">
                  <Text className="text-white text-3xl">{effectiveReps}</Text>
                  <Text className="text-white/50">Effective</Text>
                </View>
              </LinearGradient>
            </View>
          </CameraView>
        </View>
        {isTracking ? (
          <LineChart
            data={envelope}
            width={screenWidth - 20}
            adjustToWidth
            curved
            thickness={3}
            hideDataPoints
            maxValue={0.002}
            mostNegativeValue={0}
            hideRules
            yAxisOffset={0.0001}
            height={200}
            showYAxisIndices={false}
            showXAxisIndices={false}
            showFractionalValues={false}
            hideAxesAndRules
            hideYAxisText
            yAxisLabelWidth={0}
            color={"white"}
          />
        ) : (
          <View
            className={clsx(
              "flex flex-row justify-between items-center mb-12  px-8 py-2 w-full rounded-full h-1/3",
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
        )}
      </View>
    </Pressable>
  );
}
