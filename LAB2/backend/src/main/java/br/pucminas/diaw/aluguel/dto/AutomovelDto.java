package br.pucminas.diaw.aluguel.dto;

import br.pucminas.diaw.aluguel.model.Automovel;
import br.pucminas.diaw.aluguel.model.ProprietarioVeiculo;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Usado na entrada (PedidoRequest) e na saida (PedidoResponse). */
public record AutomovelDto(
        @NotBlank String matricula,
        @NotNull @Min(1950) @Max(2100) Integer ano,
        @NotBlank String marca,
        @NotBlank String modelo,
        @NotBlank String placa,
        @NotNull ProprietarioVeiculo proprietario) {
    public static AutomovelDto de(Automovel a) {
        return new AutomovelDto(a.getMatricula(), a.getAno(), a.getMarca(), a.getModelo(),
                a.getPlaca(), a.getProprietario());
    }
}
