package com.opscore.security;

import com.opscore.entity.Incident;
import com.opscore.entity.User;
import com.opscore.enums.IncidentStatus;
import com.opscore.enums.Priority;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class IncidentAccessService {

    private static final String ADMIN = "ADMIN";
    private static final String MANAGER = "MANAGER";
    private static final String SUPERVISOR = "SUPERVISOR";
    private static final String TECHNICIAN = "TECHNICIAN";
    private static final String OPERATOR = "OPERATOR";

    public boolean canViewIncident(User user, Incident incident) {
        if (user == null || incident == null) {
            return false;
        }
        if (isAdministrativeRole(user)) {
            return true;
        }
        if (hasRole(user, TECHNICIAN)) {
            return sameUser(user, incident.getAssignedTo());
        }
        if (hasRole(user, OPERATOR)) {
            return sameUser(user, incident.getReportedBy());
        }
        return false;
    }

    public boolean canManageIncident(User user, Incident incident) {
        return user != null && incident != null && isAdministrativeRole(user);
    }

    public boolean canAssignIncident(User user) {
        return isAdministrativeRole(user);
    }

    public boolean canResolveIncident(User user, Incident incident) {
        return isAdministrativeRole(user)
                || (incident != null
                        && hasRole(user, TECHNICIAN)
                        && sameUser(user, incident.getAssignedTo()));
    }

    public boolean canCloseIncident(User user, Incident incident) {
        return canManageIncident(user, incident);
    }

    public boolean canCancelIncident(User user, Incident incident) {
        return canManageIncident(user, incident);
    }

    public void assertCanViewIncident(User user, Incident incident) {
        if (!canViewIncident(user, incident)) {
            throwForbidden();
        }
    }

    public void assertCanAssignIncident(User user) {
        if (!canAssignIncident(user)) {
            throwForbidden();
        }
    }

    /**
     * Area-scoped assignment rule applied <b>after</b>
     * {@link #assertCanAssignIncident(User)}.
     *
     * <ul>
     *   <li>ADMIN and MANAGER may assign to any active technician.</li>
     *   <li>SUPERVISOR may only assign to technicians within their own
     *       area. If the supervisor has no area, or the technician has no
     *       area, or the areas differ, the call is rejected with 403.</li>
     *   <li>Any other role is rejected.</li>
     * </ul>
     *
     * The "active technician" check is intentionally not performed here —
     * {@code UserRepository.findByActiveTrueAndRoleNameIn(["TECHNICIAN"])}
     * already drives the assignable list. This guard is the server-side
     * counterpart of the frontend area filter in
     * {@code incidentes/[id]/page.tsx}.
     */
    public void assertCanAssignToTechnician(User assigner, User technician) {
        if (assigner == null || technician == null) {
            throwForbidden();
        }
        if (hasRole(assigner, ADMIN, MANAGER)) {
            return;
        }
        if (!hasRole(assigner, SUPERVISOR)) {
            throwForbidden();
        }
        // SUPERVISOR scope: same area only.
        if (assigner.getArea() == null
                || technician.getArea() == null
                || !assigner.getArea().getId().equals(technician.getArea().getId())) {
            throw new AccessDeniedException(
                    "SUPERVISOR can only assign technicians from their own area"
            );
        }
    }

    public void assertCanResolveIncident(User user, Incident incident) {
        if (!canResolveIncident(user, incident)) {
            throwForbidden();
        }
    }

    public void assertCanCloseIncident(User user, Incident incident) {
        if (!canCloseIncident(user, incident)) {
            throwForbidden();
        }
    }

    public void assertCanCancelIncident(User user, Incident incident) {
        if (!canCancelIncident(user, incident)) {
            throwForbidden();
        }
    }

    public Specification<Incident> visibleTo(User user) {
        return (root, query, cb) -> {
            if (isAdministrativeRole(user)) {
                return cb.conjunction();
            }
            if (hasRole(user, TECHNICIAN)) {
                return cb.equal(root.get("assignedTo").get("id"), user.getId());
            }
            if (hasRole(user, OPERATOR)) {
                return cb.equal(root.get("reportedBy").get("id"), user.getId());
            }
            return cb.disjunction();
        };
    }

    public Specification<Incident> visibleToWithFilters(
            User user,
            IncidentStatus status,
            Priority priority,
            Long areaId
    ) {
        return visibleTo(user).and((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (areaId != null) {
                predicates.add(cb.equal(root.get("area").get("id"), areaId));
            }

            return predicates.isEmpty()
                    ? cb.conjunction()
                    : cb.and(predicates.toArray(Predicate[]::new));
        });
    }

    private boolean isAdministrativeRole(User user) {
        return hasRole(user, ADMIN, MANAGER, SUPERVISOR);
    }

    private boolean hasRole(User user, String... roles) {
        String roleName = roleName(user);
        if (roleName == null) {
            return false;
        }
        for (String role : roles) {
            if (role.equals(roleName)) {
                return true;
            }
        }
        return false;
    }

    private String roleName(User user) {
        return user != null && user.getRole() != null
                ? user.getRole().getName()
                : null;
    }

    private boolean sameUser(User left, User right) {
        return left != null
                && right != null
                && left.getId() != null
                && left.getId().equals(right.getId());
    }

    private void throwForbidden() {
        throw new AccessDeniedException("You do not have permission to access this incident");
    }
}
