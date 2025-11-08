import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db, auth } from '@/components/config/firebase';
import { useRouter } from 'expo-router';

export default function JoinRoomScreen() {
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();

  const handleJoin = async () => {
    if (!roomCode.trim()) return Alert.alert('Nhập mã phòng!');

    const roomRef = doc(db, "rooms", roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      return Alert.alert('Không tìm thấy phòng!', 'Mã phòng sai hoặc đã bị xóa.');
    }

    const roomData = roomSnap.data();
    if (roomData.onlineUsers?.length >= 40) {
      return Alert.alert('Phòng đã đầy!');
    }

    try {
      await updateDoc(roomRef, {
        onlineUsers: arrayUnion(auth.currentUser!.uid)
      });

      await setDoc(doc(db, "users", auth.currentUser!.uid, "myRooms", roomCode), {
        roomId: roomCode,
        name: roomData.name,
        joinedAt: new Date(),
      });

      Alert.alert('Thành công!', 'Đã tham gia phòng!', [{ text: 'OK', onPress: () => router.replace('/home') }]);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tham gia phòng chat</Text>
      <Text style={styles.desc}>Nhập mã phòng do admin gửi</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: phong-tam-su-123456789"
        value={roomCode}
        onChangeText={setRoomCode}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.btn} onPress={handleJoin}>
        <Text style={styles.btnText}>THAM GIA NGAY</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancel}>Hủy</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#f57c00' },
  desc: { textAlign: 'center', color: '#666', marginBottom: 30, fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 18, borderRadius: 12, fontSize: 16, marginBottom: 20 },
  btn: { backgroundColor: '#f57c00', padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cancel: { textAlign: 'center', marginTop: 15, color: '#666', fontWeight: '600' },
});