import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

const expoConfig = Constants.expoConfig;
if (!expoConfig) throw new Error("Expo config is not available.");

const firebaseConfig = {
  apiKey: expoConfig.extra?.apiKey,
  authDomain: expoConfig.extra?.authDomain,
  projectId: expoConfig.extra?.projectId,
  storageBucket: expoConfig.extra?.storageBucket,
  messagingSenderId: expoConfig.extra?.messagingSenderId,
  appId: expoConfig.extra?.appId,
  measurementId: expoConfig.extra?.measurementId,
};

const app = initializeApp(firebaseConfig);
console.log("Firebase initialized with config:", firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

