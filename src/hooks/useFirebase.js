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
      .catch((error) => setAuthError(error.message))
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
      .catch((error) => setAuthError(error.message))
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
      .catch((error) => setAuthError(error.message))
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
          .then((data) => setAdmin(Boolean(data.admin)))
          .catch(() => setAdmin(false));
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
