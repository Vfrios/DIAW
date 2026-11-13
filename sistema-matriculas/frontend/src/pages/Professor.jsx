import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Professor() {
  const [disc, setDisc] = useState([]);
  const [sel, setSel] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => { api.get('/professor/disciplinas').then(setDisc).catch((e) => setErro(e.message)); }, []);

  async function abrir(d) {
    setSel(d); setErro('');
    try { setAlunos(await api.get(`/disciplinas/${d.id}/alunos`)); } catch (e) { setErro(e.message); }
  }

  return (
    <>
      {erro && <p className="msg erro" role="alert">{erro}</p>}
      <section className="painel">
        <h2>Minhas disciplinas</h2>
        {disc.length === 0 ? <p className="vazio">Você não possui disciplinas atribuídas.</p> : (
          <div className="rolar"><table>
            <thead><tr><th>Semestre</th><th>Código</th><th>Disciplina</th><th>Situação</th><th>Alunos</th><th></th></tr></thead>
            <tbody>{disc.map((d) => (
              <tr key={d.id} className={sel?.id === d.id ? 'sel' : ''}>
                <td>{d.semestre}</td><td>{d.codigo}</td><td>{d.nome}</td><td>{d.status}</td><td>{d.inscritos}</td>
                <td className="acoes"><button className="sec" onClick={() => abrir(d)}>Ver alunos</button></td>
              </tr>))}</tbody>
          </table></div>
        )}
      </section>
      {sel && (
        <section className="painel">
          <h2>Alunos de {sel.codigo} — {sel.nome}</h2>
          {alunos.length === 0 ? <p className="vazio">Nenhum aluno matriculado até o momento.</p> : (
            <table>
              <thead><tr><th>Nome</th><th>Login</th><th>Tipo</th></tr></thead>
              <tbody>{alunos.map((a) => (
                <tr key={a.matriculaId}><td>{a.nome}</td><td>{a.login}</td><td>{a.tipo === 'OBRIGATORIA' ? 'Obrigatória' : 'Optativa'}</td></tr>))}</tbody>
            </table>
          )}
        </section>
      )}
    </>
  );
}
