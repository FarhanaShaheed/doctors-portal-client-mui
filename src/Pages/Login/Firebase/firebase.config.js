const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

/* Demo mode: false when no Firebase keys are configured (public demo deploy).
   Every getAuth()/onAuthStateChanged()/signOut() call must be guarded by this
   flag — initializeApp() is never called without keys, so `auth` would be null. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);

export default firebaseConfig;
