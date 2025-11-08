import React, { useState, useEffect, createContext, useContext } from "react";
import { Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/components/config/firebase";

const AuthenticatedUserContext = createContext<any>({});
export const useAuth = () => useContext(AuthenticatedUserContext);

const AuthenticatedUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("AUTH STATE CHANGED:", u?.uid, u?.email);
      setUser(u);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};

function RootLayoutInner() {
  const { user } = useAuth();

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: "#fff" } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {user ? (
        <>
          <Stack.Screen name="home" options={{ title: "Rooms" }} />
          <Stack.Screen name="join-room" options={{ presentation: "modal", title: "Join Room" }} />
          <Stack.Screen name="create-room" options={{ presentation: "modal", title: "Create Room" }} />
          <Stack.Screen name="(chat)" options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} /> {/* THÊM DÒNG NÀY */}
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthenticatedUserProvider>
      <RootLayoutInner />
    </AuthenticatedUserProvider>
  );
}