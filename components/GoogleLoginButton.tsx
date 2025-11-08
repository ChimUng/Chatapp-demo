import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/components/config/firebase';
import { useRouter } from 'expo-router';

// Hoàn thành auth session (bắt buộc cho mobile)
WebBrowser.maybeCompleteAuthSession();

export default function GoogleLoginButton() {
  const router = useRouter();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '911289132793-v0micb48c0o9qreqebrrf0i7t3ggh209.apps.googleusercontent.com', // Web Client ID
    iosClientId: '911289132793-lhicncklrhk8g2k34go8eimqikbt07b4.apps.googleusercontent.com', // Nếu có iOS client
    androidClientId: '911289132793-kjq3dkrgfnpvkrcunfdsbvohvba206gr.apps.googleusercontent.com', // Android client ID từ Firebase
    redirectUri: AuthSession.makeRedirectUri({
    useProxy: true,
  }),
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => {
          console.log('Login success');
          router.replace('/home');
        })
        .catch((err) => {
          Alert.alert('Login error', err.message);
        });
    } else if (response?.type === 'error') {
      Alert.alert('Login failed', response.error?.message || 'Unknown error');
    }
  }, [response]);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        promptAsync();
      }}
      disabled={!request}
    >
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