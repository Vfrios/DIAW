package br.pucminas.diaw.aluguel.controller;

import br.pucminas.diaw.aluguel.dto.*;
import br.pucminas.diaw.aluguel.security.AuthInterceptor;
import br.pucminas.diaw.aluguel.security.AuthUser;
import br.pucminas.diaw.aluguel.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest r) {
        return service.registrar(r);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest r) {
        return service.login(r);
    }

    @GetMapping("/me")
    public UsuarioResponse me(@RequestAttribute(AuthInterceptor.ATTR) AuthUser user) {
        return service.me(user.id());
    }
}
