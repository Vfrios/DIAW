package br.pucminas.matriculas.controller;

import br.pucminas.matriculas.dto.Dtos.*;
import br.pucminas.matriculas.service.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class DisciplinaController {
    private final DisciplinaService service;
    private final UsuarioService usuarios;
    public DisciplinaController(DisciplinaService service, UsuarioService usuarios) {
        this.service = service; this.usuarios = usuarios;
    }

    @GetMapping("/disciplinas")
    public List<DisciplinaResponse> listar(@RequestParam(required = false) String semestre,
                                           @RequestParam(required = false) String cursoId) {
        return service.listar(semestre, cursoId);
    }
    @PostMapping("/disciplinas") @ResponseStatus(HttpStatus.CREATED)
    public DisciplinaResponse criar(@Valid @RequestBody DisciplinaRequest r) { return service.criar(r); }

    @PutMapping("/disciplinas/{id}")
    public DisciplinaResponse atualizar(@PathVariable String id, @Valid @RequestBody DisciplinaRequest r) {
        return service.atualizar(id, r);
    }
    @DeleteMapping("/disciplinas/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable String id) { service.remover(id); }

    /** Professor: alunos matriculados em disciplina propria. Secretaria: qualquer disciplina. */
    @GetMapping("/disciplinas/{id}/alunos")
    public List<AlunoMatriculadoResponse> alunos(@PathVariable String id, Authentication auth) {
        return service.alunosMatriculados(id, usuarios.buscarPorLogin(auth.getName()));
    }

    @GetMapping("/professor/disciplinas")
    public List<DisciplinaResponse> minhasDisciplinas(Authentication auth) {
        return service.doProfessor(usuarios.buscarPorLogin(auth.getName()).getId());
    }
}
