// Import of functions needed from the needed SDKs
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import firebase from './firebase';

// Extract Firebase's API Key from the '.env' file
const KEY = import.meta.env.API_KEY;

// TODO: Add SDKs for Firebase products that one wants to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Our web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: KEY,
  authDomain: "futtech-m25.firebaseapp.com",
  projectId: "futtech-m25",
  storageBucket: "futtech-m25.firebasestorage.app",
  messagingSenderId: "547715919691",
  appId: "1:547715919691:web:2d449adb81a5079216c2ce",
  measurementId: "G-RR5GNXG6QH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Create a storage object enabling CRUD Operations.
const storage = getStorage(app);

export default storage;
