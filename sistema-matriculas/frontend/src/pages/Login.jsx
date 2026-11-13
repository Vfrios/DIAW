import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { HOME } from '../App.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ login: '', senha: '' });
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setBusy(true); setErro('');
    try {
      const u = await login(f.login, f.senha);
      nav(HOME[u.perfil], { replace: true });
    } catch (err) {
      setErro(err.status === 401 ? 'Login ou senha inválidos.' : 'Não foi possível conectar ao servidor.');
    } finally { setBusy(false); }
  }

  return (
    <div className="login">
      <form onSubmit={entrar} className="painel">
        <h1>Sistema de Matrículas</h1>
        <p className="mudo">Entre com seu login e senha.</p>
        <label>Login<input value={f.login} onChange={(e) => setF({ ...f, login: e.target.value })} autoFocus required /></label>
        <label>Senha<input type="password" value={f.senha} onChange={(e) => setF({ ...f, senha: e.target.value })} required /></label>
        {erro && <p className="msg erro" role="alert">{erro}</p>}
        <button disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </div>
  );
}
