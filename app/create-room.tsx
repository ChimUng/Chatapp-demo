// app/create-room.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from '@/components/config/firebase';
import { useRouter } from 'expo-router';
import { OWNER_UID } from '@/constant';
import colors from "@/colors";

function generateShortId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CreateRoomScreen() {
  const [roomName, setRoomName] = useState('');
  const router = useRouter();

  const handleCreate = async () => {
    if (!roomName.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập tên phòng!');

    if (auth.currentUser?.uid !== OWNER_UID) {
      return Alert.alert('Quyền hạn', 'Chỉ admin mới được tạo phòng!');
    }

    let roomId = generateShortId();
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists()) {
      roomId = generateShortId(); // retry
    }

    try {
      // Tạo phòng
      await setDoc(roomRef, {
        name: roomName,
        maxUsers: 40,
        onlineUsers: [auth.currentUser.uid],
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
      });

      // Thêm vào myRooms của admin
      await setDoc(doc(db, "users", auth.currentUser.uid, "myRooms", roomId), {
        roomId,
        name: roomName,
        joinedAt: new Date(),
      });

      // THÔNG BÁO + REDIRECT ĐÚNG CÁCH
      Alert.alert(
        'Tạo phòng thành công!',
        `Mã phòng: ${roomId}\nĐã sao chép vào clipboard!`,
        [
          {
            text: 'OK, về trang chủ',
            onPress: () => {
              router.replace('/home'); // Đảm bảo về đúng Home, refresh danh sách
            }
          }
        ],
        { cancelable: false }
      );

      // Copy vào clipboard (tùy chọn)
      // Clipboard.setString(roomId);

    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tạo phòng');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo phòng chat mới</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: Tâm sự đêm khuya"
        value={roomName}
        onChangeText={setRoomName}
      />
      <TouchableOpacity style={styles.btn} onPress={handleCreate}>
        <Text style={styles.btnText}>TẠO PHÒNG</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
        <Text style={styles.cancel}>Hủy</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.background, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 32, color: colors.primary },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    fontSize: 17,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancel: { color: colors.gray, fontWeight: '600', fontSize: 16 },
});