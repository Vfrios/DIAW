package br.pucminas.matriculas.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Permite abrir e recarregar as rotas do React sem perder o subcaminho. */
@Controller
public class FrontendController {
    @GetMapping({"/", "/login", "/aluno", "/professor", "/secretaria"})
    public String index() {
        return "forward:/index.html";
    }
}
