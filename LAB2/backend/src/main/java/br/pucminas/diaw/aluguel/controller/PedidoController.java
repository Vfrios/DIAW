package br.pucminas.diaw.aluguel.controller;

import br.pucminas.diaw.aluguel.dto.*;
import br.pucminas.diaw.aluguel.security.AuthInterceptor;
import br.pucminas.diaw.aluguel.security.AuthUser;
import br.pucminas.diaw.aluguel.service.PedidoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    @GetMapping
    public List<PedidoResponse> listar(@RequestAttribute(AuthInterceptor.ATTR) AuthUser user) {
        return service.listar(user);
    }

    @GetMapping("/{id}")
    public PedidoResponse buscar(@PathVariable Long id, @RequestAttribute(AuthInterceptor.ATTR) AuthUser user) {
        return service.buscar(id, user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoResponse criar(@Valid @RequestBody PedidoRequest r,
                                @RequestAttribute(AuthInterceptor.ATTR) AuthUser user) {
        return service.criar(r, user);
    }

    @PutMapping("/{id}")
    public PedidoResponse atualizar(@PathVariable Long id, @Valid @RequestBody PedidoRequest r,
                                    @RequestAttribute(AuthInterceptor.ATTR) AuthUser user) {
        return service.atualizar(id, r, user);
    }

    @PostMapping("/{id}/cancelar")
    public PedidoResponse cancelar(@PathVariable Long id, @RequestAttribute(AuthInterceptor.ATTR) AuthUser user) {
        return service.cancelar(id, user);
    }

    @PostMapping("/{id}/avaliacao")
    public PedidoResponse avaliar(@PathVariable Long id, @Valid @RequestBody AvaliacaoRequest r,
                                  @RequestAttribute(AuthInterceptor.ATTR) AuthUser user) {
        return service.avaliar(id, r, user);
    }

    @PostMapping("/{id}/contrato")
    public PedidoResponse contratar(@PathVariable Long id, @RequestAttribute(AuthInterceptor.ATTR) AuthUser user) {
        return service.contratar(id, user);
    }

    @PutMapping("/{id}/credito")
    public PedidoResponse credito(@PathVariable Long id, @Valid @RequestBody CreditoRequest r,
                                  @RequestAttribute(AuthInterceptor.ATTR) AuthUser user) {
        return service.registrarCredito(id, r, user);
    }
}
