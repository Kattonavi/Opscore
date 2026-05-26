package com.opscore.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordDTO {

    @NotBlank(message = "La contraseña actual es requerida.")
    private String currentPassword;

    @NotBlank(message = "La nueva contraseña es requerida.")
    @Size(min = 8, message = "La nueva contraseña debe tener al menos 8 caracteres.")
    private String newPassword;
}

