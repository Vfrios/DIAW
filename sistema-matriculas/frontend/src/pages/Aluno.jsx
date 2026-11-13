import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

const brl = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Aluno() {
  const [periodo, setPeriodo] = useState(null);
  const [disc, setDisc] = useState([]);
  const [mats, setMats] = useState([]);
  const [cob, setCob] = useState([]);
  const [msg, setMsg] = useState(null);

  const carregar = useCallback(async () => {
    const p = await api.get('/periodos/aberto');
    setPeriodo(p);
    setDisc(p ? await api.get('/disciplinas?semestre=' + encodeURIComponent(p.semestre)) : []);
    setMats(await api.get('/matriculas'));
    setCob(await api.get('/cobrancas/minhas'));
  }, []);

  useEffect(() => { carregar().catch((e) => setMsg({ erro: e.message })); }, [carregar]);

  async function agir(fn, ok) {
    try { await fn(); setMsg({ ok }); await carregar(); } catch (e) { setMsg({ erro: e.message }); }
  }

  const doSemestre = mats.filter((m) => !periodo || m.semestre === periodo.semestre);
  const obr = doSemestre.filter((m) => m.tipo === 'OBRIGATORIA').length;
  const opt = doSemestre.filter((m) => m.tipo === 'OPTATIVA').length;
  const matriculadas = new Set(mats.map((m) => m.disciplinaId));

  return (
    <>
      {msg && <p className={'msg ' + (msg.erro ? 'erro' : 'ok')} role="status">{msg.erro || msg.ok}</p>}

      <section className="painel">
        {periodo ? (
          <p><strong>Matrículas abertas para {periodo.semestre}</strong> — de {periodo.inicio} até {periodo.fim}.
            {' '}Obrigatórias: <b>{obr}/4</b> · Optativas: <b>{opt}/2</b></p>
        ) : <p className="vazio">Não há período de matrículas aberto. Você pode consultar suas matrículas abaixo.</p>}
      </section>

      {periodo && (
        <section className="painel">
          <h2>Disciplinas do semestre</h2>
          <div className="rolar"><table>
            <thead><tr><th>Código</th><th>Disciplina</th><th>Créd.</th><th>Professor</th><th>Vagas</th><th></th></tr></thead>
            <tbody>{disc.filter((d) => d.status === 'ABERTA').map((d) => {
              const lotada = d.inscritos >= d.maxAlunos;
              return (
                <tr key={d.id}>
                  <td>{d.codigo}</td><td>{d.nome}</td><td>{d.creditos}</td><td>{d.professorNome}</td>
                  <td>{d.inscritos}/{d.maxAlunos}</td>
                  <td className="acoes">{matriculadas.has(d.id) ? <span className="tag">Matriculado</span> : lotada ? <span className="tag aviso">Lotada</span> : (<>
                    <button onClick={() => agir(() => api.post('/matriculas', { disciplinaId: d.id, tipo: 'OBRIGATORIA' }), 'Matrícula realizada.')}>Obrigatória</button>
                    <button className="sec" onClick={() => agir(() => api.post('/matriculas', { disciplinaId: d.id, tipo: 'OPTATIVA' }), 'Matrícula realizada.')}>Optativa</button>
                  </>)}</td>
                </tr>);
            })}</tbody>
          </table></div>
        </section>
      )}

      <section className="painel">
        <h2>Minhas matrículas</h2>
        {mats.length === 0 ? <p className="vazio">Você ainda não se matriculou em nenhuma disciplina.</p> : (
          <div className="rolar"><table>
            <thead><tr><th>Semestre</th><th>Código</th><th>Disciplina</th><th>Créd.</th><th>Tipo</th><th></th></tr></thead>
            <tbody>{mats.map((m) => (
              <tr key={m.id}>
                <td>{m.semestre}</td><td>{m.codigo}</td><td>{m.disciplinaNome}</td><td>{m.creditos}</td>
                <td>{m.tipo === 'OBRIGATORIA' ? 'Obrigatória' : 'Optativa'}</td>
                <td className="acoes">{periodo && m.semestre === periodo.semestre &&
                  <button className="perigo" onClick={() => agir(() => api.del('/matriculas/' + m.id), 'Matrícula cancelada.')}>Cancelar</button>}</td>
              </tr>))}</tbody>
          </table></div>
        )}
      </section>

      <section className="painel">
        <h2>Cobranças</h2>
        {cob.length === 0 ? <p className="vazio">Nenhuma cobrança gerada.</p> : (
          <table>
            <thead><tr><th>Semestre</th><th>Disciplinas</th><th>Valor</th><th>Situação</th></tr></thead>
            <tbody>{cob.map((c) => (
              <tr key={c.id}><td>{c.semestre}</td><td>{c.disciplinaIds.length}</td><td>{brl(c.valorTotal)}</td><td>{c.status === 'PENDENTE' ? 'Pendente' : 'Cancelada'}</td></tr>))}</tbody>
          </table>
        )}
      </section>
    </>
  );
}
