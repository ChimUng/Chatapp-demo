// import React, { useState } from 'react';
// import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
// import { doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
// import { auth, db } from '@/components/config/firebase';
// import { useRouter } from 'expo-router';
// import { OWNER_UID } from '@/constant';

// export default function JoinRoomModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
//   const [roomId, setRoomId] = useState('');
//   const router = useRouter();

//   const handleJoin = async () => {
//   if (!roomId.trim()) return Alert.alert('Enter Room ID');
//   if (!auth.currentUser) return;

//   const roomRef = doc(db, "rooms", roomId);
//   const snap = await getDoc(roomRef);

//   // === CHỈ BẠN ĐƯỢC TẠO PHÒNG MỚI ===
//   if (!snap.exists()) {
//     if (auth.currentUser.uid !== OWNER_UID) {
//       return Alert.alert("Permission Denied", "Only admin can create new rooms.");
//     }
//     await setDoc(roomRef, { maxUsers: 40, onlineUsers: [] });
//   }

//   // === JOIN PHÒNG ===
//   const online = snap.data()?.onlineUsers?.length || 0;
//   if (online >= 40) return Alert.alert('Room is full!');

//   await updateDoc(roomRef, { onlineUsers: arrayUnion(auth.currentUser.uid) });
//   router.push({ pathname: "/chat/[roomId]", params: { roomId } });
//   onClose();
// };

//   return (
//     <Modal visible={visible} animationType="slide">
//       <View style={styles.container}>
//         <TextInput style={styles.input} placeholder="Room ID" value={roomId} onChangeText={setRoomId} />
//         <TouchableOpacity style={styles.btn} onPress={handleJoin}>
//           <Text style={styles.btnText}>Join / Create</Text>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={onClose}>
//           <Text style={styles.cancel}>Cancel</Text>
//         </TouchableOpacity>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
//   input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 20 },
//   btn: { backgroundColor: '#f57c00', padding: 15, borderRadius: 10, alignItems: 'center' },
//   btnText: { color: '#fff', fontWeight: 'bold' },
//   cancel: { textAlign: 'center', marginTop: 10, color: 'gray' },
// });