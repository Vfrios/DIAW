package br.pucminas.diaw.aluguel.service;

import br.pucminas.diaw.aluguel.dto.*;
import br.pucminas.diaw.aluguel.exception.ApiException;
import br.pucminas.diaw.aluguel.model.*;
import br.pucminas.diaw.aluguel.repository.ClienteRepository;
import br.pucminas.diaw.aluguel.repository.PedidoRepository;
import br.pucminas.diaw.aluguel.repository.UsuarioRepository;
import br.pucminas.diaw.aluguel.security.AuthUser;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Regras dos pedidos de aluguel.
 * Fluxo: EM_ANALISE -> (agente avalia) APROVADO | REJEITADO -> (agente) CONTRATADO.
 * O cliente pode cancelar enquanto EM_ANALISE ou APROVADO.
 */
@Service
public class PedidoService {

    private static final Set<StatusPedido> MODIFICAVEIS_AGENTE = Set.of(StatusPedido.EM_ANALISE, StatusPedido.APROVADO);

    private final PedidoRepository pedidos;
    private final ClienteRepository clientes;
    private final UsuarioRepository usuarios;

    public PedidoService(PedidoRepository pedidos, ClienteRepository clientes, UsuarioRepository usuarios) {
        this.pedidos = pedidos;
        this.clientes = clientes;
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listar(AuthUser user) {
        List<PedidoAluguel> lista = user.isAgente()
                ? pedidos.findAllByOrderByIdDesc()
                : pedidos.findByClienteUsuarioIdOrderByIdDesc(user.id());
        return lista.stream().map(PedidoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public PedidoResponse buscar(Long id, AuthUser user) {
        return PedidoResponse.de(carregarComAcesso(id, user));
    }

    @Transactional
    public PedidoResponse criar(PedidoRequest r, AuthUser user) {
        if (user.isAgente()) {
            throw ApiException.forbidden("Apenas clientes podem introduzir pedidos de aluguel");
        }
        Cliente cliente = clientes.findByUsuarioId(user.id())
                .orElseThrow(() -> ApiException.badRequest("Complete seu cadastro de cliente antes de criar um pedido"));
        validarDatas(r);
        if (r.dataInicio().isBefore(LocalDate.now())) {
            throw ApiException.badRequest("A data de inicio nao pode estar no passado");
        }
        PedidoAluguel p = new PedidoAluguel();
        p.setCliente(cliente);
        p.setAutomovel(new Automovel());
        aplicar(p, r);
        p.setStatus(StatusPedido.EM_ANALISE);
        p.setCriadoEm(Instant.now());
        return PedidoResponse.de(pedidos.save(p));
    }

    @Transactional
    public PedidoResponse atualizar(Long id, PedidoRequest r, AuthUser user) {
        PedidoAluguel p = carregarComAcesso(id, user);
        if (user.isAgente()) {
            if (!MODIFICAVEIS_AGENTE.contains(p.getStatus())) {
                throw ApiException.conflict("Pedido " + p.getStatus() + " nao pode mais ser modificado");
            }
        } else if (p.getStatus() != StatusPedido.EM_ANALISE) {
            throw ApiException.conflict("Clientes so podem modificar pedidos em analise");
        }
        validarDatas(r);
        aplicar(p, r);
        return PedidoResponse.de(p);
    }

    @Transactional
    public PedidoResponse cancelar(Long id, AuthUser user) {
        if (user.isAgente()) {
            throw ApiException.forbidden("Apenas o cliente pode cancelar o pedido");
        }
        PedidoAluguel p = carregarComAcesso(id, user);
        if (p.getStatus() != StatusPedido.EM_ANALISE && p.getStatus() != StatusPedido.APROVADO) {
            throw ApiException.conflict("Pedido " + p.getStatus() + " nao pode ser cancelado");
        }
        p.setStatus(StatusPedido.CANCELADO);
        return PedidoResponse.de(p);
    }

    @Transactional
    public PedidoResponse avaliar(Long id, AvaliacaoRequest r, AuthUser user) {
        exigirAgente(user);
        if (r.status() != StatusPedido.APROVADO && r.status() != StatusPedido.REJEITADO) {
            throw ApiException.badRequest("A avaliacao deve resultar em APROVADO ou REJEITADO");
        }
        PedidoAluguel p = carregarComAcesso(id, user);
        if (p.getStatus() != StatusPedido.EM_ANALISE) {
            throw ApiException.conflict("Apenas pedidos EM_ANALISE podem ser avaliados");
        }
        p.setStatus(r.status());
        p.setParecer(r.parecer().trim());
        return PedidoResponse.de(p);
    }

    @Transactional
    public PedidoResponse contratar(Long id, AuthUser user) {
        exigirAgente(user);
        PedidoAluguel p = carregarComAcesso(id, user);
        if (p.getStatus() != StatusPedido.APROVADO) {
            throw ApiException.conflict("Apenas pedidos APROVADOS podem ter o contrato executado");
        }
        p.setStatus(StatusPedido.CONTRATADO);
        return PedidoResponse.de(p);
    }

    @Transactional
    public PedidoResponse registrarCredito(Long id, CreditoRequest r, AuthUser user) {
        if (user.papel() != Papel.BANCO) {
            throw ApiException.forbidden("Apenas bancos podem conceder contrato de credito");
        }
        PedidoAluguel p = carregarComAcesso(id, user);
        if (p.getStatus() == StatusPedido.CANCELADO || p.getStatus() == StatusPedido.REJEITADO) {
            throw ApiException.conflict("Pedido " + p.getStatus() + " nao pode receber contrato de credito");
        }
        ContratoCredito c = p.getCredito() != null ? p.getCredito() : new ContratoCredito();
        c.setBanco(usuarios.getReferenceById(user.id()));
        c.setValor(r.valor());
        c.setTaxaJuros(r.taxaJuros());
        c.setPrazoMeses(r.prazoMeses());
        p.setCredito(c);
        return PedidoResponse.de(p);
    }

    // ---------- auxiliares ----------

    private PedidoAluguel carregarComAcesso(Long id, AuthUser user) {
        PedidoAluguel p = pedidos.findById(id).orElseThrow(() -> ApiException.notFound("Pedido nao encontrado"));
        if (!user.isAgente() && !p.getCliente().getUsuario().getId().equals(user.id())) {
            throw ApiException.forbidden("Acesso negado a este pedido");
        }
        return p;
    }

    private void exigirAgente(AuthUser user) {
        if (!user.isAgente()) {
            throw ApiException.forbidden("Operacao restrita a agentes (empresas e bancos)");
        }
    }

    private void validarDatas(PedidoRequest r) {
        if (r.dataFim().isBefore(r.dataInicio())) {
            throw ApiException.badRequest("A data final deve ser igual ou posterior a data inicial");
        }
    }

    private void aplicar(PedidoAluguel p, PedidoRequest r) {
        p.setDataInicio(r.dataInicio());
        p.setDataFim(r.dataFim());
        Automovel a = p.getAutomovel();
        AutomovelDto d = r.automovel();
        a.setMatricula(d.matricula().trim());
        a.setAno(d.ano());
        a.setMarca(d.marca().trim());
        a.setModelo(d.modelo().trim());
        a.setPlaca(d.placa().trim().toUpperCase());
        a.setProprietario(d.proprietario());
    }
}
