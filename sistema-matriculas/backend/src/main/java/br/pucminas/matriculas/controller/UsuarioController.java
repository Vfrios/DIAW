package br.pucminas.matriculas.controller;

import br.pucminas.matriculas.dto.Dtos.*;
import br.pucminas.matriculas.model.Perfil;
import br.pucminas.matriculas.service.UsuarioService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Gestao de alunos, professores e secretaria (somente SECRETARIA). */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService service;
    public UsuarioController(UsuarioService service) { this.service = service; }

    @GetMapping
    public List<UsuarioResponse> listar(@RequestParam(required = false) Perfil perfil) {
        return service.listar(perfil).stream().map(UsuarioResponse::de).toList();
    }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse criar(@Valid @RequestBody UsuarioRequest r) { return UsuarioResponse.de(service.criar(r)); }
    @PutMapping("/{id}")
    public UsuarioResponse atualizar(@PathVariable String id, @Valid @RequestBody UsuarioRequest r) {
        return UsuarioResponse.de(service.atualizar(id, r));
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable String id) { service.remover(id); }
}
