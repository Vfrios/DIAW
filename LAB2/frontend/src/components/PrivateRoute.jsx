import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/** Bloqueia o acesso a usuarios nao autenticados (login obrigatorio). */
export default function PrivateRoute({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" replace />;
}
