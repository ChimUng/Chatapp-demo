import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/components/config/firebase";
import { useRouter } from "expo-router";
import colors from "@/colors";

const backImage = require("@/assets/images/backImage.png");

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const onHandleSignup = () => {
    if (email !== "" && password !== "") {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          const displayName = email.split('@')[0];
          const avatar = `https://i.pravatar.cc/150?u=${user.uid}`;

          updateProfile(user, { displayName, photoURL: avatar })
            .then(() => {
              console.log("Signup success + profile updated");
              router.push("/home");
            })
            .catch((err) => Alert.alert("Lỗi cập nhật hồ sơ", err.message));
        })
        .catch((err) => Alert.alert("Đăng ký thất bại", err.message));
    } else {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={backImage} style={styles.backImage} />
      <View style={styles.whiteSheet} />
      
      <SafeAreaView style={styles.form}>
        <Text style={styles.title}>Sign Up</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          autoCapitalize="none"
          secureTextEntry={true}
          textContentType="password"
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        
        <View style={styles.loginLink}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.loginAction}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      
      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.primary,
    alignSelf: "center",
    paddingBottom: 32,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#fff",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 16,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  backImage: {
    width: "100%",
    height: 340,
    position: "absolute",
    top: 0,
    resizeMode: "cover",
  },
  whiteSheet: {
    width: "100%",
    height: "75%",
    position: "absolute",
    bottom: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: colors.primary,
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  loginLink: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
  loginText: {
    color: colors.gray,
    fontWeight: "600",
    fontSize: 15,
  },
  loginAction: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
});