package br.pucminas.matriculas.controller;

import br.pucminas.matriculas.dto.Dtos.*;
import br.pucminas.matriculas.model.Cobranca;
import br.pucminas.matriculas.service.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MatriculaController {
    private final MatriculaService matriculas;
    private final CobrancaService cobrancas;
    private final UsuarioService usuarios;
    public MatriculaController(MatriculaService matriculas, CobrancaService cobrancas, UsuarioService usuarios) {
        this.matriculas = matriculas; this.cobrancas = cobrancas; this.usuarios = usuarios;
    }

    @GetMapping("/matriculas")
    public List<MatriculaResponse> minhas(Authentication auth) {
        return matriculas.listarDoAluno(usuarios.buscarPorLogin(auth.getName()).getId());
    }

    @PostMapping("/matriculas") @ResponseStatus(HttpStatus.CREATED)
    public MatriculaResponse matricular(@Valid @RequestBody MatriculaRequest r, Authentication auth) {
        return matriculas.matricular(usuarios.buscarPorLogin(auth.getName()), r.disciplinaId(), r.tipo());
    }

    @DeleteMapping("/matriculas/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelar(@PathVariable String id, Authentication auth) {
        matriculas.cancelar(usuarios.buscarPorLogin(auth.getName()), id);
    }

    @GetMapping("/cobrancas/minhas")
    public List<Cobranca> minhasCobrancas(Authentication auth) {
        return cobrancas.doAluno(usuarios.buscarPorLogin(auth.getName()).getId());
    }

    @GetMapping("/cobrancas")
    public List<Cobranca> todasCobrancas() { return cobrancas.todas(); }
}
