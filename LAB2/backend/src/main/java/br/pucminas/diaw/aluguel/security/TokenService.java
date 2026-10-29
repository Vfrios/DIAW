package br.pucminas.diaw.aluguel.security;

import br.pucminas.diaw.aluguel.exception.ApiException;
import br.pucminas.diaw.aluguel.model.Papel;
import br.pucminas.diaw.aluguel.model.Usuario;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Gera e valida tokens JWT (HS256) sem dependencias externas. */
@Component
public class TokenService {

    private static final Pattern SUB = Pattern.compile("\"sub\":\"(\\d+)\"");
    private static final Pattern PAPEL = Pattern.compile("\"papel\":\"([A-Z]+)\"");
    private static final Pattern EXP = Pattern.compile("\"exp\":(\\d+)");

    private final byte[] key;
    private final long horas;

    public TokenService(@Value("${app.jwt.secret}") String secret,
                        @Value("${app.jwt.expiration-hours:8}") long horas) {
        this.key = secret.getBytes(StandardCharsets.UTF_8);
        if (key.length < 32) {
            throw new IllegalArgumentException("app.jwt.secret precisa ter ao menos 32 caracteres");
        }
        this.horas = horas;
    }

    public String gerar(Usuario u) {
        String header = b64("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        long exp = Instant.now().plusSeconds(horas * 3600).getEpochSecond();
        String payload = b64("{\"sub\":\"" + u.getId() + "\",\"papel\":\"" + u.getPapel() + "\",\"exp\":" + exp + "}");
        return header + "." + payload + "." + assinar(header + "." + payload);
    }

    public AuthUser validar(String token) {
        String[] partes = token.split("\\.");
        if (partes.length != 3) {
            throw ApiException.unauthorized("Token invalido");
        }
        byte[] esperado = assinar(partes[0] + "." + partes[1]).getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(esperado, partes[2].getBytes(StandardCharsets.UTF_8))) {
            throw ApiException.unauthorized("Token invalido");
        }
        try {
            String json = new String(Base64.getUrlDecoder().decode(partes[1]), StandardCharsets.UTF_8);
            long exp = Long.parseLong(extrair(EXP, json));
            if (Instant.now().getEpochSecond() > exp) {
                throw ApiException.unauthorized("Sessao expirada");
            }
            return new AuthUser(Long.parseLong(extrair(SUB, json)), Papel.valueOf(extrair(PAPEL, json)));
        } catch (IllegalArgumentException e) {
            throw ApiException.unauthorized("Token invalido");
        }
    }

    private static String extrair(Pattern p, String json) {
        Matcher m = p.matcher(json);
        if (!m.find()) {
            throw new IllegalArgumentException("claim ausente");
        }
        return m.group(1);
    }

    private static String b64(String s) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(s.getBytes(StandardCharsets.UTF_8));
    }

    private String assinar(String dados) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(dados.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
