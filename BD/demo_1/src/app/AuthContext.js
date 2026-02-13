import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    role: null
  });

  const login = (username, password, role) => {
    // Authentification simple (en production, ce serait via une API)
    setAuth({
      isAuthenticated: true,
      user: {
        id: `${role}-${Date.now()}`,
        username: username,
        email: `${username}@supermarche.com`,
        role: role
      },
      role: role
    });
    localStorage.setItem('auth', JSON.stringify({
      isAuthenticated: true,
      user: {
        id: `${role}-${Date.now()}`,
        username: username,
        email: `${username}@supermarche.com`,
        role: role
      },
      role: role
    }));
  };

  const logout = () => {
    setAuth({
      isAuthenticated: false,
      user: null,
      role: null
    });
    localStorage.removeItem('auth');
  };

  const restoreAuth = () => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        setAuth(parsedAuth);
      } catch (e) {
        console.error('Erreur restauration authentification', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, restoreAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
