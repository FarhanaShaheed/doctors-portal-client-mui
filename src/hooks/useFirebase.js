import { useEffect, useState } from 'react';
import initializeFirebase from './../Pages/Login/Firebase/firebase.init';
import { isFirebaseConfigured } from './../Pages/Login/Firebase/firebase.config';
import { API_BASE } from '../api/config';
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  getIdToken,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';

/* Who is an administrator once real Firebase auth is on. Firebase answers "who are you",
   not "what may you do" — the role normally lives in the users collection
   (GET /users/:email). Until that server is hosted this allowlist keeps the clinic
   dashboard reachable; everyone else who registers is a patient. */
const ADMIN_EMAILS = (process.env.REACT_APP_ADMIN_EMAILS || '')
  .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
const isConfiguredAdmin = (email) => ADMIN_EMAILS.includes(String(email || '').toLowerCase());

/* Raw codes like "Firebase: Error (auth/user-not-found)" are meaningless to a patient. */
export const friendlyAuthError = (e) => {
  const c = (e && (e.code || e.message)) || '';
  if (c.includes('unauthorized-domain')) return "Google Sign-In isn't enabled for this domain yet — please use email & password.";
  if (c.includes('invalid-api-key')) return 'Authentication is not configured for this deployment.';
  if (c.includes('email-already-in-use')) return 'That email is already registered — try logging in instead.';
  if (c.includes('weak-password')) return 'Please choose a password with at least 6 characters.';
  if (c.includes('user-not-found') || c.includes('wrong-password') || c.includes('invalid-credential') || c.includes('invalid-login-credentials')) return 'Wrong email or password.';
  if (c.includes('too-many-requests')) return 'Too many attempts — please wait a moment and try again.';
  if (c.includes('popup-closed-by-user')) return 'Sign-in window closed before completing.';
  if (c.includes('network-request-failed')) return 'Network problem — please check your connection.';
  return (e && e.message) ? e.message.replace('Firebase: ', '') : 'Something went wrong.';
};

if (isFirebaseConfigured) initializeFirebase();

/* DEMO MODE ------------------------------------------------------------------
   With no Firebase keys (the public demo deploy) authentication runs entirely
   client side: any email + password signs you in, the session lives in
   localStorage, and the demo user is an admin so the whole dashboard is
   explorable. The returned API shape is identical in both modes, so no
   consumer needs to know which mode it is running in. */
const DEMO_KEY = 'dp_demo_user';
const demoRead = () => {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || null; } catch (e) { return null; }
};
const demoWrite = (u) => {
  try {
    if (u) localStorage.setItem(DEMO_KEY, JSON.stringify(u));
    else localStorage.removeItem(DEMO_KEY);
  } catch (e) { /* private mode */ }
};

const useFirebase = () => {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [admin, setAdmin] = useState(false);
  const [token, setToken] = useState('');

  // Never call getAuth() without an initialised app — it throws.
  const auth = isFirebaseConfigured ? getAuth() : null;
  const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null;

  const demoSignIn = (u, location, history, fallback = '/dashboard') => {
    demoWrite(u);
    setUser(u);
    setAdmin(true);
    setToken('demo-token');
    setAuthError('');
    setIsLoading(false);
    const destination = location?.state?.from || fallback;
    if (history) history.replace(destination);
  };

  const registerUser = (email, password, name, history) => {
    if (!isFirebaseConfigured) {
      if (!email || !password) { setAuthError('Please enter an email address and a password.'); return; }
      demoSignIn({ email, displayName: name || email.split('@')[0], demo: true }, null, history);
      return;
    }
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        setAuthError('');
        setUser({ email, displayName: name });
        saveUser(email, name, 'POST');
        updateProfile(auth.currentUser, { displayName: name }).catch(() => {});
        history.replace('/');
      })
      .catch((error) => setAuthError(friendlyAuthError(error)))
      .finally(() => setIsLoading(false));
  };

  const loginUser = (email, password, location, history) => {
    if (!isFirebaseConfigured) {
      if (!email || !password) { setAuthError('Please enter an email address and a password.'); return; }
      demoSignIn({ email, displayName: email.split('@')[0], demo: true }, location, history);
      return;
    }
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        const destination = location?.state?.from || '/dashboard';
        history.replace(destination);
        setAuthError('');
      })
      .catch((error) => setAuthError(friendlyAuthError(error)))
      .finally(() => setIsLoading(false));
  };

  const signInWithGoogle = (location, history) => {
    if (!isFirebaseConfigured) {
      demoSignIn({ email: 'demo.patient@doctorsportal.demo', displayName: 'Demo Patient', demo: true }, location, history);
      return;
    }
    setIsLoading(true);
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const u = result.user;
        saveUser(u.email, u.displayName, 'PUT');
        setAuthError('');
        const destination = location?.state?.from || '/dashboard';
        history.replace(destination);
      })
      .catch((error) => setAuthError(friendlyAuthError(error)))
      .finally(() => setIsLoading(false));
  };

  // observe user state
  useEffect(() => {
    if (!isFirebaseConfigured) {
      const stored = demoRead();
      if (stored) { setUser(stored); setAdmin(true); setToken('demo-token'); }
      setIsLoading(false);
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, (current) => {
      if (current) {
        setUser(current);
        getIdToken(current).then(setToken).catch(() => {});
        fetch(`${API_BASE}/users/${current.email}`)
          .then((res) => res.json())
          .then((data) => setAdmin(Boolean(data && data.admin) || isConfiguredAdmin(current.email)))
          .catch(() => setAdmin(isConfiguredAdmin(current.email)));   // no server yet -> allowlist
      } else {
        setUser({});
        setAdmin(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Password reset. The confirmation is identical whether or not the address exists,
     so the form cannot be used to discover who has an account. */
  const resetPassword = (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return Promise.reject(new Error('Please enter the email address you registered with.'));
    }
    if (!isFirebaseConfigured) {
      return Promise.reject(new Error('Password reset needs Firebase — it is not available in demo mode.'));
    }
    return sendPasswordResetEmail(getAuth(), email).catch((err) => {
      if (String(err && err.code).includes('user-not-found')) return;
      throw new Error(String(err.message || err).replace('Firebase: ', ''));
    });
  };

  const logOut = () => {
    if (!isFirebaseConfigured) {
      demoWrite(null);
      setUser({});
      setAdmin(false);
      setToken('');
      return;
    }
    setIsLoading(true);
    signOut(auth).catch(() => {}).finally(() => setIsLoading(false));
  };

  const saveUser = (email, displayName, method) => {
    fetch(`${API_BASE}/users`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, displayName }),
    }).catch(() => {});
  };

  return {
    user,
    admin,
    resetPassword,
    token,
    isLoading,
    authError,
    demoMode: !isFirebaseConfigured,
    registerUser,
    logOut,
    loginUser,
    signInWithGoogle,
  };
};

export default useFirebase;
