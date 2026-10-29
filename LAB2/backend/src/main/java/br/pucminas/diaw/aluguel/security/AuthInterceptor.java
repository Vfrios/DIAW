package br.pucminas.diaw.aluguel.security;

import br.pucminas.diaw.aluguel.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/** Exige login (Bearer token) em todas as rotas /api/** exceto login e cadastro. */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String ATTR = "authUser";

    private final TokenService tokens;

    public AuthInterceptor(TokenService tokens) {
        this.tokens = tokens;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            return true;
        }
        String h = req.getHeader("Authorization");
        if (h == null || !h.startsWith("Bearer ")) {
            throw ApiException.unauthorized("Autenticacao obrigatoria");
        }
        req.setAttribute(ATTR, tokens.validar(h.substring(7)));
        return true;
    }
}
