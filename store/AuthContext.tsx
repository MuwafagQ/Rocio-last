import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  registerAnonymous: (name: string, phone: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  // TODO: Re-enable when Meta approves rocio_otp template + Cloud Function token minting replaces n8n custom-token flow
  // sendOtp: (phone: string, name: string) => Promise<void>;
  // verifyOtp: (phone: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const callRegisterWebhook = async (uid: string, email: string, phone: string, name: string) => {
  try {
    await fetch('https://n8n.srv1473225.hstgr.cloud/webhook/register-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebase_uid: uid, email, phone, name })
    });
  } catch {
    // Non-fatal: user exists in Firebase, Odoo sync will catch up
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await mapFirebaseUserToLocal(firebaseUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const mapFirebaseUserToLocal = async (firebaseUser: FirebaseUser) => {
    let role: 'admin' | 'user' = 'user';
    let tier: 'standard' | 'subscriber' | 'corporate' | 'mosque' = 'standard';
    let phone = firebaseUser.phoneNumber || '';
    let name = firebaseUser.displayName || '';

    // Extract phone for custom-token phone users (uid = phone_05XXXXXXXX)
    if (!phone && firebaseUser.uid.startsWith('phone_')) {
      phone = firebaseUser.uid.replace('phone_', '');
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        role = data.role || 'user';
        tier = data.tier || 'standard';
        if (data.phone) phone = data.phone;
        if (data.name) name = data.name;
      }
      // Phone-auth users: n8n verify-otp creates the user doc before returning the token
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }

    setUser({
      id: firebaseUser.uid,
      name: name || 'عميل المتجر',
      email: firebaseUser.email || `${firebaseUser.uid}@rocio.app`,
      phone,
      avatarUrl:
        firebaseUser.photoURL ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name || phone || 'User')}&background=random`,
      role,
      tier,
    });
  };

  const registerAnonymous = async (name: string, phone: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const cred = await signInAnonymously(auth);
      const uid = cred.user.uid;

      // Fields match the Firestore create rule: hasOnly([uid, name, email, phone, avatarUrl, default_address])
      await setDoc(doc(db, 'users', uid), { uid, name, phone, email: '' }, { merge: true });

      // Set state immediately so the UI doesn't flash "عميل المتجر"
      setUser({
        id: uid,
        name,
        email: '',
        phone,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        role: 'user',
        tier: 'standard',
      });

      // Non-fatal: sync to Odoo + DataConnect via n8n
      callRegisterWebhook(uid, '', phone, name);
    } catch (err: any) {
      const code = err?.code ?? err?.message ?? 'unknown';
      console.error('registerAnonymous failed:', code, err);
      // Show the Firebase error code in dev so we can diagnose (e.g. auth/operation-not-allowed)
      setError(`حدث خطأ أثناء التسجيل (${code})`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Re-enable when Meta approves rocio_otp template + Cloud Function token minting replaces n8n custom-token flow
  // const sendOtp = async (phone: string, name: string) => { ... fetch /webhook/send-otp ... }
  // const verifyOtp = async (phone: string, code: string) => { ... fetch /webhook/verify-otp, signInWithCustomToken ... }

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setIsLoading(false);
      const msg =
        err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential'
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          : err.code === 'auth/invalid-email'
          ? 'البريد الإلكتروني غير صالح'
          : 'فشل تسجيل الدخول';
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, registerAnonymous, loginWithEmail, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
