import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PAPEL_LABEL } from '../utils/format.js';

export default function Navbar() {
  const { usuario, isAgente, logout } = useAuth();
  const navigate = useNavigate();

  if (!usuario) return null;

  return (
    <header className="navbar">
      <Link to="/pedidos" className="brand">
        <img src="/logo.svg" alt="" width="28" height="28" /> DriveNow
      </Link>
      <nav>
        <Link to="/pedidos">Pedidos</Link>
        <Link to="/clientes">{isAgente ? 'Clientes' : 'Meu cadastro'}</Link>
      </nav>
      <div className="user">
        <span>
          {usuario.nome} · <small>{PAPEL_LABEL[usuario.papel]}</small>
        </span>
        <button
          className="btn btn-outline"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}
