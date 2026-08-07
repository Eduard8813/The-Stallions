import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LangProvider } from '../context/LangContext';
import { EVENTS, events } from '../services/events';

/**
 * Listens to global auth events (session expired, logged out) emitted by the
 * service layer and signs the user out locally + redirects to login.
 */
function SessionBridge() {
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handle = async () => {
      await signOut();
      router.replace('/(auth)/login');
    };
    const offExpired = events.on(EVENTS.sessionExpired, handle);
    const offLoggedOut = events.on(EVENTS.loggedOut, handle);
    return () => {
      offExpired();
      offLoggedOut();
    };
  }, [signOut, router]);

  return null;
}

export default function RootLayout() {
  return (
    <LangProvider>
      <AuthProvider>
        <SessionBridge />
        <Slot />
      </AuthProvider>
    </LangProvider>
  );
}
