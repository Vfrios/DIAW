package br.pucminas.diaw.aluguel.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import br.pucminas.diaw.aluguel.exception.ApiException;
import br.pucminas.diaw.aluguel.model.Papel;
import br.pucminas.diaw.aluguel.model.Usuario;
import org.junit.jupiter.api.Test;

class TokenServiceTest {

    private final TokenService service = new TokenService("uma-chave-de-teste-com-mais-de-32-caracteres", 1);

    private Usuario usuario() {
        Usuario u = new Usuario();
        u.setId(7L);
        u.setPapel(Papel.BANCO);
        return u;
    }

    @Test
    void geraEValidaToken() {
        AuthUser auth = service.validar(service.gerar(usuario()));
        assertEquals(7L, auth.id());
        assertEquals(Papel.BANCO, auth.papel());
    }

    @Test
    void rejeitaTokenAdulterado() {
        String token = service.gerar(usuario());
        String adulterado = token.substring(0, token.length() - 2) + "xx";
        assertThrows(ApiException.class, () -> service.validar(adulterado));
    }
}
