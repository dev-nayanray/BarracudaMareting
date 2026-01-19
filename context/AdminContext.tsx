'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import adminAPI from '@/lib/admin-api';

const AdminContext = createContext(null);

/**
 * Admin Provider Component
 * Manages admin authentication state
 */
export function AdminProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Check if user is authenticated on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = adminAPI.getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await adminAPI.getProfile();
        if (response.success) {
          setUser(response.data);
        } else {
          adminAPI.logout();
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        adminAPI.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      const response = await adminAPI.login(email, password);
      
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register new admin
   */
  const register = useCallback(async (email, password, name) => {
    setError(null);
    setLoading(true);

    try {
      const response = await adminAPI.register(email, password, name);
      
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    adminAPI.logout();
    setUser(null);
    setError(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

/**
 * Custom hook to use admin context
 */
export function useAdmin() {
  const context = useContext(AdminContext);
  
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }

  return context;
}

export default AdminContext;

