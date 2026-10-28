package br.pucminas.diaw.aluguel.controller;

import br.pucminas.diaw.aluguel.dto.ClienteRequest;
import br.pucminas.diaw.aluguel.dto.ClienteResponse;
import br.pucminas.diaw.aluguel.security.AuthInterceptor;
import br.pucminas.diaw.aluguel.security.AuthUser;
import br.pucminas.diaw.aluguel.service.ClienteService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }

    @GetMapping
    public List<ClienteResponse> listar(@RequestAttribute(AuthInterceptor.ATTR) AuthUser user) {
        return service.listar(user);
    }

    @GetMapping("/{id}")
    public ClienteResponse buscar(@PathVariable Long id, @RequestAttribute(AuthInterceptor.ATTR) AuthUser user) {
        return service.buscar(id, user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteResponse criar(@Valid @RequestBody ClienteRequest r,
                                 @RequestAttribute(AuthInterceptor.ATTR) AuthUser user) {
        return service.criar(r, user);
    }

    @PutMapping("/{id}")
    public ClienteResponse atualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequest r,
                                     @RequestAttribute(AuthInterceptor.ATTR) AuthUser user) {
        return service.atualizar(id, r, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id, @RequestAttribute(AuthInterceptor.ATTR) AuthUser user) {
        service.excluir(id, user);
    }
}
