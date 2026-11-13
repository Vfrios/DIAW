package br.pucminas.matriculas.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("disciplinas")
public class Disciplina {
    @Id private String id;
    private String codigo;
    private String nome;
    private int creditos;
    private String cursoId;
    private String professorId;
    private String semestre;
    private StatusDisciplina status = StatusDisciplina.ABERTA;

    public Disciplina() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public int getCreditos() { return creditos; }
    public void setCreditos(int creditos) { this.creditos = creditos; }
    public String getCursoId() { return cursoId; }
    public void setCursoId(String cursoId) { this.cursoId = cursoId; }
    public String getProfessorId() { return professorId; }
    public void setProfessorId(String professorId) { this.professorId = professorId; }
    public String getSemestre() { return semestre; }
    public void setSemestre(String semestre) { this.semestre = semestre; }
    public StatusDisciplina getStatus() { return status; }
    public void setStatus(StatusDisciplina status) { this.status = status; }
}
