import React, { createContext, useEffect, useState, useContext } from 'react';
import { storage } from '../services/storage';

const LANG_KEY = 'appLanguage';

const translations = {
  es: {
    appName: 'Wani Connect',
    welcome: '¡Bienvenido!',
    signOut: 'Cerrar sesión',
    login: 'Iniciar sesión',
    loginSubtitle: 'Inicia sesión para continuar',
    register: 'Crear cuenta',
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
    twoFactorTitle: 'Verificación en dos pasos',
    twoFactorSubtitle: 'Ingresá el código de 6 dígitos de tu app de autenticación.',
    twoFactorAppHint: 'El código se renueva cada 30 segundos.',
    twoFactorCode: 'Código de verificación',
    twoFactorVerify: 'Verificar',
    twoFactorError: 'Ingresá el código de 6 dígitos.',
    twoFactorInvalid: 'El código es incorrecto o expiró.',
    twoFactorBack: 'Volver a iniciar sesión',
    locationUnavailableTitle: 'Mapa no disponible',
    locationUnavailableMessage:
      'La versión instalada de la app no incluye el módulo de ubicación. Instala el dev build actualizado e inténtalo de nuevo.',
    tabExplore: 'Explorar',
    tabEvents: 'Eventos',
    tabCommunity: 'Comunidad',
    tabProfile: 'Perfil',
    // Profile
    profileTitle: 'Mi Perfil',
    sectionAccount: 'Cuenta',
    sectionPreferences: 'Preferencias',
    sectionSupport: 'Soporte',
    themeSection: 'Apariencia',
    languageLabel: 'Idioma',
    languageSpanish: 'Español',
    languageEnglish: 'Inglés',
    themeLabel: 'Tema',
    themeDark: 'Oscuro',
    themeLight: 'Claro',
    myPhotos: 'Mis fotos',
    myPhotosSub: 'Fotos subidas, visibilidad y borrado',
    editProfile: 'Editar perfil',
    editProfileSub: 'Datos personales y foto',
    notifications: 'Notificaciones',
    notificationsSub: 'Likes y comentarios en tus fotos',
    security: 'Seguridad y acceso',
    securitySub: 'Contraseña, sesiones y 2FA',
    privacy: 'Privacidad',
    privacySub: 'Visibilidad, bloqueos y datos',
    helpSupport: 'Ayuda y Soporte',
    helpSupportSub: 'Centro de ayuda, términos y cuenta',
    // Community
    communityEmpty: 'Aún no hay fotos en la comunidad',
    communityLike: 'Me gusta',
    communityComment: 'Comentar',
    communityWriteComment: 'Escribe un comentario...',
    communitySend: 'Enviar',
    communitySave: 'Guardar',
    communityEdit: 'Editar',
    communityDelete: 'Eliminar',
    communityEdited: 'editado',
    communityFirst: 'Sé el primero en comentar',
    communityDeleteTitle: 'Eliminar comentario',
    communityDeleteMsg: '¿Seguro que deseas eliminar este comentario?',
    communityCancel: 'Cancelar',
    communityErrorLoad: 'No se pudo cargar la comunidad',
    communityErrorLike: 'No se pudo registrar el like',
    communityErrorPost: 'No se pudo publicar el comentario',
    communityErrorEdit: 'No se pudo editar el comentario',
    communityErrorDelete: 'No se pudo eliminar el comentario',
  },
  en: {
    appName: 'Wani Connect',
    welcome: 'Welcome!',
    signOut: 'Sign out',
    login: 'Welcome back',
    loginSubtitle: 'Sign in to continue',
    register: 'Create account',
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
    twoFactorTitle: 'Two-step verification',
    twoFactorSubtitle: 'Enter the 6-digit code from your authenticator app.',
    twoFactorAppHint: 'The code refreshes every 30 seconds.',
    twoFactorCode: 'Verification code',
    twoFactorVerify: 'Verify',
    twoFactorError: 'Enter the 6-digit code.',
    twoFactorInvalid: 'The code is incorrect or expired.',
    twoFactorBack: 'Back to login',
    locationUnavailableTitle: 'Map unavailable',
    locationUnavailableMessage:
      'The installed app version does not include the location module. Install the updated dev build and try again.',
    tabExplore: 'Explore',
    tabEvents: 'Events',
    tabCommunity: 'Community',
    tabProfile: 'Profile',
    // Profile
    profileTitle: 'My Profile',
    sectionAccount: 'Account',
    sectionPreferences: 'Preferences',
    sectionSupport: 'Support',
    themeSection: 'Appearance',
    languageLabel: 'Language',
    languageSpanish: 'Spanish',
    languageEnglish: 'English',
    themeLabel: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    myPhotos: 'My photos',
    myPhotosSub: 'Uploaded photos, visibility and deletion',
    editProfile: 'Edit profile',
    editProfileSub: 'Personal data and photo',
    notifications: 'Notifications',
    notificationsSub: 'Likes and comments on your photos',
    security: 'Security & access',
    securitySub: 'Password, sessions and 2FA',
    privacy: 'Privacy',
    privacySub: 'Visibility, blocks and data',
    helpSupport: 'Help & Support',
    helpSupportSub: 'Help center, terms and account',
    // Community
    communityEmpty: 'No photos in the community yet',
    communityLike: 'Like',
    communityComment: 'Comment',
    communityWriteComment: 'Write a comment...',
    communitySend: 'Send',
    communitySave: 'Save',
    communityEdit: 'Edit',
    communityDelete: 'Delete',
    communityEdited: 'edited',
    communityFirst: 'Be the first to comment',
    communityDeleteTitle: 'Delete comment',
    communityDeleteMsg: 'Are you sure you want to delete this comment?',
    communityCancel: 'Cancel',
    communityErrorLoad: 'Could not load the community',
    communityErrorLike: 'Could not register the like',
    communityErrorPost: 'Could not post the comment',
    communityErrorEdit: 'Could not edit the comment',
    communityErrorDelete: 'Could not delete the comment',
  },
};

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('es');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await storage.get('appLanguage');
        if (stored === 'es' || stored === 'en') setLangState(stored);
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const t = translations[lang];

  const setLang = async (l) => {
    setLangState(l);
    try {
      await storage.set(LANG_KEY, l);
    } catch {}
  };

  const toggleLang = async () => setLang(lang === 'es' ? 'en' : 'es');

  return (
    <LangContext.Provider value={{ t, lang, setLang, toggleLang, loaded }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
