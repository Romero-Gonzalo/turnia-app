import React, { createContext, useCallback, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getFirebaseErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email o contraseña incorrectos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Esperá unos minutos y volvé a probar.';
    case 'auth/network-request-failed':
      return 'No se pudo conectar con Firebase. Revisá tu conexión.';
    default:
      return 'No se pudo iniciar sesión. Intentá nuevamente.';
  }
}

function getDefaultName(firebaseUser: FirebaseUser) {
  if (firebaseUser.displayName) return firebaseUser.displayName;
  if (firebaseUser.email) return firebaseUser.email.split('@')[0];
  return 'Usuario Turnia';
}

async function getOrCreateUserProfile(firebaseUser: FirebaseUser): Promise<User> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    return {
      id: firebaseUser.uid,
      name: String(data.name ?? getDefaultName(firebaseUser)),
      email: String(data.email ?? firebaseUser.email ?? ''),
      role: data.role === 'barber' ? 'barber' : 'admin',
      avatar: typeof data.avatar === 'string' ? data.avatar : undefined,
      barbershopId: String(data.barbershopId ?? firebaseUser.uid),
      barbershopName: String(data.barbershopName ?? 'Mi barbería'),
    };
  }

  const profile: User = {
    id: firebaseUser.uid,
    name: getDefaultName(firebaseUser),
    email: firebaseUser.email ?? '',
    role: 'admin',
    barbershopId: firebaseUser.uid,
    barbershopName: 'Mi barbería',
  };

  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, 'barbershops', profile.barbershopId), {
    name: profile.barbershopName,
    ownerUid: profile.id,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, 'barbershops', profile.barbershopId, 'members', profile.id), {
    uid: profile.id,
    email: profile.email,
    role: profile.role,
    createdAt: serverTimestamp(),
  });

  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getOrCreateUserProfile(firebaseUser);
        setUser(profile);
      } catch (error) {
        console.error('Error loading Firebase user profile', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: getFirebaseErrorMessage(error) };
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
