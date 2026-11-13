package br.pucminas.matriculas.controller;

import br.pucminas.matriculas.dto.Dtos.*;
import br.pucminas.matriculas.model.PeriodoMatricula;
import br.pucminas.matriculas.service.PeriodoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/periodos")
public class PeriodoController {
    private final PeriodoService service;
    public PeriodoController(PeriodoService service) { this.service = service; }

    @GetMapping public List<PeriodoMatricula> listar() { return service.listar(); }

    /** Periodo de matriculas em vigor (204 se nao houver). Acessivel a qualquer usuario autenticado. */
    @GetMapping("/aberto")
    public ResponseEntity<PeriodoMatricula> aberto() {
        return service.aberto().map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public PeriodoMatricula abrir(@Valid @RequestBody PeriodoRequest r) { return service.abrir(r); }

    @PostMapping("/{id}/encerrar")
    public ResultadoEncerramento encerrar(@PathVariable String id) { return service.encerrar(id); }
}
