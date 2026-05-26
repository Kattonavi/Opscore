package com.opscore.service;

import com.opscore.dto.assignment.AssignmentRequestDTO;
import com.opscore.entity.Assignment;
import com.opscore.entity.Incident;
import com.opscore.entity.User;
import com.opscore.enums.IncidentAction;
import com.opscore.enums.IncidentStatus;
import com.opscore.exception.ConflictException;
import com.opscore.exception.ResourceNotFoundException;
import com.opscore.repository.AssignmentRepository;
import com.opscore.repository.IncidentRepository;
import com.opscore.repository.UserRepository;
import com.opscore.security.CurrentUserService;
import com.opscore.security.IncidentAccessService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AssignmentService {

    private static final String TECHNICIAN_ROLE = "TECHNICIAN";

    private final IncidentRepository    incidentRepository;
    private final AssignmentRepository  assignmentRepository;
    private final UserRepository        userRepository;
    private final IncidentLogService    incidentLogService;
    private final CurrentUserService    currentUserService;
    private final IncidentAccessService incidentAccessService;

    public AssignmentService(IncidentRepository   incidentRepository,
                             AssignmentRepository assignmentRepository,
                             UserRepository       userRepository,
                             IncidentLogService   incidentLogService,
                             CurrentUserService   currentUserService,
                             IncidentAccessService incidentAccessService) {
        this.incidentRepository   = incidentRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository       = userRepository;
        this.incidentLogService   = incidentLogService;
        this.currentUserService   = currentUserService;
        this.incidentAccessService = incidentAccessService;
    }

    public void assignIncident(Long incidentId, AssignmentRequestDTO request) {

        // 1. Existencia del incidente.
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found"));

        // 2. Quien asigna debe ser administrativo (ADMIN/MANAGER/SUPERVISOR).
        User assignedBy = currentUserService.getCurrentUser();
        incidentAccessService.assertCanAssignIncident(assignedBy);

        // 3. Reglas de ciclo de vida: no se puede asignar en estados terminales.
        //    Tampoco se permite cambiar técnico una vez RESOLVED — queda a la
        //    espera de cierre o cancelación administrativa.
        IncidentStatus status = incident.getStatus();
        if (status == IncidentStatus.CLOSED
                || status == IncidentStatus.CANCELED
                || status == IncidentStatus.RESOLVED) {
            throw new ConflictException(
                    "Cannot assign an incident in state " + status
                            + ". Allowed only in OPEN / ASSIGNED / IN_PROGRESS / ON_HOLD."
            );
        }

        // 4. Cargar destinatario.
        User assignedTo = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found"));

        // 5. El destinatario debe ser un técnico activo.
        if (!assignedTo.isActive()
                || assignedTo.getRole() == null
                || !TECHNICIAN_ROLE.equals(assignedTo.getRole().getName())) {
            throw new ConflictException(
                    "Assignee must be an active TECHNICIAN"
            );
        }

        // 6. Scope por área: SUPERVISOR sólo asigna dentro de su área;
        //    ADMIN/MANAGER pueden asignar cualquier técnico activo.
        incidentAccessService.assertCanAssignToTechnician(assignedBy, assignedTo);

        // 7. Determinar primera asignación vs reasignación (para el timeline).
        User previousAssignee = incident.getAssignedTo();
        IncidentAction action = previousAssignee == null
                ? IncidentAction.ASSIGNED
                : IncidentAction.REASSIGNED;

        // 8. Construir la fila de Assignment (historial).
        Assignment assignment = new Assignment();
        assignment.setIncident(incident);
        assignment.setAssignedTo(assignedTo);
        assignment.setAssignedBy(assignedBy);

        // 9. Actualizar el incidente.
        //    Sólo bajamos a ASSIGNED cuando venimos de OPEN. Reasignar mientras
        //    el incidente ya está en IN_PROGRESS / ON_HOLD NO debe perder ese
        //    estado de trabajo en curso.
        incident.setAssignedTo(assignedTo);
        incident.setSupervisor(assignedBy);
        if (status == IncidentStatus.OPEN) {
            incident.setStatus(IncidentStatus.ASSIGNED);
        }
        incident.setUpdatedBy(assignedBy.getEmail());

        incidentRepository.save(incident);
        assignmentRepository.save(assignment);

        // 10. Auditoría — un único log por asignación.
        incidentLogService.logAction(
                incident,
                assignedBy,
                action,
                "Técnico " + assignedTo.getFirstName() + " " + assignedTo.getLastName()
                        + " asignado por " + assignedBy.getFirstName()
        );
    }
}
