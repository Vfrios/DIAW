package br.pucminas.diaw.aluguel.dto;

import br.pucminas.diaw.aluguel.model.StatusPedido;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Parecer financeiro do agente: status deve ser APROVADO ou REJEITADO. */
public record AvaliacaoRequest(@NotNull StatusPedido status, @NotBlank @Size(max = 1000) String parecer) {
}
