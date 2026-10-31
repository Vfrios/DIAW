import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pedidosApi } from '../services/api.js';

const VAZIO = {
  dataInicio: '', dataFim: '',
  matricula: '', ano: new Date().getFullYear(), marca: '', modelo: '', placa: '', proprietario: 'EMPRESA',
};

/** Cria (cliente) ou modifica (cliente/agente) um pedido de aluguel. */
export default function PedidoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;
    pedidosApi.buscar(id)
      .then((p) => setForm({ dataInicio: p.dataInicio, dataFim: p.dataFim, ...p.automovel }))
      .catch((e) => setErro(e.message));
  }, [id]);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setErro('');
    const dados = {
      dataInicio: form.dataInicio,
      dataFim: form.dataFim,
      automovel: {
        matricula: form.matricula, ano: Number(form.ano), marca: form.marca,
        modelo: form.modelo, placa: form.placa, proprietario: form.proprietario,
      },
    };
    try {
      const salvo = id ? await pedidosApi.atualizar(id, dados) : await pedidosApi.criar(dados);
      navigate(`/pedidos/${salvo.id}`);
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <div className="card">
      <h1>{id ? `Modificar pedido #${id}` : 'Novo pedido de aluguel'}</h1>
      <form onSubmit={enviar}>
        <h3>Período</h3>
        <div className="grid">
          <label>Data de início<input type="date" value={form.dataInicio} onChange={set('dataInicio')} required /></label>
          <label>Data final<input type="date" value={form.dataFim} onChange={set('dataFim')} required /></label>
        </div>
        <h3>Automóvel</h3>
        <div className="grid">
          <label>Marca<input value={form.marca} onChange={set('marca')} required /></label>
          <label>Modelo<input value={form.modelo} onChange={set('modelo')} required /></label>
          <label>Ano<input type="number" min="1950" max="2100" value={form.ano} onChange={set('ano')} required /></label>
          <label>Placa<input value={form.placa} onChange={set('placa')} maxLength={10} required /></label>
          <label>Matrícula<input value={form.matricula} onChange={set('matricula')} required /></label>
          <label>Propriedade do automóvel
            <select value={form.proprietario} onChange={set('proprietario')}>
              <option value="CLIENTE">Cliente</option>
              <option value="EMPRESA">Empresa</option>
              <option value="BANCO">Banco</option>
            </select>
          </label>
        </div>
        {erro && <p className="erro">{erro}</p>}
        <div className="acoes">
          <button className="btn">{id ? 'Salvar' : 'Enviar pedido'}</button>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Voltar</button>
        </div>
      </form>
    </div>
  );
}
