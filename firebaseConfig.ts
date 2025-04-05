import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getReactNativePersistence } from "firebase/auth"
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
apiKey: "AIzaSyBRIVF8RtEPHzoPs-qbuCw_-bjJig8VMz0",
authDomain: "zenkai-d27a5.firebaseapp.com",
projectId: "zenkai-d27a5",
storageBucket: "zenkai-d27a5.appspot.com",
messagingSenderId: "605344495900",
appId: "1:605344495900:web:915b15db229cfe897be2d9",
measurementId: "G-LL8J1GB28F",
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
