package br.pucminas.matriculas.repository;

import br.pucminas.matriculas.model.Perfil;
import br.pucminas.matriculas.model.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    Optional<Usuario> findByLogin(String login);
    boolean existsByLogin(String login);
    List<Usuario> findByPerfil(Perfil perfil);
}
