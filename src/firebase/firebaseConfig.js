import { getApp, getApps, initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import {
  AUTH_EMULATOR_URL,
  EMULATOR_PROJECT_ID,
  FIRESTORE_EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
  isFirebaseEmulatorMode,
} from "./emulatorConfig";

const productionFirebaseConfig = {
  apiKey: "AIzaSyDfNGaL_XG-rvXMgIyx-wKmnkL5xC_rgrk",
  authDomain: "nexar-transcan.firebaseapp.com",
  projectId: "nexar-transcan",
  storageBucket: "nexar-transcan.firebasestorage.app",
  messagingSenderId: "150074122613",
  appId: "1:150074122613:web:cf8569a1404c752f5bf33c",
  measurementId: "G-Q8JEJ677W7"
};

const useEmulator = isFirebaseEmulatorMode();
const firebaseConfig = useEmulator
  ? {
      apiKey: "demo-api-key",
      authDomain: `${EMULATOR_PROJECT_ID}.local`,
      projectId: EMULATOR_PROJECT_ID,
      appId: "demo-nexar-emulator",
    }
  : productionFirebaseConfig;

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

if (useEmulator && !window.__NEXAR_FIREBASE_EMULATORS_CONNECTED__) {
  connectFirestoreEmulator(db, FIRESTORE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
  connectAuthEmulator(auth, AUTH_EMULATOR_URL, { disableWarnings: true });
  window.__NEXAR_FIREBASE_EMULATORS_CONNECTED__ = true;
}

if (useEmulator && !window.__NEXAR_FIREBASE_EMULATORS_CONNECTED__) {
  throw new Error("No se pudo conectar Nexar exclusivamente a Firebase Emulator Suite.");
}

export { auth, db, useEmulator };
