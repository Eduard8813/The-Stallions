import axios from 'axios';
import Constants from 'expo-constants';
import { getAuthToken } from './token';
import { EVENTS, events } from './events';

let cachedToken = null;

// Mantiene el token en memoria para uso síncrono (p. ej. firmar URL de imágenes).
export const refreshCachedToken = async () => {
  cachedToken = await getAuthToken();
  return cachedToken;
};
refreshCachedToken();

export const getCachedToken = () => cachedToken;

const getApiBase = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) return `http://${host}:8080`;
  }
  return 'http://localhost:8080';
};

const api = axios.create({
  baseURL: getApiBase() + '/api',
  timeout: 10000,
});

// Convierte una URL de recurso (posiblemente relativa, p. ej. "/api/fotos/3/imagen")
// devuelta por el backend en una URL absoluta que <Image> pueda cargar.
// Para las imágenes de fotos añade el token en query para que las fotos privadas
// propias puedan servirse (React Native <Image> no envía el header Authorization).
export const resolveResourceUrl = (url) => {
  if (!url) return url;
  const base = getApiBase();
  const isAbsolute = /^https?:\/\//i.test(url);
  const abs = isAbsolute ? url : url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
  if (/\/api\/fotos\/[^/?#]+\/imagen/.test(abs)) {
    const token = getCachedToken();
    if (token) {
      const sep = abs.includes('?') ? '&' : '?';
      return `${abs}${sep}token=${encodeURIComponent(token)}`;
    }
  }
  return abs;
};

// Inyecta el Bearer token en cada request de forma centralizada.
api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si una petición autenticada devuelve 401 (token expirado/inválido),
// se notifica el fin de sesión para que la app redirija a login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url ?? '';
    const hasAuth = !!error?.config?.headers?.Authorization;
    if (status === 401 && hasAuth && !url.startsWith('/auth/')) {
      events.emit(EVENTS.sessionExpired);
    }
    return Promise.reject(error);
  }
);

export default api;
