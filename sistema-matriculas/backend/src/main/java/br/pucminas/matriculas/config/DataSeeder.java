package br.pucminas.matriculas.config;

import br.pucminas.matriculas.model.*;
import br.pucminas.matriculas.repository.*;
import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Popula o banco com dados de demonstracao na primeira execucao (colecao de usuarios vazia). */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UsuarioRepository usuarios;
    private final CursoRepository cursos;
    private final DisciplinaRepository disciplinas;
    private final PeriodoMatriculaRepository periodos;
    private final PasswordEncoder encoder;

    public DataSeeder(UsuarioRepository usuarios, CursoRepository cursos, DisciplinaRepository disciplinas,
                      PeriodoMatriculaRepository periodos, PasswordEncoder encoder) {
        this.usuarios = usuarios; this.cursos = cursos; this.disciplinas = disciplinas;
        this.periodos = periodos; this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (usuarios.count() > 0) return;

        Curso es = cursos.save(new Curso("Engenharia de Software", 240));
        usuarios.save(new Usuario("Secretaria Geral", "secretaria", encoder.encode("secretaria123"), Perfil.SECRETARIA, null));
        Usuario p1 = usuarios.save(new Usuario("Prof. João Aramuni", "prof.aramuni", encoder.encode("prof123"), Perfil.PROFESSOR, null));
        Usuario p2 = usuarios.save(new Usuario("Profa. Maria Souza", "prof.maria", encoder.encode("prof123"), Perfil.PROFESSOR, null));
        for (int i = 1; i <= 6; i++)
            usuarios.save(new Usuario("Aluno " + i, "aluno" + i, encoder.encode("aluno123"), Perfil.ALUNO, es.getId()));

        String semestre = "2027.1";
        String[][] mat = {
            {"DIAW", "Desenvolvimento e Integração de Aplicações Web", "4"},
            {"ESOF", "Engenharia de Software", "4"},
            {"BD01", "Banco de Dados", "4"},
            {"ALG1", "Algoritmos e Estruturas de Dados", "4"},
            {"REDE", "Redes de Computadores", "4"},
            {"ARQ1", "Arquitetura de Computadores", "4"},
            {"OPT1", "Tópicos em Inteligência Artificial", "2"},
            {"OPT2", "Computação em Nuvem", "2"},
        };
        for (int i = 0; i < mat.length; i++) {
            Disciplina d = new Disciplina();
            d.setCodigo(mat[i][0]); d.setNome(mat[i][1]); d.setCreditos(Integer.parseInt(mat[i][2]));
            d.setCursoId(es.getId()); d.setProfessorId(i % 2 == 0 ? p1.getId() : p2.getId()); d.setSemestre(semestre);
            disciplinas.save(d);
        }
        periodos.save(new PeriodoMatricula(semestre, LocalDate.now(), LocalDate.now().plusDays(30)));
        log.info("Banco populado. Logins: secretaria/secretaria123, prof.aramuni/prof123, aluno1..aluno6/aluno123");
    }
}
