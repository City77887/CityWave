import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- VAŽNO: OVDJE ZALIJEPITE SVOJE PODATKE S FIREBASE KONZOLE ---
// 1. Otiđite na Project Settings u Firebase konzoli
// 2. Kopirajte 'firebaseConfig' objekt
// 3. Zamijenite ovaj objekt ispod sa svojim podacima

const firebaseConfig = {
  apiKey: "OVDJE_ZALIJEPITE_SVOJ_API_KEY",
  authDomain: "vas-projekt.firebaseapp.com",
  projectId: "vas-projekt",
  storageBucket: "vas-projekt.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
