import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyChpE-8YJtSeKRJfFCGmLbpSV_Vj0w-B6Y",
  authDomain: "memory-wall-23aed.firebaseapp.com",
  projectId: "memory-wall-23aed",
  storageBucket: "memory-wall-23aed.firebasestorage.app",
  messagingSenderId: "802728280470",
  appId: "1:802728280470:web:050c9d99956f5c4918ddb7",
  measurementId: "G-CE5M408M5T",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
