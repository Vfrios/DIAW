package br.pucminas.diaw.aluguel.service;

import br.pucminas.diaw.aluguel.dto.*;
import br.pucminas.diaw.aluguel.exception.ApiException;
import br.pucminas.diaw.aluguel.model.Cliente;
import br.pucminas.diaw.aluguel.model.Usuario;
import br.pucminas.diaw.aluguel.repository.ClienteRepository;
import br.pucminas.diaw.aluguel.repository.UsuarioRepository;
import br.pucminas.diaw.aluguel.security.TokenService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final ClienteRepository clientes;
    private final BCryptPasswordEncoder encoder;
    private final TokenService tokens;

    public AuthService(UsuarioRepository usuarios, ClienteRepository clientes,
                       BCryptPasswordEncoder encoder, TokenService tokens) {
        this.usuarios = usuarios;
        this.clientes = clientes;
        this.encoder = encoder;
        this.tokens = tokens;
    }

    @Transactional
    public AuthResponse registrar(RegisterRequest r) {
        String login = r.login().trim().toLowerCase();
        if (usuarios.existsByLogin(login)) {
            throw ApiException.conflict("Login ja esta em uso");
        }
        Usuario u = new Usuario();
        u.setLogin(login);
        u.setSenhaHash(encoder.encode(r.senha()));
        u.setNome(r.nome().trim());
        u.setPapel(r.papel());
        usuarios.save(u);
        return new AuthResponse(tokens.gerar(u), UsuarioResponse.de(u, null));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest r) {
        Usuario u = usuarios.findByLogin(r.login().trim().toLowerCase())
                .filter(x -> encoder.matches(r.senha(), x.getSenhaHash()))
                .orElseThrow(() -> ApiException.unauthorized("Usuario ou senha invalidos"));
        return new AuthResponse(tokens.gerar(u), UsuarioResponse.de(u, clienteId(u.getId())));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse me(Long usuarioId) {
        Usuario u = usuarios.findById(usuarioId)
                .orElseThrow(() -> ApiException.unauthorized("Usuario nao encontrado"));
        return UsuarioResponse.de(u, clienteId(usuarioId));
    }

    private Long clienteId(Long usuarioId) {
        return clientes.findByUsuarioId(usuarioId).map(Cliente::getId).orElse(null);
    }
}
