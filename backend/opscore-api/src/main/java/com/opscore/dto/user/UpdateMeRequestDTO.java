package com.opscore.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Payload accepted by <code>PATCH /users/me</code>.
 *
 * <p>Only the safe-to-edit identity fields are exposed here. Role, email,
 * activation state and password are <b>never</b> mutable through this
 * endpoint — those go through dedicated admin-only endpoints.
 *
 * <p>The name regex allows letters (including accents and ñ), single
 * spaces, hyphens and apostrophes between word parts. Digits are
 * explicitly rejected.
 */
@Data
public class UpdateMeRequestDTO {

    public static final String NAME_REGEX =
            "^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$";

    public static final String NAME_MESSAGE =
            "El nombre solo puede contener letras, espacios, guiones o apóstrofes.";

    @NotBlank(message = "El nombre no puede estar vacío.")
    @Size(max = 60, message = "El nombre debe tener como máximo 60 caracteres.")
    @Pattern(regexp = NAME_REGEX, message = NAME_MESSAGE)
    private String firstName;

    @NotBlank(message = "El apellido no puede estar vacío.")
    @Size(max = 60, message = "El apellido debe tener como máximo 60 caracteres.")
    @Pattern(regexp = NAME_REGEX, message = NAME_MESSAGE)
    private String lastName;
}
