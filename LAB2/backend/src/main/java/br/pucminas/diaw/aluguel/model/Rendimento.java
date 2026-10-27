package br.pucminas.diaw.aluguel.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

/** Entidade empregadora + rendimento auferido (um cliente pode ter no maximo 3). */
@Embeddable
public record Rendimento(
        @NotBlank @Column(name = "entidade_empregadora", nullable = false) String entidadeEmpregadora,
        @NotNull @PositiveOrZero @Column(name = "valor", nullable = false, precision = 15, scale = 2) BigDecimal valor) {
}
