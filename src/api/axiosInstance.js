import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Supporte les cookies httpOnly pour refresh token (recommandé)
  timeout: 15000,        // Évite les requêtes qui pendent trop longtemps
});

let isRefreshing = false;
let failedQueue = [];

// Fonction utilitaire pour gérer la file d'attente
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// Permet d'injecter / supprimer le token manuellement (après login, logout, etc.)
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Intercepteur de requêtes : ajoute le token si présent (fallback localStorage)
api.interceptors.request.use(
  (config) => {
    // Si le token n'est pas déjà dans les headers (par ex. après refresh)
    if (!config.headers.Authorization) {
      const token = localStorage.getItem('token'); // ou sessionStorage, ou ton store
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponses : gestion refresh + queue
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Cas 401 non déjà traité
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Déjà en train de refresh → on met en attente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Premier 401 → on lance le refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Appel au refresh (adapte l'URL si différente)
        const { data } = await api.post('/auth/refresh', {}, { withCredentials: true });

        const newAccessToken = data.accessToken;
        // Optionnel : data.refreshToken si ton backend en renvoie un nouveau

        setAuthToken(newAccessToken);
        localStorage.setItem('token', newAccessToken); // ou ton store

        // Résout toutes les requêtes en attente avec le nouveau token
        processQueue(null, newAccessToken);

        // Relance la requête originale
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh a échoué → logout forcé
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        window.location.href = '/login?session_expired=true'; // Peut-être avec un param pour afficher un message
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Autres erreurs → on les laisse passer
    return Promise.reject(error);
  }
);

export default api;