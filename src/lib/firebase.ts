// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "flashppi",
  "appId": "1:555605811875:web:f6c3c7f43bd9f7bc1c9516",
  "storageBucket": "flashppi.firebasestorage.app",
  "apiKey": "AIzaSyB7fCSlGlVe8qNroFwCmkUqnYwXMf71UPg",
  "authDomain": "flashppi.firebaseapp.com",
  "messagingSenderId": "555605811875"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
