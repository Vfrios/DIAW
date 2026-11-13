package br.pucminas.matriculas.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/** Registro enviado ao sistema de cobrancas: uma cobranca por aluno e semestre. */
@Document("cobrancas")
public class Cobranca {
    @Id private String id;
    private String alunoId;
    private String semestre;
    private List<String> disciplinaIds = new ArrayList<>();
    private BigDecimal valorTotal = BigDecimal.ZERO;
    private StatusCobranca status = StatusCobranca.PENDENTE;
    private Instant atualizadaEm = Instant.now();

    public Cobranca() {}
    public Cobranca(String alunoId, String semestre) { this.alunoId = alunoId; this.semestre = semestre; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getAlunoId() { return alunoId; }
    public void setAlunoId(String alunoId) { this.alunoId = alunoId; }
    public String getSemestre() { return semestre; }
    public void setSemestre(String semestre) { this.semestre = semestre; }
    public List<String> getDisciplinaIds() { return disciplinaIds; }
    public void setDisciplinaIds(List<String> disciplinaIds) { this.disciplinaIds = disciplinaIds; }
    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
    public StatusCobranca getStatus() { return status; }
    public void setStatus(StatusCobranca status) { this.status = status; }
    public Instant getAtualizadaEm() { return atualizadaEm; }
    public void setAtualizadaEm(Instant atualizadaEm) { this.atualizadaEm = atualizadaEm; }
}
