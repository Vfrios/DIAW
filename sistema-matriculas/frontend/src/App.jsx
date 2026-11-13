import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Aluno from './pages/Aluno.jsx';
import Professor from './pages/Professor.jsx';
import Secretaria from './pages/Secretaria.jsx';

export const HOME = { ALUNO: '/aluno', PROFESSOR: '/professor', SECRETARIA: '/secretaria' };
const ROTULO = { ALUNO: 'Aluno', PROFESSOR: 'Professor', SECRETARIA: 'Secretaria' };

function Guard({ perfil, children }) {
  const { user, loading, logout } = useAuth();
  if (loading) return <p className="vazio">Carregando…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.perfil !== perfil) return <Navigate to={HOME[user.perfil]} replace />;
  return (
    <>
      <header className="topo">
        <strong>Matrículas</strong>
        <span className="usuario">{user.nome} · {ROTULO[user.perfil]}</span>
        <button className="sec" onClick={logout}>Sair</button>
      </header>
      <main>{children}</main>
    </>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={HOME[user.perfil]} replace /> : <Login />} />
      <Route path="/aluno" element={<Guard perfil="ALUNO"><Aluno /></Guard>} />
      <Route path="/professor" element={<Guard perfil="PROFESSOR"><Professor /></Guard>} />
      <Route path="/secretaria" element={<Guard perfil="SECRETARIA"><Secretaria /></Guard>} />
      <Route path="*" element={<Navigate to={user ? HOME[user.perfil] : '/login'} replace />} />
    </Routes>
  );
}
