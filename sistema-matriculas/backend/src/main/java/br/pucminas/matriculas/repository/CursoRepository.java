package br.pucminas.matriculas.repository;

import br.pucminas.matriculas.model.Curso;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CursoRepository extends MongoRepository<Curso, String> {}
