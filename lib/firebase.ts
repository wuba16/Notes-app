// lib/firebase.ts

import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";  // ← changed from firestore

const firebaseConfig = {
  apiKey: "AIzaSyASr27vooOKzWQQxklSpqaVZiJxLDiygE4",
  authDomain: "note-making-bae90.firebaseapp.com",
  databaseURL: "https://note-making-bae90-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "note-making-bae90",
  storageBucket: "note-making-bae90.firebasestorage.app",
  messagingSenderId: "1005860476351",
  appId: "1:1005860476351:web:ce466317411b22b9097d0a",
  measurementId: "G-Y9MR3NLK1Y"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getDatabase(app);  // ← changed from getFirestore