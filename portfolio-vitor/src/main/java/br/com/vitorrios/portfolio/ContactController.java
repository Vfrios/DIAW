package br.com.vitorrios.portfolio;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/** Recebe o formulário de contato e envia o e-mail via SMTP. */
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final JavaMailSender mailSender;
    private final String remetente;
    private final String senha;
    private final String destino;

    public ContactController(JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String remetente,
            @Value("${spring.mail.password:}") String senha,
            @Value("${portfolio.contact.to:}") String destino) {
        this.mailSender = mailSender;
        this.remetente = remetente;
        this.senha = senha;
        this.destino = destino;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> enviar(@Valid @RequestBody ContactRequest req) {
        if (remetente.isBlank() || senha.isBlank() || destino.isBlank()) {
            return resposta(HttpStatus.SERVICE_UNAVAILABLE, "not_configured");
        }

        var mensagem = new SimpleMailMessage();
        mensagem.setFrom(remetente);
        mensagem.setTo(destino);
        mensagem.setReplyTo(req.email());
        mensagem.setSubject("Portfólio: mensagem de " + req.name());
        mensagem.setText("Nome: " + req.name() + "\nE-mail: " + req.email() + "\n\n" + req.message());

        try {
            mailSender.send(mensagem);
            return resposta(HttpStatus.OK, "sent");
        } catch (MailException e) {
            return resposta(HttpStatus.BAD_GATEWAY, "send_failed");
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> invalido() {
        return resposta(HttpStatus.BAD_REQUEST, "invalid");
    }

    private ResponseEntity<Map<String, String>> resposta(HttpStatus status, String codigo) {
        return ResponseEntity.status(status).body(Map.of("status", codigo));
    }
}
