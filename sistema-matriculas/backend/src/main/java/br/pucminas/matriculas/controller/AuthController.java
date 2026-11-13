package br.pucminas.matriculas.controller;

import br.pucminas.matriculas.dto.Dtos.UsuarioResponse;
import br.pucminas.matriculas.service.UsuarioService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UsuarioService usuarios;
    public AuthController(UsuarioService usuarios) { this.usuarios = usuarios; }

    /** Valida as credenciais (Basic) e devolve o perfil do usuario logado. */
    @GetMapping("/me")
    public UsuarioResponse me(Authentication auth) {
        return UsuarioResponse.de(usuarios.buscarPorLogin(auth.getName()));
    }
}
