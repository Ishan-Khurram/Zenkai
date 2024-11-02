import 'dotenv/config';
import { Constants } from 'expo-constants';
import { initalizeApp } from 'firebase/app';
// this is where firestore and other components of firebase will be imported.

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.databaseURL,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: 'sender-id',
    appId: 'app-id',
    measurementId: 'G-measurement-id',
  };
  
  const app = initializeApp(firebaseConfig);