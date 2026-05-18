import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User } from '../types';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    let phone = firebaseUser.phoneNumber || '';
    
    // Extract phone from dummy email if needed
    if (!phone && firebaseUser.email?.startsWith('phone_')) {
      phone = firebaseUser.email.replace('phone_', '').replace('@storedb.com', '');
      phone = `0${phone}`; // Add leading zero back for display
    }
    
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        role = data.role || 'user';
        if (data.phone) phone = data.phone;
      } else {
        // Create user document if it doesn't exist
        const defaultEmail = firebaseUser.email || `${phone}@storedb.com`;
        const isDefaultAdmin = defaultEmail === 'Muwafaghussain23@gmail.com' && firebaseUser.emailVerified;
        role = isDefaultAdmin ? 'admin' : 'user';
        
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'عميل المتجر',
          email: defaultEmail,
          phone: phone,
          avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${phone || 'User'}&background=random`,
          role: role
        });
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
      // Fallback to checking email if Firestore fails
      if (firebaseUser.email === 'Muwafaghussain23@gmail.com' && firebaseUser.emailVerified) {
        role = 'admin';
      }
    }

    const u: User = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'عميل المتجر',
      email: firebaseUser.email || `${phone}@storedb.com`,
      phone: phone,
      avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${phone || 'User'}&background=random`,
      role: role
    };
    setUser(u);
  };

  const sendOtp = async (phone: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate network delay for sending OTP
      await new Promise(resolve => setTimeout(resolve, 800));
      // We don't actually send an SMS to save costs and avoid delivery issues in prototype
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setIsLoading(false);
      setError('حدث خطأ أثناء إرسال الرمز، يرجى المحاولة مرة أخرى');
    }
  };

  const verifyOtp = async (phone: string, code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (code !== '123456') {
        throw new Error('auth/invalid-verification-code');
      }

      // Format phone to ensure consistency (e.g., 5XXXXXXXX)
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1);
      }

      const dummyEmail = `phone_${cleanPhone}@storedb.com`;
      const dummyPassword = `WadiApp@${cleanPhone}`;

      try {
        // Try to sign in
        await signInWithEmailAndPassword(auth, dummyEmail, dummyPassword);
      } catch (signInErr: any) {
        // If user not found, create it
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          await createUserWithEmailAndPassword(auth, dummyEmail, dummyPassword);
        } else {
          throw signInErr;
        }
      }
      
      // onAuthStateChanged will handle the rest
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setIsLoading(false);
      
      let msg = 'فشل التحقق، يرجى المحاولة مرة أخرى';
      if (err.message === 'auth/invalid-verification-code' || err.code === 'auth/invalid-verification-code') {
        msg = 'رمز التحقق غير صحيح (استخدم 123456)';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'تأكد من اتصالك بالإنترنت';
      }
      
      setError(msg);
      throw err; // Re-throw to allow component to handle if needed
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      // Intentionally omitting console.error to reduce console noise for expected auth failures
      setIsLoading(false);
      let msg = 'فشل تسجيل الدخول';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'البريد الإلكتروني غير صالح';
      }
      setError(msg);
      throw err;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string, phone?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      
      // Create user document immediately
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        phone: phone || '',
        avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=random`,
        role: 'user'
      });
      
    } catch (err: any) {
      console.error('Error registering with email:', err);
      setIsLoading(false);
      let msg = 'فشل إنشاء الحساب';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'البريد الإلكتروني مستخدم مسبقاً';
      } else if (err.code === 'auth/weak-password') {
        msg = 'كلمة المرور ضعيفة جداً';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'البريد الإلكتروني غير صالح';
      }
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
    <AuthContext.Provider value={{ user, isLoading, sendOtp, verifyOtp, loginWithEmail, registerWithEmail, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};