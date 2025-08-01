import axios from 'axios';
import { supabase } from '../config/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[API] Session check:', { 
            hasSession: !!session, 
            hasAccessToken: !!session?.access_token,
            tokenLength: session?.access_token?.length,
            tokenPreview: session?.access_token?.substring(0, 20) + '...'
        });
        
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
            console.log('[API] Added authorization header:', config.headers.Authorization.substring(0, 30) + '...');
        } else {
            console.log('[API] No access token available');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await supabase.auth.signOut();
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Chat API
export const chatAPI = {
  sendMessage: async (message, context = 'general', additionalParams = {}) => {
    const response = await api.post('/api/chat/message', {
      message,
      context,
      additionalParams,
    });
    return response.data;
  },

  sendConversation: async (messages, context = 'general', additionalParams = {}) => {
    const response = await api.post('/api/chat/conversation', {
      messages,
      context,
      additionalParams,
    });
    return response.data;
  },

  getContexts: async () => {
    const response = await api.get('/api/chat/contexts');
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  create: async (projectData) => {
    const response = await api.post('/api/projects', projectData);
    return response.data;
  },

  getAll: async (page = 1, limit = 10) => {
    const response = await api.get(`/api/projects?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/projects/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/projects/${id}`);
    return response.data;
  },

  search: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/projects/search?${queryString}`);
    return response.data;
  },
};

export default api;

// Named export for compatibility
export { api };
