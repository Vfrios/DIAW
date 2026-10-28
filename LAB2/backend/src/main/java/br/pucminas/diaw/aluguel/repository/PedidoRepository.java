package br.pucminas.diaw.aluguel.repository;

import br.pucminas.diaw.aluguel.model.PedidoAluguel;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<PedidoAluguel, Long> {
    List<PedidoAluguel> findAllByOrderByIdDesc();
    List<PedidoAluguel> findByClienteUsuarioIdOrderByIdDesc(Long usuarioId);
    boolean existsByClienteId(Long clienteId);
}
