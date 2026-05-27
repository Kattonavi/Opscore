package com.opscore.service.impl;

import com.opscore.dto.incident.IncidentTimelineResponseDTO;
import com.opscore.entity.Incident;
import com.opscore.enums.IncidentAction;
import com.opscore.entity.IncidentLog;
import com.opscore.entity.User;
import com.opscore.exception.ResourceNotFoundException;
import com.opscore.repository.IncidentLogRepository;
import com.opscore.repository.IncidentRepository;
import com.opscore.security.CurrentUserService;
import com.opscore.security.IncidentAccessService;
import com.opscore.service.IncidentLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class IncidentLogServiceImpl implements IncidentLogService {
    private final IncidentLogRepository incidentLogRepository;
    private final IncidentRepository incidentRepository;
    private final CurrentUserService currentUserService;
    private final IncidentAccessService incidentAccessService;

    @Override
    public void logAction(
            Incident incident,
            User user,
            IncidentAction action,
            String comment
    ) {
        IncidentLog log = IncidentLog.builder()
                .incident(incident)
                .user(user)
                .action(action)
                .comment(comment)
                .createdAt(LocalDateTime.now())
                .build();
        incidentLogRepository.save(log);
    }

    @Override
    public List<IncidentTimelineResponseDTO> getIncidentTimeline(Long incidentId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Incidente no encontrado"));
        incidentAccessService.assertCanViewIncident(
                currentUserService.getCurrentUser(),
                incident
        );
        List<IncidentLog> logs =
                incidentLogRepository.findByIncidentOrderByCreatedAtAsc(incident);
        return logs.stream()
                .map(this::mapToTimelineDTO)
                .toList();
    }

    @Override
    public IncidentTimelineResponseDTO addAnnotation(Long incidentId, String comment) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Incidente no encontrado"));
        User currentUser = currentUserService.getCurrentUser();
        incidentAccessService.assertCanViewIncident(currentUser, incident);

        IncidentLog log = IncidentLog.builder()
                .incident(incident)
                .user(currentUser)
                .action(IncidentAction.COMMENT_ADDED)
                .comment(comment)
                .createdAt(LocalDateTime.now())
                .build();
        IncidentLog saved = incidentLogRepository.save(log);

        return mapToTimelineDTO(saved);
    }

    private IncidentTimelineResponseDTO mapToTimelineDTO(IncidentLog log) {
        return new IncidentTimelineResponseDTO(
                log.getId(),
                log.getAction(),
                log.getUser() != null
                        ? log.getUser().getId()
                        : null,
                log.getUser() != null
                        ? log.getUser().getFirstName()
                        : "System",
                log.getComment(),
                log.getCreatedAt()
        );
    }

}
