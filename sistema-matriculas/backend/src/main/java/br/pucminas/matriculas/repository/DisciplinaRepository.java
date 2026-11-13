package br.pucminas.matriculas.repository;

import br.pucminas.matriculas.model.Disciplina;
import br.pucminas.matriculas.model.StatusDisciplina;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DisciplinaRepository extends MongoRepository<Disciplina, String> {
    List<Disciplina> findBySemestre(String semestre);
    List<Disciplina> findByCursoId(String cursoId);
    List<Disciplina> findByProfessorId(String professorId);
    List<Disciplina> findBySemestreAndStatus(String semestre, StatusDisciplina status);
    boolean existsByCursoId(String cursoId);
    boolean existsByProfessorId(String professorId);
}
