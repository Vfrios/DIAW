package br.pucminas.diaw.aluguel.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
            "/",
            "/login",
            "/cadastro",
            "/clientes",
            "/pedidos",
            "/pedidos/novo",
            "/pedidos/{id}",
            "/pedidos/{id}/editar"
    })
    public String forwardToFrontend() {
        return "forward:/index.html";
    }
}
