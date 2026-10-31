import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { pedidosApi } from '../services/api.js';
import { formatData } from '../utils/format.js';

export default function Pedidos() {
  const { isAgente, usuario } = useAuth();
  const [lista, setLista] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    pedidosApi.listar().then(setLista).catch((e) => setErro(e.message));
  }, []);

  return (
    <div className="card">
      <div className="titulo">
        <h1>{isAgente ? 'Pedidos de aluguel' : 'Meus pedidos'}</h1>
        {!isAgente && <Link className="btn" to="/pedidos/novo">+ Novo pedido</Link>}
      </div>
      {!isAgente && !usuario.clienteId && (
        <p className="aviso">Você ainda não completou seu cadastro de cliente. <Link to="/clientes">Completar agora</Link></p>
      )}
      {erro && <p className="erro">{erro}</p>}
      <table>
        <thead>
          <tr><th>#</th>{isAgente && <th>Cliente</th>}<th>Automóvel</th><th>Período</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {lista.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              {isAgente && <td>{p.cliente.nome}</td>}
              <td>{p.automovel.marca} {p.automovel.modelo} ({p.automovel.placa})</td>
              <td>{formatData(p.dataInicio)} a {formatData(p.dataFim)}</td>
              <td><StatusBadge status={p.status} /></td>
              <td><Link to={`/pedidos/${p.id}`}>Detalhes</Link></td>
            </tr>
          ))}
          {lista.length === 0 && <tr><td colSpan="6">Nenhum pedido encontrado.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
