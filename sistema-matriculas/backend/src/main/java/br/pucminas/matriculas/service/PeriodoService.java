package br.pucminas.matriculas.service;

import br.pucminas.matriculas.dto.Dtos.*;
import br.pucminas.matriculas.exception.*;
import br.pucminas.matriculas.model.*;
import br.pucminas.matriculas.repository.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class PeriodoService {
    private final PeriodoMatriculaRepository periodos;
    private final DisciplinaRepository disciplinas;
    private final MatriculaRepository matriculas;
    private final CobrancaService cobrancas;

    public PeriodoService(PeriodoMatriculaRepository periodos, DisciplinaRepository disciplinas,
                          MatriculaRepository matriculas, CobrancaService cobrancas) {
        this.periodos = periodos; this.disciplinas = disciplinas; this.matriculas = matriculas; this.cobrancas = cobrancas;
    }

    public List<PeriodoMatricula> listar() { return periodos.findAll(); }

    public Optional<PeriodoMatricula> aberto() {
        return periodos.findFirstByStatus(StatusPeriodo.ABERTO).filter(PeriodoMatricula::isAberto);
    }

    public PeriodoMatricula abrir(PeriodoRequest r) {
        if (r.fim().isBefore(r.inicio())) throw new RegraNegocioException("A data final deve ser posterior à inicial.");
        if (periodos.existsByStatus(StatusPeriodo.ABERTO)) throw new RegraNegocioException("Já existe um período aberto. Encerre-o antes.");
        return periodos.save(new PeriodoMatricula(r.semestre(), r.inicio(), r.fim()));
    }

    /**
     * Encerra o periodo e processa as disciplinas do semestre:
     * >= 3 alunos -> ATIVA; caso contrario -> CANCELADA (e suas matriculas sao canceladas, com notificacao de cobranca).
     */
    public ResultadoEncerramento encerrar(String id) {
        PeriodoMatricula p = periodos.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Período não encontrado"));
        if (p.getStatus() == StatusPeriodo.ENCERRADO) throw new RegraNegocioException("Período já encerrado.");
        p.setStatus(StatusPeriodo.ENCERRADO);
        periodos.save(p);

        List<String> ativas = new ArrayList<>();
        List<String> canceladas = new ArrayList<>();
        for (Disciplina d : disciplinas.findBySemestreAndStatus(p.getSemestre(), StatusDisciplina.ABERTA)) {
            List<Matricula> ms = matriculas.findByDisciplinaIdAndStatus(d.getId(), StatusMatricula.ATIVA);
            if (ms.size() >= RegrasMatricula.MIN_ALUNOS_DISCIPLINA) {
                d.setStatus(StatusDisciplina.ATIVA);
                ativas.add(d.getCodigo() + " - " + d.getNome());
            } else {
                d.setStatus(StatusDisciplina.CANCELADA);
                canceladas.add(d.getCodigo() + " - " + d.getNome());
                ms.forEach(m -> m.setStatus(StatusMatricula.CANCELADA));
                matriculas.saveAll(ms);
                ms.forEach(m -> cobrancas.notificar(m.getAlunoId(), p.getSemestre()));
            }
            disciplinas.save(d);
        }
        return new ResultadoEncerramento(ativas, canceladas);
    }
}
