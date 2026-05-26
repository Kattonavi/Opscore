package com.opscore.dto.incident;

import com.opscore.enums.IncidentAction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentTimelineResponseDTO {
    private Long id;
    private IncidentAction action;
    private Long userId;
    private String userName;
    private String comment;
    private LocalDateTime createdAt;
}
