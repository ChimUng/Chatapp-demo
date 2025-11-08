import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from '@/components/config/firebase';
import { useRouter } from 'expo-router';
import { OWNER_UID } from '@/constant';

export default function CreateRoomScreen() {
  const [roomName, setRoomName] = useState('');
  const router = useRouter();

  const handleCreate = async () => {
    if (!roomName.trim()) return Alert.alert('Nhập tên phòng!');
    if (auth.currentUser?.uid !== OWNER_UID) {
      return Alert.alert('Chỉ admin mới được tạo phòng!');
    }

    const roomId = `phong-${roomName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    try {
      // Tạo phòng chính
      await setDoc(doc(db, "rooms", roomId), {
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

      Alert.alert(
        'Tạo phòng thành công!',
        `Mã phòng: ${roomId}\nĐã copy vào clipboard!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo phòng chat mới</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên phòng (VD: Tâm sự đêm khuya)"
        value={roomName}
        onChangeText={setRoomName}
      />
      <TouchableOpacity style={styles.btn} onPress={handleCreate}>
        <Text style={styles.btnText}>TẠO PHÒNG</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 15 }}>
        <Text style={styles.cancel}>Hủy</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#f57c00' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 18, borderRadius: 12, fontSize: 16, marginBottom: 20 },
  btn: { backgroundColor: '#f57c00', padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cancel: { textAlign: 'center', color: '#666', fontWeight: '600' },
});