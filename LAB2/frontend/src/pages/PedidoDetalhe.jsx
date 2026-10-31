import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { pedidosApi } from '../services/api.js';
import { formatCpf, formatData, formatMoeda } from '../utils/format.js';

export default function PedidoDetalhe() {
  const { id } = useParams();
  const { isAgente, usuario } = useAuth();
  const [p, setP] = useState(null);
  const [erro, setErro] = useState('');
  const [aval, setAval] = useState({ status: 'APROVADO', parecer: '' });
  const [cred, setCred] = useState({ valor: '', taxaJuros: '', prazoMeses: '' });

  const carregar = useCallback(() => {
    pedidosApi.buscar(id).then((d) => { setP(d); setErro(''); }).catch((e) => setErro(e.message));
  }, [id]);

  useEffect(carregar, [carregar]);

  const executar = async (acao) => {
    setErro('');
    try {
      setP(await acao());
    } catch (e) {
      setErro(e.message);
    }
  };

  if (!p) return <div className="card">{erro ? <p className="erro">{erro}</p> : 'Carregando...'}</div>;

  const cliente = !isAgente;
  const podeModificar = cliente ? p.status === 'EM_ANALISE' : ['EM_ANALISE', 'APROVADO'].includes(p.status);
  const podeCancelar = cliente && ['EM_ANALISE', 'APROVADO'].includes(p.status);

  return (
    <div className="card">
      <div className="titulo">
        <h1>Pedido #{p.id}</h1>
        <StatusBadge status={p.status} />
      </div>
      {erro && <p className="erro">{erro}</p>}

      <div className="grid">
        <div>
          <h3>Período</h3>
          <p>{formatData(p.dataInicio)} a {formatData(p.dataFim)}</p>
          <small>Criado em {formatData(p.criadoEm)}</small>
        </div>
        <div>
          <h3>Cliente</h3>
          <p>{p.cliente.nome}<br /><small>CPF {formatCpf(p.cliente.cpf)}</small></p>
        </div>
        <div>
          <h3>Automóvel</h3>
          <p>
            {p.automovel.marca} {p.automovel.modelo} ({p.automovel.ano})<br />
            <small>Placa {p.automovel.placa} · Matrícula {p.automovel.matricula} · Propriedade: {p.automovel.proprietario}</small>
          </p>
        </div>
      </div>

      {p.parecer && (
        <div className="destaque">
          <strong>Parecer financeiro:</strong> {p.parecer}
        </div>
      )}

      {p.credito && (
        <div className="destaque">
          <strong>Contrato de crédito ({p.credito.banco}):</strong> {formatMoeda(p.credito.valor)} ·
          juros {p.credito.taxaJuros}% a.m. · {p.credito.prazoMeses} meses
        </div>
      )}

      <div className="acoes">
        {podeModificar && <Link className="btn" to={`/pedidos/${p.id}/editar`}>Modificar</Link>}
        {podeCancelar && (
          <button className="btn btn-danger" onClick={() => window.confirm('Cancelar este pedido?') && executar(() => pedidosApi.cancelar(p.id))}>
            Cancelar pedido
          </button>
        )}
        {isAgente && p.status === 'APROVADO' && (
          <button className="btn" onClick={() => executar(() => pedidosApi.contratar(p.id))}>Executar contrato</button>
        )}
        <Link className="btn btn-outline" to="/pedidos">Voltar</Link>
      </div>

      {isAgente && p.status === 'EM_ANALISE' && (
        <form
          className="subform"
          onSubmit={(e) => { e.preventDefault(); executar(() => pedidosApi.avaliar(p.id, aval)); }}
        >
          <h3>Avaliação financeira</h3>
          <label>Resultado
            <select value={aval.status} onChange={(e) => setAval({ ...aval, status: e.target.value })}>
              <option value="APROVADO">Parecer positivo (aprovar)</option>
              <option value="REJEITADO">Parecer negativo (rejeitar)</option>
            </select>
          </label>
          <label>Parecer
            <textarea rows="3" value={aval.parecer} onChange={(e) => setAval({ ...aval, parecer: e.target.value })} required />
          </label>
          <button className="btn">Registrar avaliação</button>
        </form>
      )}

      {usuario.papel === 'BANCO' && !['CANCELADO', 'REJEITADO'].includes(p.status) && (
        <form
          className="subform"
          onSubmit={(e) => {
            e.preventDefault();
            executar(() => pedidosApi.credito(p.id, {
              valor: Number(cred.valor), taxaJuros: Number(cred.taxaJuros), prazoMeses: Number(cred.prazoMeses),
            }));
          }}
        >
          <h3>{p.credito ? 'Atualizar contrato de crédito' : 'Conceder contrato de crédito'}</h3>
          <div className="grid">
            <label>Valor (R$)<input type="number" min="0.01" step="0.01" value={cred.valor} onChange={(e) => setCred({ ...cred, valor: e.target.value })} required /></label>
            <label>Juros (% a.m.)<input type="number" min="0" step="0.01" value={cred.taxaJuros} onChange={(e) => setCred({ ...cred, taxaJuros: e.target.value })} required /></label>
            <label>Prazo (meses)<input type="number" min="1" value={cred.prazoMeses} onChange={(e) => setCred({ ...cred, prazoMeses: e.target.value })} required /></label>
          </div>
          <button className="btn">Salvar crédito</button>
        </form>
      )}
    </div>
  );
}
