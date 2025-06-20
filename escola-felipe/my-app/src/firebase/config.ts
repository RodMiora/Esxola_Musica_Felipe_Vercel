// src/firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app"; // Importe getApps e getApp
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Use variáveis de ambiente para suas credenciais
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Lê do .env.local
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, // Lê do .env.local
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Lê do .env.local
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Lê do .env.local
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // Lê do .env.local
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID, // Lê do .env.local
  // Se estiver usando Analytics, inclua também:
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Lê do .env.local
};

// Inicializa o Firebase
// Verifica se já existe uma instância para evitar reinicialização no Next.js (importante!)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporta os serviços que você precisa (Firestore, Auth, etc.)
const db = getFirestore(app);
const auth = getAuth(app); // Mantenha se estiver usando autenticação

console.log("Firebase Auth instance in config.ts:", auth); // Adicione esta linha

export { app, db, auth }; // Exporte todos que você precisa
