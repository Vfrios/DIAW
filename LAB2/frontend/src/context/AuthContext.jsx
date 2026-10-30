import { createContext, useCallback, useContext, useState } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

function lerUsuario() {
  try {
    return JSON.parse(localStorage.getItem('usuario'));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(lerUsuario);

  const salvar = (resp) => {
    localStorage.setItem('token', resp.token);
    localStorage.setItem('usuario', JSON.stringify(resp.usuario));
    setUsuario(resp.usuario);
  };

  const login = async (login, senha) => salvar(await authApi.login({ login, senha }));
  const registrar = async (dados) => salvar(await authApi.register(dados));

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  const atualizar = useCallback(async () => {
    const u = await authApi.me();
    localStorage.setItem('usuario', JSON.stringify(u));
    setUsuario(u);
  }, []);

  const isAgente = !!usuario && usuario.papel !== 'CLIENTE';

  return (
    <AuthContext.Provider value={{ usuario, isAgente, login, registrar, logout, atualizar }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
