package br.pucminas.matriculas;

import static org.junit.jupiter.api.Assertions.assertEquals;

import br.pucminas.matriculas.service.RegrasMatricula;
import org.junit.jupiter.api.Test;

class RegrasMatriculaTest {
    @Test
    void regrasDoProductOwner() {
        assertEquals(3, RegrasMatricula.MIN_ALUNOS_DISCIPLINA);
        assertEquals(60, RegrasMatricula.MAX_ALUNOS_DISCIPLINA);
        assertEquals(4, RegrasMatricula.MAX_OBRIGATORIAS);
        assertEquals(2, RegrasMatricula.MAX_OPTATIVAS);
    }
}
