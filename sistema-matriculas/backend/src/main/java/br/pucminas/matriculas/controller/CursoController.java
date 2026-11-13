package br.pucminas.matriculas.controller;

import br.pucminas.matriculas.dto.Dtos.CursoRequest;
import br.pucminas.matriculas.exception.*;
import br.pucminas.matriculas.model.Curso;
import br.pucminas.matriculas.repository.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cursos")
public class CursoController {
    private final CursoRepository cursos;
    private final DisciplinaRepository disciplinas;
    public CursoController(CursoRepository cursos, DisciplinaRepository disciplinas) {
        this.cursos = cursos; this.disciplinas = disciplinas;
    }

    @GetMapping public List<Curso> listar() { return cursos.findAll(); }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Curso criar(@Valid @RequestBody CursoRequest r) { return cursos.save(new Curso(r.nome(), r.creditos())); }

    @PutMapping("/{id}")
    public Curso atualizar(@PathVariable String id, @Valid @RequestBody CursoRequest r) {
        Curso c = cursos.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Curso não encontrado"));
        c.setNome(r.nome()); c.setCreditos(r.creditos());
        return cursos.save(c);
    }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable String id) {
        if (disciplinas.existsByCursoId(id)) throw new RegraNegocioException("Curso possui disciplinas vinculadas.");
        cursos.deleteById(id);
    }
}
