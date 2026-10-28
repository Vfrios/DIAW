package br.pucminas.diaw.aluguel.repository;

import br.pucminas.diaw.aluguel.model.Cliente;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByUsuarioId(Long usuarioId);
    Optional<Cliente> findByCpf(String cpf);
}
