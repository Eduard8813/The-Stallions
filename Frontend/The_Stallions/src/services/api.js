import axios from 'axios';
import Constants from 'expo-constants';
import { getAuthToken } from './token';
import { EVENTS, events } from './events';

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
