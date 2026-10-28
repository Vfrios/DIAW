package br.pucminas.diaw.aluguel.dto;

import br.pucminas.diaw.aluguel.model.Rendimento;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ClienteRequest(
        @NotBlank @Size(max = 20) String rg,
        @NotBlank @Pattern(regexp = "\\d{11}|\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}", message = "CPF invalido") String cpf,
        @NotBlank String nome,
        @NotBlank String endereco,
        @NotBlank String profissao,
        @Size(max = 3, message = "No maximo 3 rendimentos") List<@Valid Rendimento> rendimentos) {
}
