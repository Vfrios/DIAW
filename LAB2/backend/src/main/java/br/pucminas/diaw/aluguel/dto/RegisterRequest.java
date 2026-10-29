package br.pucminas.diaw.aluguel.dto;

import br.pucminas.diaw.aluguel.model.Papel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 60) String login,
        @NotBlank @Size(min = 6, max = 100) String senha,
        @NotBlank String nome,
        @NotNull Papel papel) {
}
