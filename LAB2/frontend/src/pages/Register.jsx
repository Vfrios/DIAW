import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { usuario, registrar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', login: '', senha: '', papel: 'CLIENTE' });
  const [erro, setErro] = useState('');

  if (usuario) return <Navigate to="/pedidos" replace />;

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      await registrar(form);
      navigate(form.papel === 'CLIENTE' ? '/clientes' : '/pedidos');
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <div className="card auth-card">
      <h1>Criar conta</h1>
      <form onSubmit={enviar}>
        <label>Nome<input value={form.nome} onChange={set('nome')} required /></label>
        <label>Usuário (login)<input value={form.login} onChange={set('login')} minLength={3} required /></label>
        <label>Senha (mín. 6 caracteres)<input type="password" value={form.senha} onChange={set('senha')} minLength={6} required /></label>
        <label>Tipo de conta
          <select value={form.papel} onChange={set('papel')}>
            <option value="CLIENTE">Cliente (usuário individual)</option>
            <option value="EMPRESA">Agente - Empresa</option>
            <option value="BANCO">Agente - Banco</option>
          </select>
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button className="btn">Cadastrar</button>
      </form>
      <p>Já possui conta? <Link to="/login">Entrar</Link></p>
    </div>
  );
}
