// src/firebase.js
<<<<<<< HEAD
import { getApps, getApp, initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
=======
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAndOX44oCPYXjfsmuykZmNPFEEvPB5mm0",
  authDomain: "codershubtest.firebaseapp.com",
  projectId: "codershubtest",
  storageBucket: "codershubtest.firebasestorage.app",
  messagingSenderId: "523364703687",
  appId: "1:523364703687:web:c1a481f8385de748b1cde2",
  measurementId: "G-KQ6XT03T1R"
};

<<<<<<< HEAD
// Initialize Firebase App idempotently
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence for React Native
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  auth = getAuth(app);
}
=======
// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
