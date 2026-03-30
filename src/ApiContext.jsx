import { createContext, useContext, useMemo } from 'react';

const ApiContext = createContext(null);

export function ApiProvider({ children }) {
  const baseURL = import.meta.env.VITE_API_URL;

  const api = useMemo(() => {
    const request = async (endpoint, options = {}) => {
      const { treat404AsEmpty = false, ...fetchOptions } = options;
      const url = `${baseURL}${endpoint}`;

      const headers = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      };

      const config = {
        ...fetchOptions,
        headers,
      };

      try {
        const response = await fetch(url, config);

        if (!response.ok) {
          if (treat404AsEmpty && response.status === 404) {
            return [];
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
        return null;
      } catch (error) {
        console.error('API Request Error:', error);
        throw error;
      }
    };

    return {
      get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
      post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
      put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
      delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
    };
  }, [baseURL]);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi debe ser usado dentro de un ApiProvider');
  }
  return context;
};