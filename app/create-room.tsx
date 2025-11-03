import JoinRoomModal from "@/components/JoinRoomModal";
import { View } from "react-native";
import { useRouter } from "expo-router";

export default function CreateRoomScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <JoinRoomModal visible={true} onClose={() => router.back()} />
    </View>
  );
}