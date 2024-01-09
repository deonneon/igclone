import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Optionally import the services that you want to use
// import {...} from "firebase/database";
import { getFirestore } from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.VARIABLE_NAME,
  authDomain: process.env.VARIABLE_NAME,
  projectId: process.env.VARIABLE_NAME,
  storageBucket: process.env.VARIABLE_NAME,
  messagingSenderId: process.env.VARIABLE_NAME,
  appId: process.env.VARIABLE_NAME,
};

const app = initializeApp(firebaseConfig);

console.log(app); // Logs the initialized Firebase app instance

// Initialize Firestore
export const db = getFirestore(app);
export const auth = getAuth(app);
