import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { refreshCachedToken } from '../services/api';

const AuthContext = createContext();

const storage = {
  async get(key) {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key, value) {
    if (Platform.OS === 'web') return localStorage.setItem(key, value);
    return SecureStore.setItemAsync(key, value);
  },
  async remove(key) {
    if (Platform.OS === 'web') return localStorage.removeItem(key);
    return SecureStore.deleteItemAsync(key);
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await storage.get('authToken');
      const email = await storage.get('userEmail');
      const fullName = await storage.get('userFullName');
      const photo = await storage.get('userPhoto');
      if (token && email) setUser({ email, fullName, photo });
      setLoading(false);
      await refreshCachedToken();
    })();
  }, []);

  const signIn = async ({ token, email, fullName, photo }) => {
    await storage.set('authToken', token);
    await storage.set('userEmail', email);
    await storage.set('userFullName', fullName || '');
    if (photo) {
      await storage.set('userPhoto', photo);
    } else {
      await storage.remove('userPhoto');
    }
    await refreshCachedToken();
    setUser({ email, fullName, photo: photo || null });
  };

  const signOut = async () => {
    await storage.remove('authToken');
    await storage.remove('userEmail');
    await storage.remove('userFullName');
    await storage.remove('userPhoto');
    await storage.remove('profilePhoto');
    await refreshCachedToken();
    setUser(null);
  };

  const updateUser = async (partial) => {
    setUser((prev) => ({ ...(prev ?? {}), ...partial }));
    if (partial.email !== undefined) {
      await storage.set('userEmail', partial.email || '');
    }
    if (partial.fullName !== undefined) {
      if (partial.fullName) await storage.set('userFullName', partial.fullName);
      else await storage.remove('userFullName');
    }
    if (partial.photo !== undefined) {
      if (partial.photo) await storage.set('userPhoto', partial.photo);
      else await storage.remove('userPhoto');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
