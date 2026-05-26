package com.opscore.dto.assignment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignmentRequestDTO {

    @NotNull(message = "assignedToId is required")
    private Long assignedToId;

    // getters/setters
}
