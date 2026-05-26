package com.opscore.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordDTO {

    @NotBlank
    private String currentPassword;

    @NotBlank
    private String newPassword;
}

