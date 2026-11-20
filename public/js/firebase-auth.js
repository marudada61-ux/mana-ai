import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAG6r1fgplXUfAyhW_ZdZaLDvJKr2eOo2o",
  authDomain: "mana-ai-a738a.firebaseapp.com",
  projectId: "mana-ai-a738a",
  storageBucket: "mana-ai-a738a.firebasestorage.app",
  messagingSenderId: "559107114492",
  appId: "1:559107114492:web:cfa2a7202f801fdbe3de79",
  measurementId: "G-9Y2YWMK8Y8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

await setPersistence(auth, browserLocalPersistence);

export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
};
