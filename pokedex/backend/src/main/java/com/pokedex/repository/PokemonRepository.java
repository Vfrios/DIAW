package com.pokedex.repository;

import com.pokedex.model.Pokemon;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PokemonRepository extends MongoRepository<Pokemon, Integer> {

    Optional<Pokemon> findTopByOrderByIdDesc();

    List<Pokemon> findByNameContainingIgnoreCase(String name, Sort sort);

    List<Pokemon> findByTypes(String type, Sort sort);

    List<Pokemon> findByNameContainingIgnoreCaseAndTypes(String name, String type, Sort sort);
}
