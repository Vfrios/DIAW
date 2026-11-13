package br.pucminas.matriculas.service;

import br.pucminas.matriculas.dto.Dtos.MatriculaResponse;
import br.pucminas.matriculas.exception.*;
import br.pucminas.matriculas.model.*;
import br.pucminas.matriculas.repository.*;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class MatriculaService {
    private final MatriculaRepository matriculas;
    private final DisciplinaRepository disciplinas;
    private final PeriodoMatriculaRepository periodos;
    private final CobrancaService cobrancas;

    public MatriculaService(MatriculaRepository matriculas, DisciplinaRepository disciplinas,
                            PeriodoMatriculaRepository periodos, CobrancaService cobrancas) {
        this.matriculas = matriculas; this.disciplinas = disciplinas; this.periodos = periodos; this.cobrancas = cobrancas;
    }

    public MatriculaResponse matricular(Usuario aluno, String disciplinaId, TipoMatricula tipo) {
        PeriodoMatricula periodo = periodoAberto();
        Disciplina d = disciplinas.findById(disciplinaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Disciplina não encontrada"));

        if (!d.getSemestre().equals(periodo.getSemestre()))
            throw new RegraNegocioException("Disciplina não pertence ao semestre em matrícula (" + periodo.getSemestre() + ").");
        if (d.getStatus() != StatusDisciplina.ABERTA)
            throw new RegraNegocioException("Disciplina não está aberta para matrículas.");
        if (matriculas.existsByAlunoIdAndDisciplinaIdAndStatus(aluno.getId(), d.getId(), StatusMatricula.ATIVA))
            throw new RegraNegocioException("Você já está matriculado nesta disciplina.");
        if (matriculas.countByDisciplinaIdAndStatus(d.getId(), StatusMatricula.ATIVA) >= RegrasMatricula.MAX_ALUNOS_DISCIPLINA)
            throw new RegraNegocioException("Disciplina lotada: inscrições encerradas (máx. " + RegrasMatricula.MAX_ALUNOS_DISCIPLINA + ").");

        int limite = tipo == TipoMatricula.OBRIGATORIA ? RegrasMatricula.MAX_OBRIGATORIAS : RegrasMatricula.MAX_OPTATIVAS;
        long atuais = matriculas.countByAlunoIdAndSemestreAndTipoAndStatus(aluno.getId(), periodo.getSemestre(), tipo, StatusMatricula.ATIVA);
        if (atuais >= limite)
            throw new RegraNegocioException("Limite de " + limite + " disciplinas " + (tipo == TipoMatricula.OBRIGATORIA ? "obrigatórias" : "optativas") + " atingido.");

        Matricula m = matriculas.save(new Matricula(aluno.getId(), d.getId(), d.getSemestre(), tipo));
        cobrancas.notificar(aluno.getId(), d.getSemestre());
        return resposta(m, d);
    }

    public void cancelar(Usuario aluno, String matriculaId) {
        periodoAberto();
        Matricula m = matriculas.findById(matriculaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Matrícula não encontrada"));
        if (!m.getAlunoId().equals(aluno.getId())) throw new RegraNegocioException("Matrícula pertence a outro aluno.");
        if (m.getStatus() != StatusMatricula.ATIVA) throw new RegraNegocioException("Matrícula já cancelada.");
        m.setStatus(StatusMatricula.CANCELADA);
        matriculas.save(m);
        cobrancas.notificar(aluno.getId(), m.getSemestre());
    }

    public List<MatriculaResponse> listarDoAluno(String alunoId) {
        List<Matricula> ativas = matriculas.findByAlunoIdAndStatus(alunoId, StatusMatricula.ATIVA);
        Map<String, Disciplina> porId = disciplinas.findAllById(ativas.stream().map(Matricula::getDisciplinaId).toList())
                .stream().collect(Collectors.toMap(Disciplina::getId, Function.identity()));
        return ativas.stream().filter(m -> porId.containsKey(m.getDisciplinaId()))
                .map(m -> resposta(m, porId.get(m.getDisciplinaId()))).toList();
    }

    private PeriodoMatricula periodoAberto() {
        return periodos.findFirstByStatus(StatusPeriodo.ABERTO).filter(PeriodoMatricula::isAberto)
                .orElseThrow(() -> new RegraNegocioException("Não há período de matrículas aberto no momento."));
    }

    private MatriculaResponse resposta(Matricula m, Disciplina d) {
        return new MatriculaResponse(m.getId(), d.getId(), d.getCodigo(), d.getNome(), d.getCreditos(),
                m.getSemestre(), m.getTipo(), m.getStatus());
    }
}
