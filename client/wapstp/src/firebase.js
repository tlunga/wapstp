// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCNxOsGFz6Bq1MeFnacxUM6KL_OCp_Jzyo",
  authDomain: "wapstp1.firebaseapp.com",
  projectId: "wapstp1",
  storageBucket: "wapstp1.firebasestorage.app",
  messagingSenderId: "280142936374",
  appId: "1:280142936374:web:d51f99fd81cf18a742db97",
  measurementId: "G-TF73KSKDZJ"
};

// Inicializace Firebase
const app = initializeApp(firebaseConfig);

// Export pro použití v komponentách
export const auth = getAuth(app);
