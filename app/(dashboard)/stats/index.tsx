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
import { useAuthStore } from "@/store";
import { UserApi } from "@/infrastructure/services/User";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

export default function StatsTab() {
  const [facing, setFacing] = React.useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);
  const [imageUri, setImageUri] = React.useState<string>();

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

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    const picture = await cameraRef.current?.takePictureAsync();
    setImageUri(picture?.uri);
    console.log("ds", picture);
  };

  return (
    <View className="h-full">
      {imageUri ? (
        <TouchableOpacity onPress={() => setImageUri("")} className="h-full">
          <Image source={{ uri: imageUri }} className="w-full h-full" />
        </TouchableOpacity>
      ) : (
        <CameraView facing={facing} className="h-full" ref={cameraRef}>
          <View className="h-full flex justify-end">
            <View className="flex flex-row justify-center gap-12 mb-8">
              <TouchableOpacity
                onPress={toggleCameraFacing}
                className="flex items-center justify-center"
              >
                <Text>FLIP</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={takePicture}>
                <View className="w-12 h-12 bg-red-500 rounded-full"></View>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      )}
    </View>
  );
}
