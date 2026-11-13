package br.pucminas.matriculas.service;

import br.pucminas.matriculas.dto.Dtos.*;
import br.pucminas.matriculas.exception.*;
import br.pucminas.matriculas.model.*;
import br.pucminas.matriculas.repository.*;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class DisciplinaService {
    private final DisciplinaRepository disciplinas;
    private final CursoRepository cursos;
    private final UsuarioRepository usuarios;
    private final MatriculaRepository matriculas;

    public DisciplinaService(DisciplinaRepository disciplinas, CursoRepository cursos,
                             UsuarioRepository usuarios, MatriculaRepository matriculas) {
        this.disciplinas = disciplinas; this.cursos = cursos; this.usuarios = usuarios; this.matriculas = matriculas;
    }

    public List<DisciplinaResponse> listar(String semestre, String cursoId) {
        List<Disciplina> lista;
        if (semestre != null && !semestre.isBlank()) lista = disciplinas.findBySemestre(semestre);
        else if (cursoId != null && !cursoId.isBlank()) lista = disciplinas.findByCursoId(cursoId);
        else lista = disciplinas.findAll();
        return lista.stream().map(this::paraResponse).toList();
    }

    public List<DisciplinaResponse> doProfessor(String professorId) {
        return disciplinas.findByProfessorId(professorId).stream().map(this::paraResponse).toList();
    }

    public DisciplinaResponse criar(DisciplinaRequest r) {
        Disciplina d = new Disciplina();
        aplicar(d, r);
        return paraResponse(disciplinas.save(d));
    }

    public DisciplinaResponse atualizar(String id, DisciplinaRequest r) {
        Disciplina d = buscar(id);
        aplicar(d, r);
        return paraResponse(disciplinas.save(d));
    }

    public void remover(String id) {
        buscar(id);
        if (matriculas.countByDisciplinaIdAndStatus(id, StatusMatricula.ATIVA) > 0)
            throw new RegraNegocioException("Disciplina possui matrículas ativas.");
        disciplinas.deleteById(id);
    }

    /** Professores so enxergam os alunos das proprias disciplinas; a secretaria enxerga todas. */
    public List<AlunoMatriculadoResponse> alunosMatriculados(String disciplinaId, Usuario solicitante) {
        Disciplina d = buscar(disciplinaId);
        if (solicitante.getPerfil() == Perfil.PROFESSOR && !solicitante.getId().equals(d.getProfessorId()))
            throw new AccessDeniedException("Disciplina de outro professor.");
        return matriculas.findByDisciplinaIdAndStatus(disciplinaId, StatusMatricula.ATIVA).stream().map(m -> {
            Usuario a = usuarios.findById(m.getAlunoId()).orElse(null);
            return new AlunoMatriculadoResponse(m.getId(), m.getAlunoId(),
                    a != null ? a.getNome() : "—", a != null ? a.getLogin() : "—", m.getTipo());
        }).toList();
    }

    public Disciplina buscar(String id) {
        return disciplinas.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Disciplina não encontrada"));
    }

    public DisciplinaResponse paraResponse(Disciplina d) {
        String prof = usuarios.findById(d.getProfessorId()).map(Usuario::getNome).orElse("—");
        long inscritos = matriculas.countByDisciplinaIdAndStatus(d.getId(), StatusMatricula.ATIVA);
        return new DisciplinaResponse(d.getId(), d.getCodigo(), d.getNome(), d.getCreditos(), d.getCursoId(),
                d.getProfessorId(), prof, d.getSemestre(), d.getStatus(), inscritos, RegrasMatricula.MAX_ALUNOS_DISCIPLINA);
    }

    private void aplicar(Disciplina d, DisciplinaRequest r) {
        if (!cursos.existsById(r.cursoId())) throw new RegraNegocioException("Curso inexistente.");
        Usuario prof = usuarios.findById(r.professorId()).orElse(null);
        if (prof == null || prof.getPerfil() != Perfil.PROFESSOR) throw new RegraNegocioException("Professor inválido.");
        d.setCodigo(r.codigo()); d.setNome(r.nome()); d.setCreditos(r.creditos());
        d.setCursoId(r.cursoId()); d.setProfessorId(r.professorId()); d.setSemestre(r.semestre());
    }
}
