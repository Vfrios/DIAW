package com.pokedex.repository;

import com.pokedex.model.PokemonType;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TypeRepository extends MongoRepository<PokemonType, Integer> {
}
