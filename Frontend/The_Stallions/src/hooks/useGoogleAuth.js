import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { firebaseAuth } from '../config/firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(onIdTokenReady) {
  const callbackRef = useRef(onIdTokenReady);
  callbackRef.current = onIdTokenReady;

  const [request, response, promptAsync] = Google.useAuthRequest(
    Platform.OS !== 'web'
      ? {
          androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
          iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
          webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
        }
      : { webClientId: '' }
  );

// Mobile: captura el resultado del auth session
  useEffect(() => {
    if (Platform.OS === 'web' || response?.type !== 'success') return;
    const { id_token } = response.params;
    if (!id_token) return;
    const credential = GoogleAuthProvider.credential(id_token);
    signInWithCredential(firebaseAuth, credential)
      .then(async (userCredential) => {
        const idToken = await userCredential.user.getIdToken();
        callbackRef.current(idToken);
      })
      .catch((error) => console.error('Error de Google Sign-In:', error));
  }, [response]);

  // Web: captura el resultado del redirect al montar
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    getRedirectResult(firebaseAuth)
      .then(async (result) => {
        if (!result) return;
        const idToken = await result.user.getIdToken();
        callbackRef.current(idToken);
      })
      .catch((error) => console.error('Error de Google redirect:', error));
  }, []);

  const handlePrompt = async () => {
    if (Platform.OS === 'web') {
      await signInWithRedirect(firebaseAuth, new GoogleAuthProvider());
    } else {
      promptAsync();
    }
  };

  return { promptAsync: handlePrompt, isReady: Platform.OS === 'web' ? true : !!request };
}
