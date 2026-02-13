import React, { createContext, useState } from 'react';

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    role: null,
    token: null
  });

  const login = async (username, password) => {
    try {
      const res = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur de connexion');
      }
      const data = await res.json();
      setAuth({
        isAuthenticated: true,
        user: data.user,
        role: data.user.role,
        token: data.token
      });
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: data.user,
        role: data.user.role,
        token: data.token
      }));
      return { success: true };
    } catch (e) {
      setAuth({ isAuthenticated: false, user: null, role: null, token: null });
      localStorage.removeItem('auth');
      return { success: false, error: e.message };
    }
  };


  const logout = () => {
    setAuth({ isAuthenticated: false, user: null, role: null, token: null });
    localStorage.removeItem('auth');
  };


  const restoreAuth = () => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        setAuth(parsedAuth);
      } catch (e) {
        setAuth({ isAuthenticated: false, user: null, role: null, token: null });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, restoreAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
