// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);