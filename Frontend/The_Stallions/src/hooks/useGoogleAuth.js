import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth } from '../config/firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

let GoogleSignin = null;

if (Platform.OS !== 'web') {
  try {
    ({ GoogleSignin } = require('@react-native-google-signin/google-signin'));
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
    });
  } catch {
    GoogleSignin = null;
  }
}

async function exchangeGoogleTokenWithFirebase(googleIdToken, onIdTokenReady) {
  const credential = GoogleAuthProvider.credential(googleIdToken);
  const userCredential = await signInWithCredential(getFirebaseAuth(), credential);
  const firebaseIdToken = await userCredential.user.getIdToken();
  const user = userCredential.user;
  const googleProfile = {
    name: user.displayName ?? '',
    email: user.email ?? '',
    photo: user.photoURL ?? null,
  };
  await onIdTokenReady(firebaseIdToken, googleProfile);
}

export function useGoogleAuth(onIdTokenReady) {
  const [request, , authSessionPromptAsync] = Google.useIdTokenAuthRequest({
    clientId: WEB_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    selectAccount: true,
  });

  const handlePrompt = async () => {
    if (Platform.OS === 'web') {
      const result = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      const idToken = await result.user.getIdToken();
      const googleProfile = {
        name: result.user.displayName ?? '',
        email: result.user.email ?? '',
        photo: result.user.photoURL ?? null,
      };
      await onIdTokenReady(idToken, googleProfile);
      return;
    }

    if (GoogleSignin) {
      await GoogleSignin.hasPlayServices();
      if (GoogleSignin.hasPreviousSignIn()) {
        await GoogleSignin.signOut();
      }
      const signInResult = await GoogleSignin.signIn();
      if (signInResult.type !== 'success') throw new Error('Google Sign-In cancelado');
      const idToken = signInResult.data.idToken;
      if (!idToken) throw new Error('Google Sign-In no devolvió un idToken');
      await exchangeGoogleTokenWithFirebase(idToken, onIdTokenReady);
      return;
    }

    if (!request || !request.url) throw new Error('Google Sign-In no disponible');
    const response = await authSessionPromptAsync();
    if (response?.type !== 'success') throw new Error('Google Sign-In cancelado');
    const idToken = response.params?.id_token;
    if (!idToken) throw new Error('Google Sign-In no devolvió un idToken');
    await exchangeGoogleTokenWithFirebase(idToken, onIdTokenReady);
  };

  const isReady = Platform.OS === 'web' || GoogleSignin != null || (request != null && request.url != null);

  return { promptAsync: handlePrompt, isReady };
}