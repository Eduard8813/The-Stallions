import api from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, fullName) => api.post('/auth/register', { email, password, fullName }),
  googleAuth: (idToken) => api.post('/auth/google', { idToken }),
  verify2fa: (challengeId, code) => api.post('/auth/2fa/verify', { challengeId, code }),
  resend2fa: (challengeId) => api.post('/auth/2fa/resend', { challengeId }),
};