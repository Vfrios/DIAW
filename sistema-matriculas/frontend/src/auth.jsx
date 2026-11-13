import { createContext, useContext, useEffect, useState } from 'react';
import { api, setCredentials, clearCredentials, hasCredentials } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(hasCredentials());

  useEffect(() => {
    if (!hasCredentials()) return;
    api.get('/auth/me').then(setUser).catch(() => clearCredentials()).finally(() => setLoading(false));
  }, []);

  async function login(login, senha) {
    setCredentials(login, senha);
    try {
      const u = await api.get('/auth/me');
      setUser(u);
      return u;
    } catch (e) {
      clearCredentials();
      throw e;
    }
  }
  function logout() {
    clearCredentials();
    setUser(null);
  }
  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}
