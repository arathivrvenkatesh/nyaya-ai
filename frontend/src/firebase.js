import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAcXw7c66TDrtWM_P5dSZ8tCshX3eigaCs",
  authDomain: "nyaya-ai-auth.firebaseapp.com",
  projectId: "nyaya-ai-auth",
  storageBucket: "nyaya-ai-auth.firebasestorage.app",
  messagingSenderId: "860871461865",
  appId: "1:860871461865:web:139baa0dd47d50d3f59978"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();