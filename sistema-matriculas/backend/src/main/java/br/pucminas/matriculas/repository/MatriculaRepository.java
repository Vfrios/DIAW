package br.pucminas.matriculas.repository;

import br.pucminas.matriculas.model.Matricula;
import br.pucminas.matriculas.model.StatusMatricula;
import br.pucminas.matriculas.model.TipoMatricula;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MatriculaRepository extends MongoRepository<Matricula, String> {
    List<Matricula> findByAlunoIdAndStatus(String alunoId, StatusMatricula status);
    List<Matricula> findByAlunoIdAndSemestreAndStatus(String alunoId, String semestre, StatusMatricula status);
    List<Matricula> findByDisciplinaIdAndStatus(String disciplinaId, StatusMatricula status);
    long countByDisciplinaIdAndStatus(String disciplinaId, StatusMatricula status);
    long countByAlunoIdAndSemestreAndTipoAndStatus(String alunoId, String semestre, TipoMatricula tipo, StatusMatricula status);
    boolean existsByAlunoIdAndDisciplinaIdAndStatus(String alunoId, String disciplinaId, StatusMatricula status);
}
