/**
 * HOOK: useAuth
 * Hook personalizado para manejo de autenticación
 */

"use client";

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false
  });

  // Función de logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false
    });
  }, []);

  // Cargar usuario desde localStorage al inicializar
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        console.log('Initializing auth - token:', token ? token.substring(0, 20) + '...' : 'No token');
        console.log('Initializing auth - user:', userStr ? JSON.parse(userStr) : 'No user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          setAuthState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true
          });
          console.log('Auth state set to authenticated');
        } else {
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false
          });
          console.log('Auth state set to unauthenticated');
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        logout();
      }
    };

    initAuth();

    // Escuchar cambios en localStorage (para sincronizar entre pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        initAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [logout]);

  // Función de login
  const login = useCallback((user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setAuthState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true
    });
  }, []);

  // Verificar si el token es válido
  const verifyToken = useCallback(async () => {
    const { token } = authState;
    
    if (!token) return false;

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
      return false;
    }
  }, [authState.token, logout]);

  return {
    ...authState,
    login,
    logout,
    verifyToken
  };
};