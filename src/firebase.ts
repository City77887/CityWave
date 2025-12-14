import * as firebaseApp from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtChrCrjpxTZD4KMv7nv9oxIe0CqVUUc0",
  authDomain: "citywaveevent.firebaseapp.com",
  projectId: "citywaveevent",
  storageBucket: "citywaveevent.firebasestorage.app",
  messagingSenderId: "1052821816110",
  appId: "1:1052821816110:web:6fa218b3429034d424b0bf",
  measurementId: "G-EMCZRSV48G"
};

// Initialize Firebase
// Using any cast on the namespace import to bypass the TypeScript error
// claiming initializeApp is not exported, which can happen with mismatched types.
const app = (firebaseApp as any).initializeApp(firebaseConfig);
export const db = getFirestore(app);