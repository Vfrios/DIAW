package br.pucminas.diaw.aluguel.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record PedidoRequest(
        @NotNull LocalDate dataInicio,
        @NotNull LocalDate dataFim,
        @NotNull @Valid AutomovelDto automovel) {
}
