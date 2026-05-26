package com.opscore.controller;

import com.opscore.dto.user.*;
import com.opscore.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> createUser(
            @Valid @RequestBody CreateUserRequestDTO request
    ) {

        UserResponseDTO response = userService.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/assignable")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPERVISOR')")
    public ResponseEntity<List<UserResponseDTO>> getAssignableUsers() {

        return ResponseEntity.ok(
                userService.getAssignableUsers()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {

        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    /**
     * Updates the safe-to-edit profile fields of the authenticated user
     * ({@code firstName}, {@code lastName}). See
     * {@link UpdateMeRequestDTO} for the validation regex.
     */
    @PatchMapping("/me")
    public ResponseEntity<UserResponseDTO> updateMe(
            @Valid @RequestBody UpdateMeRequestDTO request
    ) {
        return ResponseEntity.ok(userService.updateMe(request));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleDTO request
    ) {

        UserResponseDTO response =
                userService.updateUserRole(id, request);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> updateUserStatus(
            @PathVariable Long id,
            @RequestBody UpdateUserStatusDTO request
    ) {

        UserResponseDTO response =
                userService.updateUserStatus(id, request);

        return ResponseEntity.ok(response);
    }

    /** Self-service password change for the authenticated user. */
    @PatchMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordDTO request
    ) {

        userService.changePassword(request);

        return ResponseEntity.ok(Map.of(
                "message", "Contraseña actualizada correctamente."
        ));
    }

    /**
     * Administrative password reset. Allowed for ADMIN and SUPERVISOR;
     * supervisors are further restricted by area inside the service.
     * Never returns the password in the response.
     */
    @PatchMapping("/{userId}/change-password")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<Map<String, String>> adminChangePassword(
            @PathVariable Long userId,
            @Valid @RequestBody AdminChangePasswordDTO request
    ) {
        userService.adminChangePassword(userId, request);

        return ResponseEntity.ok(Map.of(
                "message", "Contraseña actualizada correctamente."
        ));
    }
}
