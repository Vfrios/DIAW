package br.pucminas.matriculas.repository;

import br.pucminas.matriculas.model.PeriodoMatricula;
import br.pucminas.matriculas.model.StatusPeriodo;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PeriodoMatriculaRepository extends MongoRepository<PeriodoMatricula, String> {
    Optional<PeriodoMatricula> findFirstByStatus(StatusPeriodo status);
    boolean existsByStatus(StatusPeriodo status);
}
