import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_GmkigVg1ql0-PXpMDVD6vihBASF0yRw",
  authDomain: "harmun-portal.firebaseapp.com",
  projectId: "harmun-portal",
  storageBucket: "harmun-portal.appspot.com",
  messagingSenderId: "1048209874863",
  appId: "1:1048209874863:web:58243c8440aace76bb995a",
  measurementId: "G-K8JQBHF8T0"
};

// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
