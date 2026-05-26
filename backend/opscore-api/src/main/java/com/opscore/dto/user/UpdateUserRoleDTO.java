package com.opscore.dto.user;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRoleDTO {

    @NotNull
    private Long roleId;
}


