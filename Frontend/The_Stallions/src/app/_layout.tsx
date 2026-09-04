import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LangProvider } from '../context/LangContext';
import { ThemeProvider } from '../context/ThemeContext';
import { EVENTS, events } from '../services/events';
import BiometricUnlockGate from '../components/BiometricUnlockGate';

SplashScreen.preventAutoHideAsync().catch(() => {});

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
  const [fontsLoaded, fontError] = useFonts({
    'Gilroy-Regular': require('../../assets/fonts/Gilroy-Regular.ttf'),
    'Gilroy-Medium': require('../../assets/fonts/Gilroy-Medium.ttf'),
    'Gilroy-Bold': require('../../assets/fonts/Gilroy-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return (
    <LangProvider>
      <ThemeProvider>
        <AuthProvider>
          <SessionBridge />
          <BiometricUnlockGate>
            <Slot />
          </BiometricUnlockGate>
        </AuthProvider>
      </ThemeProvider>
    </LangProvider>
  );
}
