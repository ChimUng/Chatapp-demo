// app/join-room.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db, auth } from '@/components/config/firebase';
import { useRouter } from 'expo-router';
import colors from '@/colors';

export default function JoinRoomScreen() {
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();

  const handleJoin = async () => {
    if (!roomCode.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập mã phòng!');

    const roomRef = doc(db, "rooms", roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      return Alert.alert('Không tìm thấy!', 'Mã phòng sai hoặc đã bị xóa.');
    }

    const roomData = roomSnap.data();
    if (roomData.onlineUsers?.length >= 40) {
      return Alert.alert('Phòng đầy!', 'Không thể tham gia, phòng đã đầy 40 người.');
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

      // THÀNH CÔNG → ALERT + REDIRECT
      Alert.alert(
        'Tham gia thành công!',
        `Chào mừng bạn đến với phòng: ${roomData.name}`,
        [
          {
            text: 'Vào phòng ngay',
            onPress: () => {
              router.replace('/home'); // Về Home → FlatList sẽ tự load lại phòng mới
            }
          }
        ],
        { cancelable: false }
      );

    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tham gia phòng');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tham gia phòng chat</Text>
      <Text style={styles.desc}>Nhập mã phòng (6 ký tự)</Text>
      
      <TextInput
        style={styles.input}
        placeholder="VD: A1B2C3"
        value={roomCode}
        onChangeText={setRoomCode}
        autoCapitalize="characters"
        maxLength={10}
      />
      
      <TouchableOpacity style={styles.btn} onPress={handleJoin}>
        <Text style={styles.btnText}>THAM GIA NGAY</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
        <Text style={styles.cancel}>Hủy</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.background, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, color: colors.primary },
  desc: { textAlign: 'center', color: colors.gray, marginBottom: 32, fontSize: 16 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    fontSize: 17,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: 'bold',
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