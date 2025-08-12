// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "TODO:_REPLACE_ME",
  authDomain: "TODO:__REPLACE_ME",
  projectId: "TODO:__REPLACE_ME",
  storageBucket: "TODO:__REPLACE_ME",
  messagingSenderId: "TODO:__REPLACE_ME",
  appId: "TODO:__REPLACE_ME"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
