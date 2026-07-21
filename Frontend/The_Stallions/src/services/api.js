import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const getToken = async () => {
  if (Platform.OS === 'web') return localStorage.getItem('authToken');
  return SecureStore.getItemAsync('authToken');
};

const api = axios.create({
  baseURL: (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080') + '/api',
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
