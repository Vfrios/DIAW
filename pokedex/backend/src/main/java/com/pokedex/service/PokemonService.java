package com.pokedex.service;

import com.pokedex.model.Pokemon;
import com.pokedex.repository.PokemonRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PokemonService {

    private static final Sort BY_ID = Sort.by("id");

    private final PokemonRepository repository;

    public PokemonService(PokemonRepository repository) {
        this.repository = repository;
    }

    /** Lista todos; aceita filtros opcionais por nome (parcial) e por tipo. */
    public List<Pokemon> findAll(String name, String type) {
        boolean hasName = name != null && !name.isBlank();
        boolean hasType = type != null && !type.isBlank();
        if (hasName && hasType) {
            return repository.findByNameContainingIgnoreCaseAndTypes(name.trim(), normalizeType(type), BY_ID);
        }
        if (hasName) {
            return repository.findByNameContainingIgnoreCase(name.trim(), BY_ID);
        }
        if (hasType) {
            return repository.findByTypes(normalizeType(type), BY_ID);
        }
        return repository.findAll(BY_ID);
    }

    public Pokemon findById(Integer id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Pokémon " + id + " não encontrado"));
    }

    public Pokemon create(Pokemon pokemon) {
        if (pokemon.getId() != null && repository.existsById(pokemon.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um Pokémon com o id " + pokemon.getId());
        }
        if (pokemon.getId() == null) {
            int next = repository.findTopByOrderByIdDesc().map(p -> p.getId() + 1).orElse(1);
            pokemon.setId(next);
        }
        return repository.save(pokemon);
    }

    public Pokemon update(Integer id, Pokemon pokemon) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pokémon " + id + " não encontrado");
        }
        pokemon.setId(id);
        return repository.save(pokemon);
    }

    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pokémon " + id + " não encontrado");
        }
        repository.deleteById(id);
    }

    private String normalizeType(String type) {
        String t = type.trim().toLowerCase();
        return t.substring(0, 1).toUpperCase() + t.substring(1);
    }
}
