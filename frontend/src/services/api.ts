import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '../stores/auth.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token to requests
  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();

export const authAPI = {
  signup: (email: string, password: string, name: string) =>
    apiClient.post('/auth/signup', { email, password, name }),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
};

export const sessionAPI = {
  createSession: () => apiClient.post('/sessions', {}),
  getSession: (sessionId: string) => apiClient.get(`/sessions/${sessionId}`),
  getAgentSessions: () => apiClient.get('/sessions/agent'),
  joinSession: (inviteToken: string) => apiClient.post(`/sessions/join/${inviteToken}`, {}),
  startSession: (sessionId: string) => apiClient.post(`/sessions/${sessionId}/start`, {}),
  endSession: (sessionId: string) => apiClient.post(`/sessions/${sessionId}/end`, {}),
};

export const chatAPI = {
  getMessages: (sessionId: string) => apiClient.get(`/chat/${sessionId}`),
  sendMessage: (sessionId: string, content: string) =>
    apiClient.post(`/chat/${sessionId}/messages`, { content }),
  markAsRead: (sessionId: string, messageId: string) =>
    apiClient.post(`/chat/${sessionId}/messages/${messageId}/read`, {}),
  uploadFile: (sessionId: string, file: FormData) =>
    apiClient.post(`/chat/${sessionId}/files`, file),
  getFiles: (sessionId: string) => apiClient.get(`/chat/${sessionId}/files`),
};
