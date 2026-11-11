package com.pokedex.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pokedex.model.Pokemon;
import com.pokedex.model.PokemonType;
import com.pokedex.model.Trainer;
import com.pokedex.repository.PokemonRepository;
import com.pokedex.repository.TrainerRepository;
import com.pokedex.repository.TypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

/**
 * Popula o MongoDB com os dados do Script_Pokedex.sql (convertidos para JSON em
 * src/main/resources/seed). Só insere em coleções que estejam vazias.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final PokemonRepository pokemons;
    private final TypeRepository types;
    private final TrainerRepository trainers;
    private final ObjectMapper mapper;

    @Value("${app.seed.enabled:true}")
    private boolean enabled;

    public DataSeeder(PokemonRepository pokemons, TypeRepository types,
                      TrainerRepository trainers, ObjectMapper mapper) {
        this.pokemons = pokemons;
        this.types = types;
        this.trainers = trainers;
        this.mapper = mapper;
    }

    @Override
    public void run(String... args) throws IOException {
        if (!enabled) {
            return;
        }
        seed(pokemons, "seed/pokemons.json", new TypeReference<List<Pokemon>>() {});
        seed(types, "seed/types.json", new TypeReference<List<PokemonType>>() {});
        seed(trainers, "seed/trainers.json", new TypeReference<List<Trainer>>() {});
    }

    private <T> void seed(MongoRepository<T, Integer> repo, String file, TypeReference<List<T>> ref)
            throws IOException {
        if (repo.count() > 0) {
            return;
        }
        List<T> items = mapper.readValue(new ClassPathResource(file).getInputStream(), ref);
        repo.saveAll(items);
        log.info("Seed: {} documentos inseridos a partir de {}", items.size(), file);
    }
}
