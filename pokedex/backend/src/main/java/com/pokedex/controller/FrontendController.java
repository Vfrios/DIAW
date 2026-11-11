package com.pokedex.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Entrega a interface compilada junto da API no deploy. */
@Controller
public class FrontendController {
    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }
}
