import { Platform } from 'react-native';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { firebaseAuth } from '../config/firebaseConfig';

let GoogleSignin;
if (Platform.OS !== 'web') {
  ({ GoogleSignin } = require('@react-native-google-signin/google-signin'));
}

if (Platform.OS !== 'web' && GoogleSignin) {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
}

export function useGoogleAuth(onIdTokenReady) {
  const handlePrompt = async () => {
    if (Platform.OS === 'web') {
      const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      const idToken = await result.user.getIdToken();
      await onIdTokenReady(idToken);
      return;
    }

    await GoogleSignin.hasPlayServices();
    if (GoogleSignin.hasPreviousSignIn()) {
      await GoogleSignin.signOut();
    }
    const signInResult = await GoogleSignin.signIn();
    if (signInResult.type !== 'success') throw new Error('Google Sign-In cancelado');
    const idToken = signInResult.data.idToken;
    if (!idToken) throw new Error('Google Sign-In no devolvió un idToken');
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(firebaseAuth, credential);
    const firebaseIdToken = await userCredential.user.getIdToken();
    await onIdTokenReady(firebaseIdToken);
  };

  return { promptAsync: handlePrompt, isReady: true };
}
