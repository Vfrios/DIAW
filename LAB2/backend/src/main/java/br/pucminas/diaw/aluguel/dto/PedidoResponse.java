package br.pucminas.diaw.aluguel.dto;

import br.pucminas.diaw.aluguel.model.ContratoCredito;
import br.pucminas.diaw.aluguel.model.PedidoAluguel;
import br.pucminas.diaw.aluguel.model.StatusPedido;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record PedidoResponse(Long id, StatusPedido status, String parecer, LocalDate dataInicio,
                             LocalDate dataFim, Instant criadoEm, ClienteResumo cliente,
                             AutomovelDto automovel, CreditoDto credito) {

    public record ClienteResumo(Long id, String nome, String cpf) {
    }

    public record CreditoDto(String banco, BigDecimal valor, BigDecimal taxaJuros, Integer prazoMeses) {
        static CreditoDto de(ContratoCredito c) {
            return c == null ? null
                    : new CreditoDto(c.getBanco().getNome(), c.getValor(), c.getTaxaJuros(), c.getPrazoMeses());
        }
    }

    public static PedidoResponse de(PedidoAluguel p) {
        return new PedidoResponse(p.getId(), p.getStatus(), p.getParecer(), p.getDataInicio(),
                p.getDataFim(), p.getCriadoEm(),
                new ClienteResumo(p.getCliente().getId(), p.getCliente().getNome(), p.getCliente().getCpf()),
                AutomovelDto.de(p.getAutomovel()), CreditoDto.de(p.getCredito()));
    }
}
