import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { clientesApi } from '../services/api.js';
import { formatCpf, formatMoeda } from '../utils/format.js';

export default function Clientes() {
  const { isAgente } = useAuth();
  return isAgente ? <ListaClientes /> : <MeuCadastro />;
}

/** Visao do agente: consulta de todos os clientes. */
function ListaClientes() {
  const [lista, setLista] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    clientesApi.listar().then(setLista).catch((e) => setErro(e.message));
  }, []);

  return (
    <div className="card">
      <h1>Clientes</h1>
      {erro && <p className="erro">{erro}</p>}
      <table>
        <thead>
          <tr><th>Nome</th><th>CPF</th><th>RG</th><th>Profissão</th><th>Rendimentos</th></tr>
        </thead>
        <tbody>
          {lista.map((c) => (
            <tr key={c.id}>
              <td>{c.nome}</td>
              <td>{formatCpf(c.cpf)}</td>
              <td>{c.rg}</td>
              <td>{c.profissao}</td>
              <td>{c.rendimentos.map((r) => `${r.entidadeEmpregadora}: ${formatMoeda(r.valor)}`).join(' | ') || '-'}</td>
            </tr>
          ))}
          {lista.length === 0 && <tr><td colSpan="5">Nenhum cliente cadastrado.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

const VAZIO = { rg: '', cpf: '', nome: '', endereco: '', profissao: '', rendimentos: [] };

/** Visao do cliente: CRUD do proprio cadastro (criar, consultar, alterar, excluir). */
function MeuCadastro() {
  const { atualizar, usuario } = useAuth();
  const [cliente, setCliente] = useState(null);
  const [form, setForm] = useState({ ...VAZIO, nome: usuario?.nome || '' });
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    clientesApi.listar()
      .then((lista) => {
        if (lista.length > 0) {
          setCliente(lista[0]);
          setForm({ ...lista[0] });
        }
      })
      .catch((e) => setErro(e.message));
  }, []);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const setRend = (i, campo, valor) => {
    const rendimentos = form.rendimentos.map((r, idx) => (idx === i ? { ...r, [campo]: valor } : r));
    setForm({ ...form, rendimentos });
  };

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    setMsg('');
    const dados = {
      rg: form.rg, cpf: form.cpf, nome: form.nome, endereco: form.endereco, profissao: form.profissao,
      rendimentos: form.rendimentos.map((r) => ({ entidadeEmpregadora: r.entidadeEmpregadora, valor: Number(r.valor) })),
    };
    try {
      const salvo = cliente ? await clientesApi.atualizar(cliente.id, dados) : await clientesApi.criar(dados);
      setCliente(salvo);
      setForm({ ...salvo });
      await atualizar();
      setMsg(cliente ? 'Cadastro atualizado.' : 'Cadastro criado. Agora você já pode criar pedidos de aluguel.');
    } catch (err) {
      setErro(err.message);
    }
  };

  const excluir = async () => {
    if (!window.confirm('Excluir seu cadastro de cliente?')) return;
    setErro('');
    try {
      await clientesApi.excluir(cliente.id);
      setCliente(null);
      setForm({ ...VAZIO, nome: usuario?.nome || '' });
      await atualizar();
      setMsg('Cadastro excluído.');
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <div className="card">
      <h1>{cliente ? 'Meu cadastro' : 'Complete seu cadastro de cliente'}</h1>
      <form onSubmit={salvar}>
        <div className="grid">
          <label>Nome<input value={form.nome} onChange={set('nome')} required /></label>
          <label>CPF<input value={form.cpf} onChange={set('cpf')} placeholder="000.000.000-00" required /></label>
          <label>RG<input value={form.rg} onChange={set('rg')} required /></label>
          <label>Profissão<input value={form.profissao} onChange={set('profissao')} required /></label>
        </div>
        <label>Endereço<input value={form.endereco} onChange={set('endereco')} required /></label>

        <h3>Rendimentos (máximo 3)</h3>
        {form.rendimentos.map((r, i) => (
          <div className="grid rend" key={i}>
            <label>Entidade empregadora
              <input value={r.entidadeEmpregadora} onChange={(e) => setRend(i, 'entidadeEmpregadora', e.target.value)} required />
            </label>
            <label>Rendimento (R$)
              <input type="number" min="0" step="0.01" value={r.valor} onChange={(e) => setRend(i, 'valor', e.target.value)} required />
            </label>
            <button type="button" className="btn btn-outline" onClick={() => setForm({ ...form, rendimentos: form.rendimentos.filter((_, idx) => idx !== i) })}>
              Remover
            </button>
          </div>
        ))}
        {form.rendimentos.length < 3 && (
          <button type="button" className="btn btn-outline" onClick={() => setForm({ ...form, rendimentos: [...form.rendimentos, { entidadeEmpregadora: '', valor: '' }] })}>
            + Adicionar rendimento
          </button>
        )}

        {erro && <p className="erro">{erro}</p>}
        {msg && <p className="ok">{msg}</p>}
        <div className="acoes">
          <button className="btn">{cliente ? 'Salvar alterações' : 'Criar cadastro'}</button>
          {cliente && <button type="button" className="btn btn-danger" onClick={excluir}>Excluir cadastro</button>}
        </div>
      </form>
    </div>
  );
}
