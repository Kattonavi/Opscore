package com.opscore.dto.incident;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IncidentActionRequestDTO {

    @NotBlank(message = "El comentario es obligatorio para cambiar el estado")
    private String comment;
}
