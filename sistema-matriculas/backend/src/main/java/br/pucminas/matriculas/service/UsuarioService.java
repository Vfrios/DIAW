package br.pucminas.matriculas.service;

import br.pucminas.matriculas.dto.Dtos.UsuarioRequest;
import br.pucminas.matriculas.exception.*;
import br.pucminas.matriculas.model.*;
import br.pucminas.matriculas.repository.*;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarios;
    private final CursoRepository cursos;
    private final DisciplinaRepository disciplinas;
    private final MatriculaRepository matriculas;
    private final PasswordEncoder encoder;

    public UsuarioService(UsuarioRepository usuarios, CursoRepository cursos, DisciplinaRepository disciplinas,
                          MatriculaRepository matriculas, PasswordEncoder encoder) {
        this.usuarios = usuarios; this.cursos = cursos; this.disciplinas = disciplinas;
        this.matriculas = matriculas; this.encoder = encoder;
    }

    public Usuario buscarPorLogin(String login) {
        return usuarios.findByLogin(login).orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
    }

    public List<Usuario> listar(Perfil perfil) { return perfil == null ? usuarios.findAll() : usuarios.findByPerfil(perfil); }

    public Usuario criar(UsuarioRequest r) {
        if (r.senha() == null || r.senha().length() < 6) throw new RegraNegocioException("A senha deve ter ao menos 6 caracteres.");
        if (usuarios.existsByLogin(r.login())) throw new RegraNegocioException("Login já utilizado.");
        validarCurso(r);
        return usuarios.save(new Usuario(r.nome(), r.login(), encoder.encode(r.senha()), r.perfil(),
                r.perfil() == Perfil.ALUNO ? r.cursoId() : null));
    }

    public Usuario atualizar(String id, UsuarioRequest r) {
        Usuario u = usuarios.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
        if (!u.getLogin().equals(r.login()) && usuarios.existsByLogin(r.login())) throw new RegraNegocioException("Login já utilizado.");
        validarCurso(r);
        u.setNome(r.nome()); u.setLogin(r.login()); u.setPerfil(r.perfil());
        u.setCursoId(r.perfil() == Perfil.ALUNO ? r.cursoId() : null);
        if (r.senha() != null && !r.senha().isBlank()) {
            if (r.senha().length() < 6) throw new RegraNegocioException("A senha deve ter ao menos 6 caracteres.");
            u.setSenhaHash(encoder.encode(r.senha()));
        }
        return usuarios.save(u);
    }

    public void remover(String id) {
        Usuario u = usuarios.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
        if (u.getPerfil() == Perfil.PROFESSOR && disciplinas.existsByProfessorId(id))
            throw new RegraNegocioException("Professor possui disciplinas vinculadas.");
        if (u.getPerfil() == Perfil.ALUNO &&
                !matriculas.findByAlunoIdAndStatus(id, StatusMatricula.ATIVA).isEmpty())
            throw new RegraNegocioException("Aluno possui matrículas ativas.");
        usuarios.deleteById(id);
    }

    private void validarCurso(UsuarioRequest r) {
        if (r.perfil() == Perfil.ALUNO && (r.cursoId() == null || !cursos.existsById(r.cursoId())))
            throw new RegraNegocioException("Informe um curso válido para o aluno.");
    }
}
