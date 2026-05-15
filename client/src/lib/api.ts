import axios from 'axios';
import { getIdToken, signOut } from './firebase';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  timeout: 120000, // 2 min — scraping jobs can be slow
});

api.interceptors.request.use(async config => {
  const token = await getIdToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  async err => {
    if (err.response?.status === 401) await signOut();
    if (err.response?.status === 402) window.dispatchEvent(new Event('insufficient-credits'));
    return Promise.reject(err);
  },
);
