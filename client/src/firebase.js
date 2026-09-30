// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getAuth, GoogleAuthProvider} from "firebase/auth"
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "genwebai-3372f.firebaseapp.com",
  projectId: "genwebai-3372f",
  storageBucket: "genwebai-3372f.firebasestorage.app",
  messagingSenderId: "256256969316",
  appId: "1:256256969316:web:8ba967db53317b7634ad71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth= getAuth(app)
const provider=new GoogleAuthProvider()

export {auth,provider}
