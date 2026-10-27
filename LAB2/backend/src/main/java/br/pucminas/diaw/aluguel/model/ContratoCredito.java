package br.pucminas.diaw.aluguel.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

/** Contrato de credito concedido por um banco agente e associado a um pedido de aluguel. */
@Entity
@Table(name = "contrato_credito")
public class ContratoCredito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "banco_id", nullable = false)
    private Usuario banco;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valor;

    @Column(name = "taxa_juros", nullable = false, precision = 7, scale = 4)
    private BigDecimal taxaJuros;

    @Column(name = "prazo_meses", nullable = false)
    private Integer prazoMeses;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Usuario getBanco() { return banco; }
    public void setBanco(Usuario banco) { this.banco = banco; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public BigDecimal getTaxaJuros() { return taxaJuros; }
    public void setTaxaJuros(BigDecimal taxaJuros) { this.taxaJuros = taxaJuros; }
    public Integer getPrazoMeses() { return prazoMeses; }
    public void setPrazoMeses(Integer prazoMeses) { this.prazoMeses = prazoMeses; }
}
