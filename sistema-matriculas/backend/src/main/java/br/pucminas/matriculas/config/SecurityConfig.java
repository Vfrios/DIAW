package br.pucminas.matriculas.config;

import br.pucminas.matriculas.repository.UsuarioRepository;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Autenticacao stateless (HTTP Basic sobre HTTPS em producao) com senhas BCrypt guardadas no MongoDB.
 * Autorizacao por perfil: ALUNO, PROFESSOR e SECRETARIA.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/", "/index.html", "/assets/**", "/login", "/aluno", "/professor", "/secretaria").permitAll()
                .requestMatchers("/api/auth/**").authenticated()
                .requestMatchers("/api/matriculas/**", "/api/cobrancas/minhas").hasRole("ALUNO")
                .requestMatchers("/api/professor/**").hasRole("PROFESSOR")
                .requestMatchers(HttpMethod.GET, "/api/disciplinas/*/alunos").hasAnyRole("PROFESSOR", "SECRETARIA")
                .requestMatchers(HttpMethod.GET, "/api/cursos", "/api/disciplinas", "/api/periodos/aberto").authenticated()
                .requestMatchers("/api/cursos/**", "/api/disciplinas/**", "/api/usuarios/**",
                                 "/api/periodos/**", "/api/cobrancas/**").hasRole("SECRETARIA")
                .anyRequest().authenticated())
            .httpBasic(b -> b.authenticationEntryPoint((req, res, ex) -> {
                res.setStatus(401);
                res.setCharacterEncoding("UTF-8");
                res.setContentType("application/json");
                res.getWriter().write("{\"erro\":\"Login ou senha inválidos\"}");
            }));
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    UserDetailsService userDetailsService(UsuarioRepository repo) {
        return login -> repo.findByLogin(login)
                .map(u -> User.withUsername(u.getLogin()).password(u.getSenhaHash()).roles(u.getPerfil().name()).build())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origins}") String origins) {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).toList());
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/api/**", cfg);
        return src;
    }
}
