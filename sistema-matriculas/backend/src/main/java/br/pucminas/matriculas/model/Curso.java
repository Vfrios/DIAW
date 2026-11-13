package br.pucminas.matriculas.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/** Curso: nome, numero de creditos e conjunto de disciplinas (Disciplina.cursoId). */
@Document("cursos")
public class Curso {
    @Id private String id;
    private String nome;
    private int creditos;

    public Curso() {}
    public Curso(String nome, int creditos) { this.nome = nome; this.creditos = creditos; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public int getCreditos() { return creditos; }
    public void setCreditos(int creditos) { this.creditos = creditos; }
}
