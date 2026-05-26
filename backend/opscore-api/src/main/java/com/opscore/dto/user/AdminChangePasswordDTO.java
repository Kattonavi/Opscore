package com.opscore.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Payload accepted by <code>PATCH /users/{userId}/change-password</code>.
 *
 * <p>Only the new password is required — the current password is not asked
 * for because this endpoint is used by administrators (and supervisors,
 * scoped to their own area) to reset another user's credentials, not by
 * the owner of the account. For self-service password change, see
 * {@link ChangePasswordDTO}.
 */
@Data
public class AdminChangePasswordDTO {

    @NotBlank(message = "La nueva contraseña es requerida.")
    @Size(min = 8, message = "La nueva contraseña debe tener al menos 8 caracteres.")
    private String newPassword;
}
