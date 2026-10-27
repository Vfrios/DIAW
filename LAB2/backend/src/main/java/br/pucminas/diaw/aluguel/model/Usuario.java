package br.pucminas.diaw.aluguel.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String login;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Column(nullable = false)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Papel papel;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }
    public String getSenhaHash() { return senhaHash; }
    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Papel getPapel() { return papel; }
    public void setPapel(Papel papel) { this.papel = papel; }
}
