package br.pucminas.matriculas.model;

import java.time.LocalDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("periodos")
public class PeriodoMatricula {
    @Id private String id;
    private String semestre;
    private LocalDate inicio;
    private LocalDate fim;
    private StatusPeriodo status = StatusPeriodo.ABERTO;

    public PeriodoMatricula() {}
    public PeriodoMatricula(String semestre, LocalDate inicio, LocalDate fim) {
        this.semestre = semestre; this.inicio = inicio; this.fim = fim;
    }
    /** Aberto = nao encerrado manualmente e hoje dentro do intervalo [inicio, fim]. */
    public boolean isAberto() {
        LocalDate hoje = LocalDate.now();
        return status == StatusPeriodo.ABERTO && !hoje.isBefore(inicio) && !hoje.isAfter(fim);
    }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSemestre() { return semestre; }
    public void setSemestre(String semestre) { this.semestre = semestre; }
    public LocalDate getInicio() { return inicio; }
    public void setInicio(LocalDate inicio) { this.inicio = inicio; }
    public LocalDate getFim() { return fim; }
    public void setFim(LocalDate fim) { this.fim = fim; }
    public StatusPeriodo getStatus() { return status; }
    public void setStatus(StatusPeriodo status) { this.status = status; }
}
