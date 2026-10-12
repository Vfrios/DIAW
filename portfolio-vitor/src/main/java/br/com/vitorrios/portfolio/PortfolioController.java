package br.com.vitorrios.portfolio;

import java.io.IOException;

import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/** Entrega o conteúdo do portfólio (portfolio.json) para o React. */
@RestController
public class PortfolioController {

    private final JsonNode conteudo;

    public PortfolioController(ObjectMapper mapper) throws IOException {
        try (var in = new ClassPathResource("portfolio.json").getInputStream()) {
            this.conteudo = mapper.readTree(in);
        }
    }

    @GetMapping("/api/portfolio")
    public JsonNode portfolio() {
        return conteudo;
    }
}
