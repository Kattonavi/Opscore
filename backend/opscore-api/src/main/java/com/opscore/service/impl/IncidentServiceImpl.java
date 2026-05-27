package com.opscore.service.impl;

import com.opscore.dto.assignment.AssignmentResponseDTO;
import com.opscore.dto.incident.IncidentRequestDTO;
import com.opscore.dto.incident.IncidentResponseDTO;
import com.opscore.entity.Area;
import com.opscore.entity.Assignment;
import com.opscore.entity.Incident;
import com.opscore.entity.User;
import com.opscore.enums.IncidentAction;
import com.opscore.enums.IncidentStatus;
import com.opscore.enums.Priority;
import com.opscore.exception.BadRequestException;
import com.opscore.exception.ConflictException;
import com.opscore.exception.ResourceNotFoundException;
import com.opscore.repository.AreaRepository;
import com.opscore.repository.AssignmentRepository;
import com.opscore.repository.IncidentRepository;
import com.opscore.repository.UserRepository;
import com.opscore.security.CurrentUserService;
import com.opscore.security.IncidentAccessService;
import com.opscore.service.IncidentLogService;
import com.opscore.service.IncidentService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
//@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository    incidentRepository;
    private final AssignmentRepository  assignmentRepository;
    private final UserRepository        userRepository;
    private final AreaRepository        areaRepository;
    private final IncidentLogService    incidentLogService;
    private final CurrentUserService    currentUserService;
    private final IncidentAccessService incidentAccessService;


    public IncidentServiceImpl(IncidentRepository   incidentRepository,
                               AssignmentRepository assignmentRepository,
                               UserRepository       userRepository,
                               AreaRepository       areaRepository,
                               IncidentLogService   incidentLogService,
                               CurrentUserService   currentUserService,
                               IncidentAccessService incidentAccessService
    ) {
        this.incidentRepository   = incidentRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository       = userRepository;
        this.areaRepository       = areaRepository;
        this.incidentLogService   = incidentLogService;
        this.currentUserService   = currentUserService;
        this.incidentAccessService = incidentAccessService;

    }

    //helper
    private User getCurrentAuthenticatedUser() {
        return currentUserService.getCurrentUser();
    }

    @Override
    public IncidentResponseDTO createIncident(IncidentRequestDTO request) {
        User currentUser = getCurrentAuthenticatedUser();

        // Business rule #1: Only OPERATOR users may create incidents.
        // Specific 403 message is thrown by the access service.
        incidentAccessService.assertCanCreateIncident(currentUser);

        // Business rule #2: reportedBy must always be the authenticated user.
        // Any reportedById/assignedToId/supervisorId in the payload is IGNORED
        // — initial assignment must go through POST /incidents/{id}/assign and
        // is performed by a manager/supervisor.
        if (currentUser == null || currentUser.getId() == null) {
            throw new BadRequestException(
                    "El incidente debe estar asociado a un operador válido."
            );
        }

        Area area = null;

        if (request.getAreaId() != null) {
            area = areaRepository.findById(request.getAreaId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Área no encontrada"));
        }

        Incident incident = Incident.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .type(request.getType())
                .status(IncidentStatus.OPEN)
                .isFalseAlarm(
                        request.getIsFalseAlarm() != null
                                ? request.getIsFalseAlarm()
                                : false                )
                .area(area)
                .reportedBy(currentUser)
                .assignedTo(null)
                .supervisor(null)
                .resolvedAt(null)
                .build();

        Incident saved = incidentRepository.save(incident);
        //auditoria
        incidentLogService.logAction(
                saved,
                currentUser,
                IncidentAction.INCIDENT_CREATED,
                "Incidente creado por " + currentUser.getFirstName()
        );

        return mapToResponse(saved);
    }

    // Mapper manual (simple y claro)
    private IncidentResponseDTO mapToResponse(Incident incident) {
        IncidentResponseDTO dto = new IncidentResponseDTO();

        dto.setId(incident.getId());
        dto.setTitle(incident.getTitle());
        dto.setDescription(incident.getDescription());
        dto.setStatus(incident.getStatus());
        dto.setPriority(incident.getPriority());

        dto.setType(incident.getType());
        dto.setIsFalseAlarm(incident.getIsFalseAlarm());

        if (incident.getArea() != null) {
            dto.setAreaId(incident.getArea().getId());
            dto.setAreaName(incident.getArea().getName());
        }

        if (incident.getReportedBy() != null) {
            dto.setReportedById(incident.getReportedBy().getId());
            dto.setReportedByName(
                    incident.getReportedBy().getFirstName()
            );
        }

        if (incident.getAssignedTo() != null) {
            dto.setAssignedToId(incident.getAssignedTo().getId());
            dto.setAssignedToName(
                    incident.getAssignedTo().getFirstName()
            );
        }

        if (incident.getSupervisor() != null) {
            dto.setSupervisorId(incident.getSupervisor().getId());
            dto.setSupervisorName(
                    incident.getSupervisor().getFirstName()
            );
        }

        dto.setCreatedAt(incident.getCreatedAt());
        dto.setUpdatedAt(incident.getUpdatedAt());
        return dto;
    }

    @Override
    public List<IncidentResponseDTO> getAllIncidents() {
        return getFilteredIncidents(null, null, null);
    }

    @Override
    public IncidentResponseDTO getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado"));

        incidentAccessService.assertCanViewIncident(
                getCurrentAuthenticatedUser(),
                incident
        );

        return mapToResponse(incident);
    }

    @Override
    public List<AssignmentResponseDTO> getAssignmentHistory(Long incidentId) {
        // 1. Validar que el incidente existe
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Incidente con id " + incidentId + " no encontrado"
                ));

        incidentAccessService.assertCanViewIncident(
                getCurrentAuthenticatedUser(),
                incident
        );

        // 2. Obtener asignaciones ordenadas
        List<Assignment> assignments = assignmentRepository
                .findByIncidentIdOrderByAssignedAtDesc(incidentId);

        // 3. Mapear a DTO
        return assignments.stream()
                .map(a -> new AssignmentResponseDTO(
                        a.getId(),
                        a.getIncident().getId(),
                        a.getAssignedTo().getId(),
                        a.getAssignedTo().getFirstName(),
                        a.getAssignedBy().getId(),
                        a.getAssignedBy().getFirstName(),
                        a.getAssignedAt()
                ))
                .toList();
    }

    public IncidentResponseDTO resolveIncident(Long incidentId, String comment) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Incidente no encontrado"));

        User currentUser = getCurrentAuthenticatedUser();
        incidentAccessService.assertCanResolveIncident(currentUser, incident);

        // State machine: only IN_PROGRESS → RESOLVED is allowed.
        IncidentTransitions.assertAllowed(incident.getStatus(), IncidentStatus.RESOLVED);

        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolvedAt(LocalDateTime.now());
        incident.setResolvedBy(currentUser.getEmail());
        incident.setUpdatedBy(currentUser.getEmail());

        Incident updatedIncident = incidentRepository.save(incident);

        //auditoria
        incidentLogService.logAction(
                incident,
                currentUser,
                IncidentAction.RESOLVED,
                comment != null ? comment : "Incidente resuelto"
        );

        return mapToResponse(updatedIncident);
    }

    @Override
    public IncidentResponseDTO startIncident(Long incidentId, String comment) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Incidente no encontrado"));

        User currentUser = getCurrentAuthenticatedUser();
        incidentAccessService.assertCanResolveIncident(currentUser, incident);

        // State machine: ASSIGNED or ON_HOLD → IN_PROGRESS.
        IncidentTransitions.assertAllowed(incident.getStatus(), IncidentStatus.IN_PROGRESS);

        incident.setStatus(IncidentStatus.IN_PROGRESS);
        incident.setUpdatedBy(currentUser.getEmail());

        Incident updatedIncident = incidentRepository.save(incident);

        //auditoria
        incidentLogService.logAction(
                incident,
                currentUser,
                IncidentAction.STARTED,
                comment != null ? comment : "Trabajo iniciado"
        );

        return mapToResponse(updatedIncident);
    }

    @Override
    public IncidentResponseDTO holdIncident(Long incidentId, String comment) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Incidente no encontrado"));

        User currentUser = getCurrentAuthenticatedUser();
        incidentAccessService.assertCanResolveIncident(currentUser, incident);

        // State machine: only IN_PROGRESS → ON_HOLD.
        IncidentTransitions.assertAllowed(incident.getStatus(), IncidentStatus.ON_HOLD);

        incident.setStatus(IncidentStatus.ON_HOLD);
        incident.setUpdatedBy(currentUser.getEmail());

        Incident updatedIncident = incidentRepository.save(incident);

        //auditoria
        incidentLogService.logAction(
                incident,
                currentUser,
                IncidentAction.PUT_ON_HOLD,
                comment != null ? comment : "Incidente en espera"
        );

        return mapToResponse(updatedIncident);
    }

    @Override
    public IncidentResponseDTO cancelIncident(Long incidentId, String comment) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Incidente no encontrado"));

        User currentUser = getCurrentAuthenticatedUser();
        incidentAccessService.assertCanCancelIncident(currentUser, incident);

        // State machine: cancel allowed from OPEN / ASSIGNED / IN_PROGRESS / ON_HOLD
        // — terminal states (CLOSED, CANCELED) and RESOLVED reject the transition.
        IncidentTransitions.assertAllowed(incident.getStatus(), IncidentStatus.CANCELED);

        incident.setStatus(IncidentStatus.CANCELED);
        incident.setUpdatedBy(currentUser.getEmail());

        Incident updatedIncident = incidentRepository.save(incident);

        //auditoria
        incidentLogService.logAction(
                incident,
                currentUser,
                IncidentAction.CANCELED,
                comment != null ? comment : "Incidente cancelado"
        );

        return mapToResponse(updatedIncident);
    }

    @Override
    public IncidentResponseDTO closeIncident(Long incidentId, String comment) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Incidente no encontrado"));

        User currentUser = getCurrentAuthenticatedUser();
        incidentAccessService.assertCanCloseIncident(currentUser, incident);

        // State machine: only RESOLVED → CLOSED.
        IncidentTransitions.assertAllowed(incident.getStatus(), IncidentStatus.CLOSED);

        incident.setStatus(IncidentStatus.CLOSED);
        incident.setUpdatedBy(currentUser.getEmail());

        Incident updatedIncident = incidentRepository.save(incident);

        //auditoria
        incidentLogService.logAction(
                incident,
                currentUser,
                IncidentAction.CLOSED,
                comment != null ? comment : "Incidente cerrado"
        );

        return mapToResponse(updatedIncident);
    }

    @Override
    public List<IncidentResponseDTO> getFilteredIncidents(
            IncidentStatus status,
            Priority priority,
            Long areaId
    ) {
        User currentUser = getCurrentAuthenticatedUser();

        return incidentRepository.findAll(
                        incidentAccessService.visibleToWithFilters(
                                currentUser,
                                status,
                                priority,
                                areaId
                        )
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    //paginacion
    @Override
    public Page<IncidentResponseDTO>
    getIncidentsPaginated(Pageable pageable) {
        User currentUser = getCurrentAuthenticatedUser();

        return incidentRepository.findAll(
                        incidentAccessService.visibleTo(currentUser),
                        pageable
                )
                .map(this::mapToResponse);
    }

}

