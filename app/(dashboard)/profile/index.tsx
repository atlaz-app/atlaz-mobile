import React from "react";
import {
  ScrollView,
  View,
  Image,
  Text,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Video, ResizeMode } from "expo-av";

import {
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonIcon,
  ButtonGroup,
} from "@/components/ui/button";
import { useAuthStore } from "@/store";
import { UserApi } from "@/infrastructure/services/User";

export default function ProfileTab() {
  const [modal, setModal] = React.useState(false);
  const [status, setStatus] = React.useState({});
  const video = React.useRef(null);
  const [username, setUsername] = React.useState("");
  const [degenScore, setDegenScore] = React.useState();
  const { accessToken } = useAuthStore();

  React.useEffect(() => {
    const callFirstController = async () => {
      try {
        const response = await UserApi.getAllUsers();
        setUsername(response.data[1].username);
      } catch (e) {
        console.error("Error:", e);
      }
    };

    callFirstController();
  });

  return (
    <>
      <ScrollView className="bg-pink-500 px-4 pt-[84px]">
        <Pressable onPressOut={() => setModal(false)}>
          <View className="bg-red-300 rounded-full flex justify-center flex-row mb-6">
            <Text className="text-2xl font-semibold">DOGE SECT</Text>
          </View>
        </Pressable>
        <View className="bg-orange-300 h-[204px] justify-center items-center">
          <Video
            ref={video}
            source={{
              uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
            }}
            style={{ width: "98%", height: 200 }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            onPlaybackStatusUpdate={(status) => setStatus(() => status)}
          />
        </View>
        <View className="flex-col gap-2">
          <Text className="text-2xl font-semibold">{username}</Text>
          <Text className="text-xl font-semibold">
            Your degeneracy score: {degenScore}
          </Text>
        </View>
        <View className="flex-row flex-wrap justify-between">
          {Array.from({ length: 71 }).map((_, index) => (
            <Pressable onPress={() => setModal(true)} key={index}>
              <Image
                key={index}
                className="h-[80px] w-[80px] rounded-full border-4 border-brown m-2"
                source={{
                  uri: "https://img.decrypt.co/insecure/rs:fit:3840:0:0:0/plain/https://cdn.decrypt.co/wp-content/uploads/2024/05/doge-dogecoin-meme-kabosu-gID_7.jpg@webp",
                }}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
      {modal && (
        <Modal animationType="slide" transparent={true} visible={modal}>
          <View className="absolute top-[300px] left-10 right-10 flex justify-center flex-row bg-yellow-800 h-[200px] items-center rounded-2xl">
            <View className="gap-3">
              <Text className="text-zinc-300 text-3xl font-bold">
                $MAGA for life$
              </Text>

              <Button
                size="md"
                variant="solid"
                action="primary"
                onPress={() => console.log("Nuke disposed...")}
              >
                <ButtonText>Send nuke!</ButtonText>
              </Button>
            </View>

            <Pressable
              onPress={() => setModal(!modal)}
              className="absolute top-4 right-4"
            >
              <Ionicons name="close" size={24} color="beige" />
            </Pressable>
          </View>
        </Modal>
      )}
    </>
  );
}
