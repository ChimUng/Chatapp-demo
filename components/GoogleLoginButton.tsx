import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/components/config/firebase';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser'; // ✅ thêm
import Constants from 'expo-constants';

// Web Firebase Auth
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';

// ✅ xử lý web browser redirect cho Expo AuthSession (đề phòng redirect bị treo)
WebBrowser.maybeCompleteAuthSession();

export default function GoogleLoginButton() {
  const router = useRouter();

  useEffect(() => {
    // ✅ cấu hình Google Signin cho mobile
    GoogleSignin.configure({
      webClientId:
        Constants.expoConfig?.extra?.googleWebClientId ||
        '911289132793-v0micb48c0o9rqeqebrrf0i7t3ggh209.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const onGoogleSignIn = async () => {
    try {
      if (Platform.OS === 'web') {
        // === WEB: Dùng Firebase Web Auth ===
        await GoogleSignin.revokeAccess?.();
        await GoogleSignin.signOut?.();
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log("Web login success:", result.user.email);
        router.replace('/home');
      } else {
        // === MOBILE (iOS/Android): Dùng react-native-google-signin ===
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        const idToken = (userInfo as any)?.idToken || (userInfo as any)?.data?.idToken;
        console.log("userInfo:", JSON.stringify(userInfo, null, 2));

        if (!idToken) throw new Error("Không lấy được ID Token từ Google");

        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        router.replace('/home');
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Đăng nhập đã bị huỷ');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Đang xử lý đăng nhập...');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play Services chưa được cài đặt');
      } else {
        Alert.alert('Lỗi đăng nhập Google', error.message || 'Có lỗi xảy ra');
      }
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={onGoogleSignIn}>
      <Text style={styles.text}>Sign in with Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4285f4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: { color: '#4285f4', fontWeight: 'bold', fontSize: 16 },
});
