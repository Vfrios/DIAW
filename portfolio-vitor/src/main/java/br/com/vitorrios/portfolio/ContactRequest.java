package br.com.vitorrios.portfolio;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Dados enviados pelo formulário de contato. */
public record ContactRequest(
        @NotBlank @Size(min = 2, max = 100) @Pattern(regexp = "[^\\r\\n]*") String name,
        @NotBlank @Email @Size(max = 200) @Pattern(regexp = "[^\\r\\n]*") String email,
        @NotBlank @Size(min = 10, max = 3000) String message) {
}
