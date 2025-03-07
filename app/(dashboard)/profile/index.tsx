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
import Ionicons from "@expo/vector-icons/Ionicons";
import { Video, ResizeMode } from "expo-av";

import {
  ButtonText,
  ButtonSpinner,
  ButtonIcon,
  ButtonGroup,
} from "@/components/ui/button";
import { useAuthStore, useGlobalStore } from "@/store";
import { UserApi } from "@/infrastructure/services/User";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { scanner } from "@/infrastructure/clients";
import {
  CallibriSensor,
  CallibriSignalType,
  Sensor,
  SensorAccelerometerSensitivity,
  SensorADCInput,
  SensorCommand,
  SensorFamily,
  SensorFeature,
  SensorGain,
  SensorSamplingFrequency,
} from "react-native-neurosdk2";
import { BaseButton } from "@/core/Buttons";
import { Link, router } from "expo-router";

export default function ProfileTab() {
  const {
    authenticated,
    setAuthenticated,
    username,
    setAccessToken,
    setRefreshToken,
  } = useAuthStore();

  const { sensor, setSensor } = useGlobalStore();
  const [data, setData] = React.useState<number[]>();

  const connect = async () => {
    await scanner.start();
    const sensors = await scanner.sensors();
    console.log("1", sensors);
    const newSensor = (await scanner.createSensor(
      sensors[0]
    )) as CallibriSensor;
    console.log("2", newSensor);
    setSensor(newSensor);
    console.log("Sensor created", newSensor.getAddress());
  };

  const startSignal = async () => {
    sensor?.AddSignalReceived((data) => {
      setData(data[0].Samples);
    });
    sensor?.setSignalType(CallibriSignalType.EMG);
    sensor?.setGain(SensorGain.Gain1);
    sensor?.setADCInput(SensorADCInput.Electrodes);
    sensor?.setSamplingFrequency(SensorSamplingFrequency.FrequencyHz250);

    try {
      await sensor?.execute(SensorCommand.StartSignal);
    } catch (e) {
      console.log("Failed start signal:", e);
    }
  };

  const removeSensors = async () => {
    const stopSensor = await sensor?.disconnect();
    const stopScanner = await scanner.stop();

    // scanner.RemoveSensorListChanged();
    // sensor?.RemoveConnectionChanged();
    console.log("stopAction", stopScanner, stopSensor);
  };

  const getParam = async () => {
    console.log(sensor?.getFeatures().map((feature) => SensorFeature[feature]));
  };

  const setParam = async () => {
    sensor?.setDataOffset(0);
  };

  const logout = async () => {
    setAuthenticated(false);
    setAccessToken("");
    setRefreshToken("");

    router.replace("/(auth)/login");
  };

  return (
    <ScrollView className="px-4 pt-[84px] w-full h-full bg-black">
      <BaseButton onPress={connect} content="Connect" className="w-full mt-4" />
      <BaseButton
        onPress={getParam}
        content="Get param"
        className="w-full mt-4"
      />
      <BaseButton
        onPress={setParam}
        content="Set param"
        className="w-full mt-4"
      />
      <BaseButton
        onPress={removeSensors}
        content="Remove sensors"
        className="w-full mt-4"
      />
      <BaseButton onPress={logout} content="Logout" className="w-full mt-4" />
    </ScrollView>
  );
}
