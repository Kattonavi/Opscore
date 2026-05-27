package com.opscore.service.impl;

import com.opscore.enums.IncidentStatus;
import com.opscore.exception.ConflictException;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Single source of truth for the incident lifecycle state machine.
 *
 * <pre>
 *   OPEN        → ASSIGNED, CANCELED
 *   ASSIGNED    → ASSIGNED (re-assign), IN_PROGRESS, CANCELED
 *   IN_PROGRESS → ON_HOLD, RESOLVED, CANCELED
 *   ON_HOLD     → IN_PROGRESS, CANCELED
 *   RESOLVED    → CLOSED
 *   CLOSED      → (terminal)
 *   CANCELED    → (terminal)
 * </pre>
 *
 * The frontend (`lib/rbac.ts`) and the QA tests share the same lifecycle.
 * Any change here must be reflected on both sides.
 */
final class IncidentTransitions {

    private IncidentTransitions() {
    }

    private static final Map<IncidentStatus, Set<IncidentStatus>> ALLOWED;

    static {
        Map<IncidentStatus, Set<IncidentStatus>> m = new EnumMap<>(IncidentStatus.class);
        m.put(IncidentStatus.OPEN,
                EnumSet.of(IncidentStatus.ASSIGNED, IncidentStatus.CANCELED));
        m.put(IncidentStatus.ASSIGNED,
                EnumSet.of(IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS, IncidentStatus.CANCELED));
        m.put(IncidentStatus.IN_PROGRESS,
                EnumSet.of(IncidentStatus.ON_HOLD, IncidentStatus.RESOLVED, IncidentStatus.CANCELED));
        m.put(IncidentStatus.ON_HOLD,
                EnumSet.of(IncidentStatus.IN_PROGRESS, IncidentStatus.CANCELED));
        m.put(IncidentStatus.RESOLVED,
                EnumSet.of(IncidentStatus.CLOSED));
        m.put(IncidentStatus.CLOSED,
                EnumSet.noneOf(IncidentStatus.class));
        m.put(IncidentStatus.CANCELED,
                EnumSet.noneOf(IncidentStatus.class));
        ALLOWED = Map.copyOf(m);
    }

    static boolean isTerminal(IncidentStatus status) {
        return status == IncidentStatus.CLOSED || status == IncidentStatus.CANCELED;
    }

    static boolean isAllowed(IncidentStatus from, IncidentStatus to) {
        if (from == null || to == null) {
            return false;
        }
        return ALLOWED.getOrDefault(from, EnumSet.noneOf(IncidentStatus.class)).contains(to);
    }

    /**
     * Throw {@link ConflictException} (HTTP 409) when the requested transition
     * is not allowed by the state machine.
     */
    static void assertAllowed(IncidentStatus from, IncidentStatus to) {
        if (!isAllowed(from, to)) {
            throw new ConflictException(
                    "No se puede cambiar el estado del incidente de " + from + " a " + to
                            + ". El estado actual no permite esta acción."
            );
        }
    }
}
