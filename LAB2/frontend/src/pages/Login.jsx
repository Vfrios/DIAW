import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  if (usuario) return <Navigate to="/pedidos" replace />;

  const enviar = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(form.login, form.senha);
      navigate('/pedidos');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="card auth-card">
      <img src="/logo.svg" alt="DriveNow" width="64" height="64" />
      <h1>Entrar</h1>
      <form onSubmit={enviar}>
        <label>Usuário
          <input value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} required autoFocus />
        </label>
        <label>Senha
          <input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button className="btn" disabled={carregando}>{carregando ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <p>Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
    </div>
  );
}
