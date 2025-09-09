// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBmsrFCszTqZLFiYRnMz7lHyODF1Mb4JQ4",
  authDomain: "expensetracker-81b44.firebaseapp.com",
  projectId: "expensetracker-81b44",
  storageBucket: "expensetracker-81b44.firebasestorage.app",
  messagingSenderId: "1033879419352",
  appId: "1:1033879419352:web:8cffc7bb945fa3c3aa9aad"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const getServerTimestamp = () => serverTimestamp();
