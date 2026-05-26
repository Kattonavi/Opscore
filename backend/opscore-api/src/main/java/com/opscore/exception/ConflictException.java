package com.opscore.exception;

/**
 * Signals a request that is syntactically valid and authorised but
 * conflicts with the current state of the resource. Mapped to HTTP 409
 * by {@link GlobalExceptionHandler}.
 *
 * <p>Typical use case: an incident lifecycle transition that is not
 * permitted from the current status (e.g. trying to resolve an OPEN
 * incident before it has been assigned and started).
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
