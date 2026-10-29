package br.pucminas.diaw.aluguel.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record CreditoRequest(
        @NotNull @Positive BigDecimal valor,
        @NotNull @PositiveOrZero BigDecimal taxaJuros,
        @NotNull @Positive Integer prazoMeses) {
}
