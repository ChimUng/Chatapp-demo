import React from "react";
import { StyleSheet, Text, View, Image, SafeAreaView, StatusBar } from "react-native";
import GoogleLoginButton from '@/components/GoogleLoginButton';
const backImage = require("@/assets/images/backImage.png");

export default function Login() {
  return (
    <View style={styles.container}>
      <Image source={backImage} style={styles.backImage} />
      <View style={styles.whiteSheet} />
      <SafeAreaView style={styles.form}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in with Google</Text>
        <GoogleLoginButton />
      </SafeAreaView>
      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 36, fontWeight: "bold", color: "orange", alignSelf: "center", paddingBottom: 24 },
  subtitle: { fontSize: 18, color: "gray", alignSelf: "center", paddingBottom: 40 },
  backImage: { width: "100%", height: 340, position: "absolute", top: 0, resizeMode: "cover" },
  whiteSheet: { width: "100%", height: "75%", position: "absolute", bottom: 0, backgroundColor: "#fff", borderTopLeftRadius: 60 },
  form: { flex: 1, justifyContent: "center", marginHorizontal: 30 },
});