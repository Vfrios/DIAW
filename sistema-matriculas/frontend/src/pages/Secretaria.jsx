import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

const ABAS = ['Períodos', 'Cursos', 'Disciplinas', 'Usuários'];

function useRecurso(path) {
  const [dados, setDados] = useState([]);
  const recarregar = useCallback(() => api.get(path).then(setDados), [path]);
  useEffect(() => { recarregar().catch(() => {}); }, [recarregar]);
  return [dados, recarregar];
}

function Aviso({ msg }) {
  return msg ? <p className={'msg ' + (msg.erro ? 'erro' : 'ok')} role="status">{msg.erro || msg.ok}</p> : null;
}

/** Executa uma acao, mostra o resultado e recarrega as listas. */
function useAcao(recarregar) {
  const [msg, setMsg] = useState(null);
  const executar = async (fn, ok) => {
    try { const r = await fn(); setMsg({ ok: typeof ok === 'function' ? ok(r) : ok }); await recarregar(); return true; }
    catch (e) { setMsg({ erro: e.message }); return false; }
  };
  return [msg, executar];
}

function Periodos() {
  const [lista, recarregar] = useRecurso('/periodos');
  const [msg, exec] = useAcao(recarregar);
  const [f, setF] = useState({ semestre: '', inicio: '', fim: '' });
  return (
    <>
      <Aviso msg={msg} />
      <form className="linha" onSubmit={async (e) => { e.preventDefault(); if (await exec(() => api.post('/periodos', f), 'Período aberto.')) setF({ semestre: '', inicio: '', fim: '' }); }}>
        <label>Semestre<input placeholder="2027.1" value={f.semestre} onChange={(e) => setF({ ...f, semestre: e.target.value })} required /></label>
        <label>Início<input type="date" value={f.inicio} onChange={(e) => setF({ ...f, inicio: e.target.value })} required /></label>
        <label>Fim<input type="date" value={f.fim} onChange={(e) => setF({ ...f, fim: e.target.value })} required /></label>
        <button>Abrir período</button>
      </form>
      <table>
        <thead><tr><th>Semestre</th><th>Início</th><th>Fim</th><th>Situação</th><th></th></tr></thead>
        <tbody>{lista.map((p) => (
          <tr key={p.id}><td>{p.semestre}</td><td>{p.inicio}</td><td>{p.fim}</td><td>{p.status === 'ABERTO' ? (p.aberto ? 'Aberto' : 'Fora do prazo') : 'Encerrado'}</td>
            <td className="acoes">{p.status === 'ABERTO' && <button className="perigo" onClick={() => window.confirm('Encerrar o período e processar as disciplinas?') &&
              exec(() => api.post(`/periodos/${p.id}/encerrar`), (r) => `Encerrado. Ativas: ${r.ativas.length} · Canceladas (menos de 3 alunos): ${r.canceladas.length}.`)}>Encerrar e processar</button>}</td></tr>))}</tbody>
      </table>
    </>
  );
}

function Cursos() {
  const [lista, recarregar] = useRecurso('/cursos');
  const [msg, exec] = useAcao(recarregar);
  const vazio = { nome: '', creditos: '' };
  const [f, setF] = useState(vazio);
  const [edit, setEdit] = useState(null);
  async function salvar(e) {
    e.preventDefault();
    const body = { nome: f.nome, creditos: Number(f.creditos) };
    const ok = await exec(() => (edit ? api.put('/cursos/' + edit, body) : api.post('/cursos', body)), 'Curso salvo.');
    if (ok) { setF(vazio); setEdit(null); }
  }
  return (
    <>
      <Aviso msg={msg} />
      <form className="linha" onSubmit={salvar}>
        <label>Nome<input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} required /></label>
        <label>Créditos<input type="number" min="1" value={f.creditos} onChange={(e) => setF({ ...f, creditos: e.target.value })} required /></label>
        <button>{edit ? 'Salvar alterações' : 'Adicionar curso'}</button>
        {edit && <button type="button" className="sec" onClick={() => { setEdit(null); setF(vazio); }}>Cancelar</button>}
      </form>
      <table>
        <thead><tr><th>Curso</th><th>Créditos</th><th></th></tr></thead>
        <tbody>{lista.map((c) => (
          <tr key={c.id}><td>{c.nome}</td><td>{c.creditos}</td>
            <td className="acoes">
              <button className="sec" onClick={() => { setEdit(c.id); setF({ nome: c.nome, creditos: c.creditos }); }}>Editar</button>
              <button className="perigo" onClick={() => window.confirm('Excluir curso?') && exec(() => api.del('/cursos/' + c.id), 'Curso excluído.')}>Excluir</button>
            </td></tr>))}</tbody>
      </table>
    </>
  );
}

function Disciplinas() {
  const [lista, recarregar] = useRecurso('/disciplinas');
  const [cursos] = useRecurso('/cursos');
  const [profs] = useRecurso('/usuarios?perfil=PROFESSOR');
  const [msg, exec] = useAcao(recarregar);
  const vazio = { codigo: '', nome: '', creditos: '', cursoId: '', professorId: '', semestre: '' };
  const [f, setF] = useState(vazio);
  const [edit, setEdit] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function salvar(e) {
    e.preventDefault();
    const body = { ...f, creditos: Number(f.creditos) };
    const ok = await exec(() => (edit ? api.put('/disciplinas/' + edit, body) : api.post('/disciplinas', body)), 'Disciplina salva.');
    if (ok) { setF(vazio); setEdit(null); }
  }
  return (
    <>
      <Aviso msg={msg} />
      <form className="linha" onSubmit={salvar}>
        <label>Código<input value={f.codigo} onChange={set('codigo')} required /></label>
        <label>Nome<input value={f.nome} onChange={set('nome')} required /></label>
        <label>Créditos<input type="number" min="1" value={f.creditos} onChange={set('creditos')} required /></label>
        <label>Semestre<input placeholder="2027.1" value={f.semestre} onChange={set('semestre')} required /></label>
        <label>Curso<select value={f.cursoId} onChange={set('cursoId')} required><option value="">Selecione</option>{cursos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></label>
        <label>Professor<select value={f.professorId} onChange={set('professorId')} required><option value="">Selecione</option>{profs.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
        <button>{edit ? 'Salvar alterações' : 'Adicionar disciplina'}</button>
        {edit && <button type="button" className="sec" onClick={() => { setEdit(null); setF(vazio); }}>Cancelar</button>}
      </form>
      <div className="rolar"><table>
        <thead><tr><th>Sem.</th><th>Código</th><th>Disciplina</th><th>Créd.</th><th>Professor</th><th>Inscritos</th><th>Situação</th><th></th></tr></thead>
        <tbody>{lista.map((d) => (
          <tr key={d.id}><td>{d.semestre}</td><td>{d.codigo}</td><td>{d.nome}</td><td>{d.creditos}</td><td>{d.professorNome}</td><td>{d.inscritos}</td><td>{d.status}</td>
            <td className="acoes">
              <button className="sec" onClick={() => { setEdit(d.id); setF({ codigo: d.codigo, nome: d.nome, creditos: d.creditos, cursoId: d.cursoId, professorId: d.professorId, semestre: d.semestre }); }}>Editar</button>
              <button className="perigo" onClick={() => window.confirm('Excluir disciplina?') && exec(() => api.del('/disciplinas/' + d.id), 'Disciplina excluída.')}>Excluir</button>
            </td></tr>))}</tbody>
      </table></div>
    </>
  );
}

function Usuarios() {
  const [lista, recarregar] = useRecurso('/usuarios');
  const [cursos] = useRecurso('/cursos');
  const [msg, exec] = useAcao(recarregar);
  const vazio = { nome: '', login: '', senha: '', perfil: 'ALUNO', cursoId: '' };
  const [f, setF] = useState(vazio);
  const [edit, setEdit] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function salvar(e) {
    e.preventDefault();
    const ok = await exec(() => (edit ? api.put('/usuarios/' + edit, f) : api.post('/usuarios', f)), 'Usuário salvo.');
    if (ok) { setF(vazio); setEdit(null); }
  }
  return (
    <>
      <Aviso msg={msg} />
      <form className="linha" onSubmit={salvar}>
        <label>Nome<input value={f.nome} onChange={set('nome')} required /></label>
        <label>Login<input value={f.login} onChange={set('login')} required /></label>
        <label>Senha<input type="password" placeholder={edit ? 'Manter atual' : 'Mín. 6 caracteres'} value={f.senha} onChange={set('senha')} required={!edit} /></label>
        <label>Perfil<select value={f.perfil} onChange={set('perfil')}><option value="ALUNO">Aluno</option><option value="PROFESSOR">Professor</option><option value="SECRETARIA">Secretaria</option></select></label>
        {f.perfil === 'ALUNO' && <label>Curso<select value={f.cursoId} onChange={set('cursoId')} required><option value="">Selecione</option>{cursos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></label>}
        <button>{edit ? 'Salvar alterações' : 'Adicionar usuário'}</button>
        {edit && <button type="button" className="sec" onClick={() => { setEdit(null); setF(vazio); }}>Cancelar</button>}
      </form>
      <table>
        <thead><tr><th>Nome</th><th>Login</th><th>Perfil</th><th></th></tr></thead>
        <tbody>{lista.map((u) => (
          <tr key={u.id}><td>{u.nome}</td><td>{u.login}</td><td>{u.perfil}</td>
            <td className="acoes">
              <button className="sec" onClick={() => { setEdit(u.id); setF({ nome: u.nome, login: u.login, senha: '', perfil: u.perfil, cursoId: u.cursoId || '' }); }}>Editar</button>
              <button className="perigo" onClick={() => window.confirm('Excluir usuário?') && exec(() => api.del('/usuarios/' + u.id), 'Usuário excluído.')}>Excluir</button>
            </td></tr>))}</tbody>
      </table>
    </>
  );
}

export default function Secretaria() {
  const [aba, setAba] = useState(ABAS[0]);
  return (
    <section className="painel">
      <nav className="abas" role="tablist">
        {ABAS.map((a) => <button key={a} role="tab" aria-selected={a === aba} className={a === aba ? 'ativa' : ''} onClick={() => setAba(a)}>{a}</button>)}
      </nav>
      {aba === 'Períodos' && <Periodos />}
      {aba === 'Cursos' && <Cursos />}
      {aba === 'Disciplinas' && <Disciplinas />}
      {aba === 'Usuários' && <Usuarios />}
    </section>
  );
}
