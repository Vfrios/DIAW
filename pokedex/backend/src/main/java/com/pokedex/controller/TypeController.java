package com.pokedex.controller;

import com.pokedex.model.PokemonType;
import com.pokedex.repository.TypeRepository;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/types")
public class TypeController {

    private final TypeRepository repository;

    public TypeController(TypeRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<PokemonType> list() {
        return repository.findAll(Sort.by("id"));
    }
}
