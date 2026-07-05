import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, obtenerToken, obtenerUsuario, cerrarSesionLocal } from '../api';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  setUser: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Al arrancar la app, restaurar sesión si hay un token guardado
  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([obtenerToken(), obtenerUsuario()]);
        if (t && u) {
          setToken(t);
          setUser(u);
        }
      } catch (_) {
        // Si falla, arrancamos sin sesión
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = async () => {
    await auth.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
