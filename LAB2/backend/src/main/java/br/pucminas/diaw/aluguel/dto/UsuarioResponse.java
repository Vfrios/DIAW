package br.pucminas.diaw.aluguel.dto;

import br.pucminas.diaw.aluguel.model.Papel;
import br.pucminas.diaw.aluguel.model.Usuario;

/** clienteId e nulo enquanto o cliente ainda nao cadastrou seu perfil (ou para agentes). */
public record UsuarioResponse(Long id, String login, String nome, Papel papel, Long clienteId) {
    public static UsuarioResponse de(Usuario u, Long clienteId) {
        return new UsuarioResponse(u.getId(), u.getLogin(), u.getNome(), u.getPapel(), clienteId);
    }
}
