package br.pucminas.diaw.aluguel.dto;

import br.pucminas.diaw.aluguel.model.Cliente;
import br.pucminas.diaw.aluguel.model.Rendimento;
import java.util.List;

public record ClienteResponse(Long id, String rg, String cpf, String nome, String endereco,
                              String profissao, List<Rendimento> rendimentos) {
    public static ClienteResponse de(Cliente c) {
        return new ClienteResponse(c.getId(), c.getRg(), c.getCpf(), c.getNome(), c.getEndereco(),
                c.getProfissao(), List.copyOf(c.getRendimentos()));
    }
}
