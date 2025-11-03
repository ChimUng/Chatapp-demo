import React, { useState, useEffect, useCallback } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, arrayRemove, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/components/config/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ChatRoom() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const router = useRouter();

  // Leave room khi thoát
  useEffect(() => {
    if (!roomId || !auth.currentUser) return;

    const roomRef = doc(db, "rooms", roomId);

    return () => {
      updateDoc(roomRef, {
        onlineUsers: arrayRemove(auth.currentUser?.uid),
      });
    };
  }, [roomId]);

  useEffect(() => {
    const q = query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text,
          createdAt: data.createdAt?.toDate(),
          user: data.user,
        } as IMessage;
      }));
    });
    return unsubscribe;
  }, [roomId]);

  const onSend = useCallback((msgs: IMessage[] = []) => {
    setMessages(prev => GiftedChat.append(prev, msgs));
    const msg = msgs[0];
    addDoc(collection(db, "rooms", roomId, "messages"), {
      ...msg,
      user: {
        _id: auth.currentUser?.uid,
        name: auth.currentUser?.displayName,
        avatar: auth.currentUser?.photoURL,
      },
      createdAt: serverTimestamp(),
    });
  }, [roomId]);

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{ _id: auth.currentUser?.uid || "" }}
      showUserAvatar={true}
    />
  );
}