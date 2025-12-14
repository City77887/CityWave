import * as firebaseApp from "firebase/app";
import * as firebaseAnalytics from "firebase/analytics";
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
const app = firebaseApp.initializeApp(firebaseConfig);
const analytics = firebaseAnalytics.getAnalytics(app);

// Export database for the app to use
export const db = getFirestore(app);