import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { auth, db } from "@/components/config/firebase";
import { signOut } from "firebase/auth";
import { Plus, LogOut } from "lucide-react-native";
import colors from "@/colors";
import { OWNER_UID } from "@/constant";

const DEFAULT_ROOM_ID = "default-room";

export default function Home() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lắng nghe danh sách phòng
  useEffect(() => {
  if (!auth.currentUser) return;

  const myRoomsRef = collection(db, "users", auth.currentUser.uid, "myRooms");
  const unsubscribe = onSnapshot(myRoomsRef, async (snapshot) => {
    const list: any[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const roomRef = doc(db, "rooms", data.roomId);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        list.push({
          id: data.roomId,
          name: roomData.name || data.roomId,
          online: roomData.onlineUsers?.length || 0,
          max: roomData.maxUsers || 40,
        });
      }
    }

    // Sắp xếp phòng mới lên đầu
    list.sort((a, b) => b.online - a.online);

    setRooms(list);
    setLoading(false);
  });

  return unsubscribe;
}, []);

  // Join phòng
  const joinRoom = async (roomId: string) => {
    if (!auth.currentUser) return;

    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) {
      Alert.alert("Error", "Room not found");
      return;
    }

    const online = roomSnap.data()?.onlineUsers?.length || 0;
    if (online >= 40) {
      Alert.alert("Full", "Room is full! Please wait.");
      return;
    }

    await updateDoc(roomRef, {
      onlineUsers: arrayUnion(auth.currentUser.uid),
    });

    router.push({ pathname: "/chat/[roomId]", params: { roomId } });
  };

  // Logout
  const handleLogout = async () => {
    try {
    console.log("Starting logout...");
    await signOut(auth);
    console.log("Firebase signOut success");
    // Force redirect nếu cần
    router.replace('/login');
  } catch (error: any) {
    console.error("Logout error:", error.code, error.message);
    Alert.alert('Logout Error', error.message || 'Something went wrong');
  }
};

  if (loading) return <Text style={{ textAlign: "center", marginTop: 50 }}>Loading rooms...</Text>;

  return (
    <View style={styles.container}>
      {/* Header: Avatar + Tên + Logout */}
      <View style={styles.header}>
        <Image
          source={{ uri: auth.currentUser?.photoURL || "https://i.pravatar.cc/100" }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{auth.currentUser?.displayName || "User"}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} color="red" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách phòng */}
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.room} onPress={() => joinRoom(item.id)}>
          <Text style={styles.roomName}>{item.name || item.id}</Text>
            <Text style={styles.online}>{item.online}/40 online</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: "gray" }}>No rooms yet</Text>}
      />

      {/* Nút Create (chỉ admin) */}
      {auth.currentUser?.uid === OWNER_UID && (
        <TouchableOpacity
          style={[styles.fab, styles.createFab]}
          onPress={() => router.push("/create-room")}
        >
          <Plus size={24} color="#fff" />
          <Text style={styles.fabText}>Create</Text>
        </TouchableOpacity>
      )}

      {/* Nút Join (ai cũng được) */}
      <TouchableOpacity
        style={[styles.fab, styles.joinFab]}
        onPress={() => router.push("/join-room")}
      >
        <Text style={styles.fabText}>Join</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  username: { marginLeft: 10, fontWeight: "600", fontSize: 16, flex: 1 },
  logoutBtn: { flexDirection: "row", alignItems: "center" },
  logoutText: { color: "red", marginLeft: 5, fontSize: 14 },

  room: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  roomName: { fontWeight: "600", fontSize: 16 },
  online: { color: "#666", fontSize: 14 },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: "row",
  },
  createFab: { backgroundColor: colors.primary || "#f57c00", bottom: 100 },
  joinFab: { backgroundColor: "#666", bottom: 30 },
  fabText: { color: "#fff", fontWeight: "600", marginLeft: 5 },
});