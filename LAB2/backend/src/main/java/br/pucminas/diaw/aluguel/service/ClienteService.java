package br.pucminas.diaw.aluguel.service;

import br.pucminas.diaw.aluguel.dto.ClienteRequest;
import br.pucminas.diaw.aluguel.dto.ClienteResponse;
import br.pucminas.diaw.aluguel.exception.ApiException;
import br.pucminas.diaw.aluguel.model.Cliente;
import br.pucminas.diaw.aluguel.repository.ClienteRepository;
import br.pucminas.diaw.aluguel.repository.PedidoRepository;
import br.pucminas.diaw.aluguel.repository.UsuarioRepository;
import br.pucminas.diaw.aluguel.security.AuthUser;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** CRUD de cliente. Cliente so enxerga/altera o proprio cadastro; agentes apenas consultam. */
@Service
public class ClienteService {

    private final ClienteRepository clientes;
    private final UsuarioRepository usuarios;
    private final PedidoRepository pedidos;

    public ClienteService(ClienteRepository clientes, UsuarioRepository usuarios, PedidoRepository pedidos) {
        this.clientes = clientes;
        this.usuarios = usuarios;
        this.pedidos = pedidos;
    }

    @Transactional(readOnly = true)
    public List<ClienteResponse> listar(AuthUser user) {
        if (user.isAgente()) {
            return clientes.findAll().stream().map(ClienteResponse::de).toList();
        }
        return clientes.findByUsuarioId(user.id()).map(c -> List.of(ClienteResponse.de(c))).orElse(List.of());
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscar(Long id, AuthUser user) {
        Cliente c = carregar(id);
        if (!user.isAgente() && !dono(c, user)) {
            throw ApiException.forbidden("Acesso negado a este cliente");
        }
        return ClienteResponse.de(c);
    }

    @Transactional
    public ClienteResponse criar(ClienteRequest r, AuthUser user) {
        if (user.isAgente()) {
            throw ApiException.forbidden("Apenas usuarios do tipo CLIENTE possuem cadastro de cliente");
        }
        if (clientes.findByUsuarioId(user.id()).isPresent()) {
            throw ApiException.conflict("Voce ja possui cadastro de cliente");
        }
        String cpf = apenasDigitos(r.cpf());
        if (clientes.findByCpf(cpf).isPresent()) {
            throw ApiException.conflict("CPF ja cadastrado");
        }
        Cliente c = new Cliente();
        c.setUsuario(usuarios.getReferenceById(user.id()));
        aplicar(c, r, cpf);
        return ClienteResponse.de(clientes.save(c));
    }

    @Transactional
    public ClienteResponse atualizar(Long id, ClienteRequest r, AuthUser user) {
        Cliente c = carregar(id);
        exigirDono(c, user);
        String cpf = apenasDigitos(r.cpf());
        clientes.findByCpf(cpf).filter(outro -> !outro.getId().equals(id)).ifPresent(outro -> {
            throw ApiException.conflict("CPF ja cadastrado");
        });
        aplicar(c, r, cpf);
        return ClienteResponse.de(clientes.save(c));
    }

    @Transactional
    public void excluir(Long id, AuthUser user) {
        Cliente c = carregar(id);
        exigirDono(c, user);
        if (pedidos.existsByClienteId(id)) {
            throw ApiException.conflict("Nao e possivel excluir: existem pedidos de aluguel vinculados");
        }
        clientes.delete(c);
    }

    private Cliente carregar(Long id) {
        return clientes.findById(id).orElseThrow(() -> ApiException.notFound("Cliente nao encontrado"));
    }

    private boolean dono(Cliente c, AuthUser user) {
        return c.getUsuario().getId().equals(user.id());
    }

    private void exigirDono(Cliente c, AuthUser user) {
        if (!dono(c, user)) {
            throw ApiException.forbidden("Apenas o proprio cliente pode alterar ou excluir seu cadastro");
        }
    }

    private void aplicar(Cliente c, ClienteRequest r, String cpf) {
        c.setRg(r.rg().trim());
        c.setCpf(cpf);
        c.setNome(r.nome().trim());
        c.setEndereco(r.endereco().trim());
        c.setProfissao(r.profissao().trim());
        c.getRendimentos().clear();
        if (r.rendimentos() != null) {
            c.getRendimentos().addAll(new ArrayList<>(r.rendimentos()));
        }
    }

    private static String apenasDigitos(String cpf) {
        return cpf.replaceAll("\\D", "");
    }
}
