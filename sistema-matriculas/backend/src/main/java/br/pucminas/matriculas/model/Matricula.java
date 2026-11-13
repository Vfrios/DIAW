package br.pucminas.matriculas.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("matriculas")
@CompoundIndex(def = "{'alunoId': 1, 'semestre': 1, 'status': 1}")
public class Matricula {
    @Id private String id;
    private String alunoId;
    private String disciplinaId;
    private String semestre;
    private TipoMatricula tipo;
    private StatusMatricula status = StatusMatricula.ATIVA;
    private Instant criadaEm = Instant.now();

    public Matricula() {}
    public Matricula(String alunoId, String disciplinaId, String semestre, TipoMatricula tipo) {
        this.alunoId = alunoId; this.disciplinaId = disciplinaId; this.semestre = semestre; this.tipo = tipo;
    }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getAlunoId() { return alunoId; }
    public void setAlunoId(String alunoId) { this.alunoId = alunoId; }
    public String getDisciplinaId() { return disciplinaId; }
    public void setDisciplinaId(String disciplinaId) { this.disciplinaId = disciplinaId; }
    public String getSemestre() { return semestre; }
    public void setSemestre(String semestre) { this.semestre = semestre; }
    public TipoMatricula getTipo() { return tipo; }
    public void setTipo(TipoMatricula tipo) { this.tipo = tipo; }
    public StatusMatricula getStatus() { return status; }
    public void setStatus(StatusMatricula status) { this.status = status; }
    public Instant getCriadaEm() { return criadaEm; }
    public void setCriadaEm(Instant criadaEm) { this.criadaEm = criadaEm; }
}
