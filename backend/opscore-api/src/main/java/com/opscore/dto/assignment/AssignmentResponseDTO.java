package com.opscore.dto.assignment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class AssignmentResponseDTO {
    private Long id;
    private Long incidentId;
    private Long assignedToId;
    private String assignedToName;
    private Long assignedById;
    private String assignedByName;
    private LocalDateTime assignedAt;
}

