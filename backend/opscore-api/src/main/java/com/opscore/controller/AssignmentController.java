package com.opscore.controller;

import com.opscore.dto.assignment.AssignmentRequestDTO;
import com.opscore.dto.incident.IncidentResponseDTO;
import com.opscore.service.AssignmentService;
import com.opscore.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/incidents")
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final IncidentService incidentService;

    public AssignmentController(AssignmentService assignmentService,
                                IncidentService incidentService) {
        this.assignmentService = assignmentService;
        this.incidentService = incidentService;
    }

    //@PreAuthorize("hasRole('SUPERVISOR')")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPERVISOR')")
    @PostMapping("/{id}/assign")
    public ResponseEntity<IncidentResponseDTO> assignIncident(
            @PathVariable Long id,
            @Valid @RequestBody AssignmentRequestDTO request
    ) {
        assignmentService.assignIncident(id, request);
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }
}
