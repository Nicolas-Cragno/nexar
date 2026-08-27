import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDfNGaL_XG-rvXMgIyx-wKmnkL5xC_rgrk",
  authDomain: "nexar-transcan.firebaseapp.com",
  projectId: "nexar-transcan",
  storageBucket: "nexar-transcan.firebasestorage.app",
  messagingSenderId: "150074122613",
  appId: "1:150074122613:web:cf8569a1404c752f5bf33c",
  measurementId: "G-Q8JEJ677W7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
