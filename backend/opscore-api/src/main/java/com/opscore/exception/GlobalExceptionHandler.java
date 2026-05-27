package com.opscore.exception;

import com.opscore.dto.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request) {

        ApiErrorResponse error = new ApiErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "NOT_FOUND",
                ex.getMessage(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    // fallback (muy importante)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(
            Exception ex,
            HttpServletRequest request) {

        ApiErrorResponse error = new ApiErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_ERROR",
                "Ocurrió un error inesperado",
                request.getRequestURI()
        );

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("Validation error");

        ApiErrorResponse error = new ApiErrorResponse(
                400,
                "BAD_REQUEST",
                message,
                request.getRequestURI()
        );

        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleBadRequest(
            BadRequestException ex,
            HttpServletRequest request) {

        ApiErrorResponse error = new ApiErrorResponse(
                400,
                "BAD_REQUEST",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Maps {@link AccessDeniedException} to a 403 response with a
     * user-friendly Spanish message.
     *
     * <p>Two cases:
     * <ul>
     *   <li><b>Business-rule denials</b> thrown by services use
     *       <code>new AccessDeniedException("Solo los usuarios con rol …")</code>
     *       — that specific message is passed through verbatim.</li>
     *   <li><b>Static role denials</b> from <code>@PreAuthorize</code> arrive
     *       with Spring's default message ("Access Denied" / "Access is denied").
     *       In that case the handler picks a contextual default from the
     *       request URI/method so the client still gets a meaningful reason
     *       instead of a bare 403.</li>
     * </ul>
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {

        String detail = ex.getMessage();
        boolean isSpringDefault = detail == null
                || detail.isBlank()
                || "Access is denied".equalsIgnoreCase(detail.trim())
                || "Access Denied".equalsIgnoreCase(detail.trim());

        String message = isSpringDefault
                ? pickContextualDefault(request)
                : detail;

        ApiErrorResponse error = new ApiErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                "FORBIDDEN",
                message,
                request.getRequestURI()
        );

        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    /**
     * Returns a Spanish message tailored to the endpoint that triggered the
     * static @PreAuthorize denial. The patterns mirror the controller routes
     * so a denial without a specific business message still reads naturally.
     */
    private String pickContextualDefault(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (path == null) {
            return "No tienes permiso para realizar esta acción.";
        }

        if ("POST".equalsIgnoreCase(method) && path.matches(".*/incidents/?$")) {
            return "Solo los usuarios con rol operador pueden crear incidentes.";
        }
        if (path.matches(".*/incidents/\\d+/(start|hold|resolve)/?$")) {
            return "No puedes modificar este incidente porque no está asignado a ti.";
        }
        if (path.matches(".*/incidents/\\d+/assign/?$")) {
            return "No tienes permiso para asignar este incidente.";
        }
        if (path.matches(".*/incidents/\\d+/close/?$")) {
            return "No tienes permiso para cerrar este incidente.";
        }
        if (path.matches(".*/incidents/\\d+/cancel/?$")) {
            return "No tienes permiso para cancelar este incidente.";
        }
        if (path.matches(".*/users/\\d+/change-password/?$")) {
            return "No tienes permiso para cambiar la contraseña de este usuario.";
        }
        if (path.matches(".*/users/me/?$")) {
            return "No tienes permiso para modificar tu información.";
        }
        if (path.matches(".*/users/.*$")) {
            return "No tienes permiso para administrar usuarios.";
        }
        return "No tienes permiso para realizar esta acción.";
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleConflict(
            ConflictException ex,
            HttpServletRequest request) {

        ApiErrorResponse error = new ApiErrorResponse(
                HttpStatus.CONFLICT.value(),
                "CONFLICT",
                ex.getMessage(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }
}


