import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { firebaseAuth } from '../config/firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(onIdTokenReady) {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const [request, response, promptAsync] = Google.useAuthRequest(
    Platform.OS !== 'web'
      ? {
          androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
          iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
          webClientId: webClientId ?? '',
        }
      : { webClientId: '' }
  );

  useEffect(() => {
    if (Platform.OS === 'web' || response?.type !== 'success') return;
    const { id_token } = response.params;
    if (!id_token) return;
    const credential = GoogleAuthProvider.credential(id_token);
    signInWithCredential(firebaseAuth, credential)
      .then(async (userCredential) => {
        const idToken = await userCredential.user.getIdToken();
        onIdTokenReady(idToken);
      })
      .catch((error) => console.error('Error de Google Sign-In:', error));
  }, [response]);

  const handlePrompt = async () => {
    if (Platform.OS === 'web') {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(firebaseAuth, provider);
        const idToken = await result.user.getIdToken();
        onIdTokenReady(idToken);
      } catch (error) {
        console.error('Error de Google Sign-In web:', error);
      }
    } else {
      promptAsync();
    }
  };

  return { promptAsync: handlePrompt, isReady: Platform.OS === 'web' ? true : !!request };
}
