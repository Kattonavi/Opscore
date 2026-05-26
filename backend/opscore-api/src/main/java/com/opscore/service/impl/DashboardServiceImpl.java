package com.opscore.service.impl;

import com.opscore.dto.incident.IncidentStatusMetricsDTO;
import com.opscore.entity.Incident;
import com.opscore.enums.Priority;
import com.opscore.enums.IncidentStatus;
import com.opscore.repository.IncidentRepository;
import com.opscore.security.CurrentUserService;
import com.opscore.security.IncidentAccessService;
import com.opscore.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.opscore.dto.incident.IncidentPriorityMetricsDTO;

import com.opscore.dto.AreaMetricsDTO;
import java.util.List;
import java.util.Comparator;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    private final IncidentRepository incidentRepository;
    private final CurrentUserService currentUserService;
    private final IncidentAccessService incidentAccessService;

    @Override
    public IncidentStatusMetricsDTO getIncidentStatusMetrics() {
        List<Incident> incidents = getVisibleIncidents();
        return new IncidentStatusMetricsDTO(
                incidents.size(),
                countByStatus(incidents, IncidentStatus.OPEN),
                countByStatus(incidents, IncidentStatus.ASSIGNED),
                countByStatus(incidents, IncidentStatus.IN_PROGRESS),
                countByStatus(incidents, IncidentStatus.ON_HOLD),
                countByStatus(incidents, IncidentStatus.RESOLVED),
                countByStatus(incidents, IncidentStatus.CLOSED),
                countByStatus(incidents, IncidentStatus.CANCELED)
        );
    }

    @Override
    public IncidentPriorityMetricsDTO getIncidentPriorityMetrics() {
        List<Incident> incidents = getVisibleIncidents();
        return new IncidentPriorityMetricsDTO(
                countByPriority(incidents, Priority.LOW),
                countByPriority(incidents, Priority.MEDIUM),
                countByPriority(incidents, Priority.HIGH),
                countByPriority(incidents, Priority.CRITICAL)
               // incidentRepository.countByPriority(Priority.EMERGENCY)
        );
    }

    @Override
    public List<AreaMetricsDTO> getAreaMetrics() {
        Map<String, Long> counts = getVisibleIncidents().stream()
                .filter(incident -> incident.getArea() != null)
                .collect(Collectors.groupingBy(
                        incident -> incident.getArea().getName(),
                        Collectors.counting()
                ));

        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .map(entry -> new AreaMetricsDTO(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<Incident> getVisibleIncidents() {
        return incidentRepository.findAll(
                incidentAccessService.visibleTo(currentUserService.getCurrentUser())
        );
    }

    private long countByStatus(List<Incident> incidents, IncidentStatus status) {
        return incidents.stream()
                .filter(incident -> incident.getStatus() == status)
                .count();
    }

    private long countByPriority(List<Incident> incidents, Priority priority) {
        return incidents.stream()
                .filter(incident -> incident.getPriority() == priority)
                .count();
    }
}
