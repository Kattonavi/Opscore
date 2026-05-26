package com.opscore.controller;

import com.opscore.dto.assignment.AssignmentResponseDTO;
import com.opscore.dto.incident.AnnotationRequestDTO;
import com.opscore.dto.incident.IncidentActionRequestDTO;
import com.opscore.dto.incident.IncidentRequestDTO;
import com.opscore.dto.incident.IncidentResponseDTO;
import com.opscore.dto.incident.IncidentTimelineResponseDTO;
import com.opscore.enums.IncidentStatus;
import com.opscore.enums.Priority;
import com.opscore.service.IncidentLogService;
import com.opscore.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springdoc.core.annotations.ParameterObject;

import java.util.List;

@RestController
@RequestMapping("/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;
    private final IncidentLogService incidentLogService;

    @PostMapping
    public ResponseEntity<IncidentResponseDTO> createIncident(
            @Valid @RequestBody IncidentRequestDTO request
    ) {
        IncidentResponseDTO response = incidentService.createIncident(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<IncidentResponseDTO>>
    getIncidents(
            @RequestParam(required = false)
            IncidentStatus status,
            @RequestParam(required = false)
            Priority priority,
            @RequestParam(required = false)
            Long areaId
    ) {
        return ResponseEntity.ok(
                incidentService.getFilteredIncidents(
                        status,
                        priority,
                        areaId
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponseDTO> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<List<AssignmentResponseDTO>> getAssignmentHistory(@PathVariable Long id) {

        List<AssignmentResponseDTO> history = incidentService.getAssignmentHistory(id);

        return ResponseEntity.ok(history);
    }

    //tecnico resuelve incidente
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN', 'MANAGER', 'SUPERVISOR')")
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<IncidentResponseDTO> resolveIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentActionRequestDTO body
    ) {
        return ResponseEntity.ok(
                incidentService.resolveIncident(id, body.getComment())
        );
    }

    //Start
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN', 'MANAGER', 'SUPERVISOR')")
    @PatchMapping("/{id}/start")
    public ResponseEntity<IncidentResponseDTO> startIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentActionRequestDTO body
    ) {
        return ResponseEntity.ok(
                incidentService.startIncident(id, body.getComment())
        );
    }

    //hold
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN', 'MANAGER', 'SUPERVISOR')")
    @PatchMapping("/{id}/hold")
    public ResponseEntity<IncidentResponseDTO> holdIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentActionRequestDTO body
    ) {
        return ResponseEntity.ok(
                incidentService.holdIncident(id, body.getComment())
        );
    }

    //cancel
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPERVISOR')")
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<IncidentResponseDTO> cancelIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentActionRequestDTO body
    ) {
        return ResponseEntity.ok(
                incidentService.cancelIncident(id, body.getComment())
        );
    }

    //close
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPERVISOR')")
    @PatchMapping("/{id}/close")
    public ResponseEntity<IncidentResponseDTO> closeIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentActionRequestDTO body
    ) {
        return ResponseEntity.ok(
                incidentService.closeIncident(id, body.getComment())
        );
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<IncidentTimelineResponseDTO>>
    getIncidentTimeline(@PathVariable Long id) {
        return ResponseEntity.ok(
                incidentLogService.getIncidentTimeline(id)
        );
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<IncidentResponseDTO>>
           getIncidentsPaginated(@ParameterObject Pageable pageable) {
            return ResponseEntity.ok(
                   incidentService.getIncidentsPaginated(pageable)
        );
    }

    @PostMapping("/{id}/annotations")
    public ResponseEntity<IncidentTimelineResponseDTO> addAnnotation(
            @PathVariable Long id,
            @Valid @RequestBody AnnotationRequestDTO request
    ) {
        return ResponseEntity.ok(
                incidentLogService.addAnnotation(id, request.getComment())
        );
    }

}

