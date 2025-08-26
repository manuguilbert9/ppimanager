// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "ppimanager",
  "appId": "1:254869216152:web:27b247c92bcf8d5144e9ed",
  "storageBucket": "ppimanager.firebasestorage.app",
  "apiKey": "AIzaSyDePmita_3v9eePQYfBAIrxDfW3VvJIldI",
  "authDomain": "ppimanager.firebaseapp.com",
  "messagingSenderId": "254869216152"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
