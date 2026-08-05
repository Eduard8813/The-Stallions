import React, { createContext, useState, useContext } from 'react';

const translations = {
  es: {
    welcome: '¡Bienvenido!',
    signOut: 'Cerrar sesión',
    login: 'Iniciar sesión',
    loginSubtitle: 'Inicia sesión para continuar',
    register: 'Crear cuenta ✨',
    registerSubtitle: 'Regístrate para empezar',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    fullName: 'Nombre completo',
    loginButton: 'Iniciar sesión',
    registerButton: 'Crear cuenta',
    orContinueWith: 'o',
    continueWithGoogle: 'Continuar con Google',
    noAccount: '¿No tienes cuenta?',
    signUpLink: 'Regístrate',
    hasAccount: '¿Ya tienes cuenta?',
    signInLink: 'Inicia sesión',
    errorInvalidEmail: 'Ingresa un correo válido',
    errorEmailRequired: 'Ingresa tu correo',
    errorPasswordRequired: 'Ingresa tu contraseña',
    errorConfirmPassword: 'Confirma tu contraseña',
    errorShortPassword: 'La contraseña debe tener al menos 8 caracteres',
    errorPasswordMatch: 'Las contraseñas no coinciden',
    errorFullName: 'Ingresa tu nombre completo',
    errorCredentials: 'Correo o contraseña incorrectos',
    errorInvalidData: 'Revisa los datos ingresados',
    errorServer: 'Error en el servidor. Inténtalo de nuevo más tarde.',
    errorNetwork: 'No se pudo conectar. Revisa tu conexión a internet.',
    errorGoogle: 'No se pudo continuar con Google',
    errorLogin: 'Error al iniciar sesión',
    errorRegister: 'Error al registrarse',
    errorEmailTaken: 'Este correo ya está registrado',
    emailPlaceholder: 'correo@ejemplo.com',
    passwordPlaceholder: 'Mínimo 8 caracteres',
    namePlaceholder: 'Tu nombre',
    language: 'Idioma',
    locationUnavailableTitle: 'Mapa no disponible',
    locationUnavailableMessage:
      'La versión instalada de la app no incluye el módulo de ubicación. Instala el dev build actualizado e inténtalo de nuevo.',
  },
  en: {
    welcome: 'Welcome!',
    signOut: 'Sign out',
    login: 'Welcome back 👋',
    loginSubtitle: 'Sign in to continue',
    register: 'Create account ✨',
    registerSubtitle: 'Sign up to get started',
    email: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm password',
    fullName: 'Full name',
    loginButton: 'Sign in',
    registerButton: 'Create account',
    orContinueWith: 'or',
    continueWithGoogle: 'Continue with Google',
    noAccount: "Don't have an account?",
    signUpLink: 'Sign up',
    hasAccount: 'Already have an account?',
    signInLink: 'Sign in',
    errorInvalidEmail: 'Enter a valid email',
    errorEmailRequired: 'Enter your email',
    errorPasswordRequired: 'Enter your password',
    errorConfirmPassword: 'Confirm your password',
    errorShortPassword: 'Password must be at least 8 characters',
    errorPasswordMatch: 'Passwords do not match',
    errorFullName: 'Enter your full name',
    errorCredentials: 'Incorrect email or password',
    errorInvalidData: 'Check the entered data',
    errorServer: 'Server error. Please try again later.',
    errorNetwork: 'Unable to connect. Check your internet connection.',
    errorGoogle: 'Could not continue with Google',
    errorLogin: 'Login failed',
    errorRegister: 'Registration failed',
    errorEmailTaken: 'This email is already registered',
    emailPlaceholder: 'email@example.com',
    passwordPlaceholder: 'At least 8 characters',
    namePlaceholder: 'Your name',
    language: 'Language',
    locationUnavailableTitle: 'Map unavailable',
    locationUnavailableMessage:
      'The installed app version does not include the location module. Install the updated dev build and try again.',
  },
};

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('es');
  const t = translations[lang];
  const toggleLang = () => setLang(l => (l === 'es' ? 'en' : 'es'));
  return (
    <LangContext.Provider value={{ t, lang, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
