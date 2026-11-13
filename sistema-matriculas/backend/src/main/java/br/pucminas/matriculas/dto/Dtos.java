package br.pucminas.matriculas.dto;

import br.pucminas.matriculas.model.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

/** Todos os DTOs da API agrupados (records). */
public final class Dtos {
    private Dtos() {}

    public record UsuarioRequest(@NotBlank String nome, @NotBlank String login, String senha,
                                 @NotNull Perfil perfil, String cursoId) {}
    public record UsuarioResponse(String id, String nome, String login, Perfil perfil, String cursoId) {
        public static UsuarioResponse de(Usuario u) {
            return new UsuarioResponse(u.getId(), u.getNome(), u.getLogin(), u.getPerfil(), u.getCursoId());
        }
    }
    public record CursoRequest(@NotBlank String nome, @Positive int creditos) {}
    public record DisciplinaRequest(@NotBlank String codigo, @NotBlank String nome, @Positive int creditos,
                                    @NotBlank String cursoId, @NotBlank String professorId, @NotBlank String semestre) {}
    public record DisciplinaResponse(String id, String codigo, String nome, int creditos, String cursoId,
                                     String professorId, String professorNome, String semestre,
                                     StatusDisciplina status, long inscritos, int maxAlunos) {}
    public record PeriodoRequest(@NotBlank String semestre, @NotNull LocalDate inicio, @NotNull LocalDate fim) {}
    public record ResultadoEncerramento(List<String> ativas, List<String> canceladas) {}
    public record MatriculaRequest(@NotBlank String disciplinaId, @NotNull TipoMatricula tipo) {}
    public record MatriculaResponse(String id, String disciplinaId, String codigo, String disciplinaNome,
                                    int creditos, String semestre, TipoMatricula tipo, StatusMatricula status) {}
    public record AlunoMatriculadoResponse(String matriculaId, String alunoId, String nome, String login,
                                           TipoMatricula tipo) {}
}
