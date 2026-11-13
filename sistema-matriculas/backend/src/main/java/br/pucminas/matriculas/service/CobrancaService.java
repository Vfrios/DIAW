package br.pucminas.matriculas.service;

import br.pucminas.matriculas.model.*;
import br.pucminas.matriculas.repository.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** Integracao com o Sistema de Cobrancas: notificado sempre que as matriculas de um aluno mudam. */
@Service
public class CobrancaService {
    private static final Logger log = LoggerFactory.getLogger(CobrancaService.class);

    private final CobrancaRepository cobrancas;
    private final MatriculaRepository matriculas;
    private final DisciplinaRepository disciplinas;
    private final BigDecimal valorCredito;

    public CobrancaService(CobrancaRepository cobrancas, MatriculaRepository matriculas,
                           DisciplinaRepository disciplinas, @Value("${app.valor-credito}") BigDecimal valorCredito) {
        this.cobrancas = cobrancas; this.matriculas = matriculas;
        this.disciplinas = disciplinas; this.valorCredito = valorCredito;
    }

    public Cobranca notificar(String alunoId, String semestre) {
        List<String> ids = matriculas.findByAlunoIdAndSemestreAndStatus(alunoId, semestre, StatusMatricula.ATIVA)
                .stream().map(Matricula::getDisciplinaId).toList();
        int creditos = disciplinas.findAllById(ids).stream().mapToInt(Disciplina::getCreditos).sum();

        Cobranca c = cobrancas.findByAlunoIdAndSemestre(alunoId, semestre).orElseGet(() -> new Cobranca(alunoId, semestre));
        c.setDisciplinaIds(ids);
        c.setValorTotal(valorCredito.multiply(BigDecimal.valueOf(creditos)));
        c.setStatus(ids.isEmpty() ? StatusCobranca.CANCELADA : StatusCobranca.PENDENTE);
        c.setAtualizadaEm(Instant.now());
        log.info("[SISTEMA DE COBRANÇAS] aluno={} semestre={} disciplinas={} total={}", alunoId, semestre, ids.size(), c.getValorTotal());
        return cobrancas.save(c);
    }

    public List<Cobranca> doAluno(String alunoId) { return cobrancas.findByAlunoId(alunoId); }
    public List<Cobranca> todas() { return cobrancas.findAll(); }
}
