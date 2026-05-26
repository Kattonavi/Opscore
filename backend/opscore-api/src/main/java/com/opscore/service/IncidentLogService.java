package com.opscore.service;

import com.opscore.dto.incident.IncidentTimelineResponseDTO;
import com.opscore.entity.Incident;
import com.opscore.enums.IncidentAction;
import com.opscore.entity.User;

import java.util.List;

public interface IncidentLogService {
    void logAction(
            Incident incident,
            User user,
            IncidentAction action,
            String comment
    );

    List<IncidentTimelineResponseDTO> getIncidentTimeline(Long incidentId);

    IncidentTimelineResponseDTO addAnnotation(Long incidentId, String comment);
}
