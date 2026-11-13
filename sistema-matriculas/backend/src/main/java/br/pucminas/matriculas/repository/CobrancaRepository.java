package br.pucminas.matriculas.repository;

import br.pucminas.matriculas.model.Cobranca;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CobrancaRepository extends MongoRepository<Cobranca, String> {
    Optional<Cobranca> findByAlunoIdAndSemestre(String alunoId, String semestre);
    List<Cobranca> findByAlunoId(String alunoId);
}
