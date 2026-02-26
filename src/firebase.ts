import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCZkzDzrZw3LN2hoZURd6e2oMrIAGA8_PQ",
  authDomain: "cementtargets.firebaseapp.com",
  databaseURL: "https://cementtargets-default-rtdb.firebaseio.com",
  projectId: "cementtargets",
  storageBucket: "cementtargets.firebasestorage.app",
  messagingSenderId: "1094842502355",
  appId: "1:1094842502355:web:e049bdf59d3df77e709826",
  measurementId: "G-K0RE8WSDMV"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
