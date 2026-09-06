import { Platform } from 'react-native';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth } from '../config/firebaseConfig';

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

    await GoogleSignin.hasPlayServices();
    if (GoogleSignin.hasPreviousSignIn()) {
      await GoogleSignin.signOut();
    }
    const signInResult = await GoogleSignin.signIn();
    if (signInResult.type !== 'success') throw new Error('Google Sign-In cancelado');
    const idToken = signInResult.data.idToken;
    if (!idToken) throw new Error('Google Sign-In no devolvió un idToken');
    const account = signInResult.data.user ?? {};
    const googleProfile = {
      name: account.name ?? account.displayName ?? '',
      email: account.email ?? '',
      photo: account.photo ?? account.photoURL ?? null,
    };
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(getFirebaseAuth(), credential);
    const firebaseIdToken = await userCredential.user.getIdToken();
    await onIdTokenReady(firebaseIdToken, googleProfile);
  };

  return { promptAsync: handlePrompt, isReady: true };
}
