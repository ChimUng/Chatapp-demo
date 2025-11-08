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
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/components/config/firebase";
import { signOut } from "firebase/auth";
import { Plus, LogOut } from "lucide-react-native";
import colors from "@/colors";
import { OWNER_UID } from "@/constant";

// ID phòng mặc định cho mọi user
const DEFAULT_ROOM_ID = "PHONGCHUNG";
const DEFAULT_ROOM_NAME = "Phòng Chung";

export default function Home() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  // Tạo phòng mặc định nếu chưa có
  const ensureDefaultRoomExists = async () => {
    if (!currentUser) return;

    const roomRef = doc(db, "rooms", DEFAULT_ROOM_ID);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      // Tạo phòng chung lần đầu
      await setDoc(roomRef, {
        name: DEFAULT_ROOM_NAME,
        maxUsers: 100,
        onlineUsers: [],
        createdBy: "system",
        createdAt: serverTimestamp(),
      });
      console.log("Phòng Chung đã được tạo tự động!");
    }

    // Thêm user vào myRooms nếu chưa có
    const userRoomRef = doc(db, "users", currentUser.uid, "myRooms", DEFAULT_ROOM_ID);
    const userRoomSnap = await getDoc(userRoomRef);

    if (!userRoomSnap.exists()) {
      await setDoc(userRoomRef, {
        roomId: DEFAULT_ROOM_ID,
        name: DEFAULT_ROOM_NAME,
        joinedAt: new Date(),
      });

      // Cập nhật onlineUsers
      await updateDoc(roomRef, {
        onlineUsers: arrayUnion(currentUser.uid),
      });
    }
  };

  // Lắng nghe danh sách phòng của user
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    ensureDefaultRoomExists();

    const myRoomsRef = collection(db, "users", currentUser.uid, "myRooms");
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

      // Sắp xếp: Phòng Chung lên đầu, sau đó là online nhiều nhất
      list.sort((a, b) => {
        if (a.id === DEFAULT_ROOM_ID) return -1;
        if (b.id === DEFAULT_ROOM_ID) return 1;
        return b.online - a.online;
      });

      setRooms(list);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Join phòng
  const joinRoom = async (roomId: string) => {
    if (!currentUser) return;

    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) {
      Alert.alert("Lỗi", "Không tìm thấy phòng!");
      return;
    }

    const roomData = roomSnap.data();
    const online = roomData.onlineUsers?.length || 0;
    if (online >= (roomData.maxUsers || 40)) {
      Alert.alert("Đầy", "Phòng đã đầy! Vui lòng đợi.");
      return;
    }

    await updateDoc(roomRef, {
      onlineUsers: arrayUnion(currentUser.uid),
    });

    router.push({ pathname: "/chat/[roomId]", params: { roomId } });
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Lỗi đăng xuất', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải phòng chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: currentUser?.photoURL || `https://i.pravatar.cc/150?u=${currentUser?.uid}` }}
          style={styles.avatar}
        />
        <Text style={styles.username}>
          {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={22} color={colors.accentRed} />
          <Text style={styles.logoutText}>Thoát</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách phòng */}
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.room} onPress={() => joinRoom(item.id)}>
            <View>
              <Text style={styles.roomName}>
                {item.name}
                {item.id === DEFAULT_ROOM_ID && " (Mặc định)"}
              </Text>
              <Text style={styles.roomId}>ID: {item.id}</Text>
            </View>
            <Text style={styles.online}>
              {item.online}/{item.max} online
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có phòng nào</Text>
        }
      />

      {/* Nút FAB */}
      {currentUser?.uid === OWNER_UID && (
        <TouchableOpacity
          style={[styles.fab, styles.createFab]}
          onPress={() => router.push("/create-room")}
        >
          <Plus size={26} color="#fff" />
          <Text style={styles.fabText}>Tạo phòng</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.fab, styles.joinFab]}
        onPress={() => router.push("/join-room")}
      >
        <Text style={styles.fabText}>Tham gia</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  username: {
    marginLeft: 12,
    fontWeight: "bold",
    fontSize: 18,
    flex: 1,
    color: colors.primary,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
  },
  logoutText: {
    color: colors.accentRed,
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 14,
  },

  room: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  roomName: {
    fontWeight: "700",
    fontSize: 17,
    color: "#1f2937",
  },
  roomId: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
  online: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: colors.gray,
    fontSize: 16,
    marginTop: 50,
  },

  fab: {
    position: "absolute",
    right: 20,
    width: 140,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    flexDirection: "row",
  },
  createFab: {
    backgroundColor: colors.primary,
    bottom: 100,
  },
  joinFab: {
    backgroundColor: colors.gray,
    bottom: 30,
  },
  fabText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
});