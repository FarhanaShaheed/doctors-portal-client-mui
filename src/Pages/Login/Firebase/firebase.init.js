import { initializeApp } from "firebase/app";
import firebaseConfig, { isFirebaseConfigured } from "./firebase.config";

/* Only ever initialise Firebase when real keys are present. In demo mode the
   app must never touch the SDK, otherwise getAuth() throws on boot. */
const initializeFirebase = () => {
  if (!isFirebaseConfigured) return null;
  return initializeApp(firebaseConfig);
};

export default initializeFirebase;
