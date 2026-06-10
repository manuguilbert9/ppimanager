// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Configuration du projet PPIManager : utilisée pour les données (Firestore).
const firebaseConfig = {
  "projectId": "ppimanager",
  "appId": "1:254869216152:web:27b247c92bcf8d5144e9ed",
  "storageBucket": "ppimanager.appspot.com",
  "apiKey": "AIzaSyDePmita_3v9eePQYfBAIrxDfW3VvJIldI",
  "authDomain": "ppimanager.firebaseapp.com",
  "messagingSenderId": "254869216152"
};

// Configuration du projet Adapti (n° 625285809228) : utilisée UNIQUEMENT pour
// l'authentification, afin de permettre la connexion avec les comptes Adapti.
const adaptiAuthConfig = {
  "projectId": "studio-187161328-8fdc7",
  "appId": "1:625285809228:web:2977ea4c29ca94685820e9",
  "storageBucket": "studio-187161328-8fdc7.firebasestorage.app",
  "apiKey": "AIzaSyAISAyRfP15-V3cCqlzfulbo4nxOYjRbPY",
  "authDomain": "studio-187161328-8fdc7.firebaseapp.com",
  "messagingSenderId": "625285809228"
};

// Récupère une app Firebase nommée existante ou l'initialise (évite la
// réinitialisation lors du Hot Module Replacement en développement).
function getOrInitApp(name: string, config: typeof firebaseConfig): FirebaseApp {
  const existing = getApps().find((a) => a.name === name);
  return existing ?? initializeApp(config, name);
}

// App principale (par défaut) pour les données PPIManager.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// App secondaire dédiée à l'authentification via le projet Adapti.
const adaptiAuthApp = getOrInitApp("adapti-auth", adaptiAuthConfig);
const auth = getAuth(adaptiAuthApp);
// E-mails d'authentification (réinitialisation de mot de passe...) en français.
auth.languageCode = "fr";

export { db, auth };
