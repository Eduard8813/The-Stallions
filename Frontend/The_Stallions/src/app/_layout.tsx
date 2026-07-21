import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { LangProvider } from '../context/LangContext';

export default function RootLayout() {
  return (
    <LangProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </LangProvider>
  );
}
