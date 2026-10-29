package br.pucminas.diaw.aluguel.security;

import br.pucminas.diaw.aluguel.model.Papel;

/** Usuario autenticado extraido do token e disponibilizado aos controllers. */
public record AuthUser(Long id, Papel papel) {
    public boolean isAgente() {
        return papel.isAgente();
    }
}
