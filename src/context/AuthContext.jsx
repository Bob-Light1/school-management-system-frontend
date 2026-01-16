import { createContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/env';

export const AuthContext = createContext(undefined);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login function with API call
  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/campus/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { token, user: userData } = data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setUser(userData);

      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  // Verify token validity (optional but recommended)
  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      // Optional: Call API to verify token
      // const response = await fetch('http://localhost:5000/api/auth/verify', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // return response.ok;

      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
          // Optional: verify token is still valid
          const isValid = await verifyToken();
          
          if (isValid) {
            setUser(JSON.parse(savedUser));
          } else {
            // Token expired or invalid
            logout();
          }
        }
      } catch (error) {
        console.error('❌ Auth init error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);


  const updateUser = (newData) => {
    setUser(prev => {
      const updatedUser = { ...prev, ...newData };

      // On met à jour le localStorage pour que les changements persistent après un rafraîchissement (F5)
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;