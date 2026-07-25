import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { firebaseAuth } from '../config/firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(onIdTokenReady) {
  const callbackRef = useRef(onIdTokenReady);
  callbackRef.current = onIdTokenReady;

  const redirectUri = makeRedirectUri({
    scheme: 'thestallions',
    path: undefined,
  });

  const [request, response, promptAsync] = Google.useAuthRequest(
    Platform.select({
      android: {
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
        redirectUri,
      },
      ios: {
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
        redirectUri,
      },
      default: {
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
        redirectUri,
      },
    })
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

  const handlePrompt = async () => {
    if (Platform.OS === 'web') {
      const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      const idToken = await result.user.getIdToken();
      await callbackRef.current(idToken);
    } else {
      await promptAsync();
    }
  };

  return { promptAsync: handlePrompt, isReady: Platform.OS === 'web' ? true : !!request };
}
