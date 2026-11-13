package br.pucminas.matriculas.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** Usuario do sistema (aluno, professor ou secretaria). Alunos pertencem a um curso. */
@Document("usuarios")
public class Usuario {
    @Id private String id;
    private String nome;
    @Indexed(unique = true) private String login;
    private String senhaHash;
    private Perfil perfil;
    private String cursoId;

    public Usuario() {}
    public Usuario(String nome, String login, String senhaHash, Perfil perfil, String cursoId) {
        this.nome = nome; this.login = login; this.senhaHash = senhaHash; this.perfil = perfil; this.cursoId = cursoId;
    }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }
    public String getSenhaHash() { return senhaHash; }
    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }
    public Perfil getPerfil() { return perfil; }
    public void setPerfil(Perfil perfil) { this.perfil = perfil; }
    public String getCursoId() { return cursoId; }
    public void setCursoId(String cursoId) { this.cursoId = cursoId; }
}
