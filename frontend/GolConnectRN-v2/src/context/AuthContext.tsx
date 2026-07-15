import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { auth, obtenerToken, obtenerUsuario } from '../api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: Dispatch<SetStateAction<User | null>>;
  setToken: Dispatch<SetStateAction<string | null>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  setUser: () => {},
  setToken: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
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

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

export default AuthContext;
