package com.opscore.dto.incident;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnotationRequestDTO {

    @NotBlank(message = "comment is required")
    private String comment;
}
