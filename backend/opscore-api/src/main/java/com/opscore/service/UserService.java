package com.opscore.service;

import com.opscore.dto.user.*;
import com.opscore.entity.Role;
import com.opscore.entity.User;
import com.opscore.exception.BadRequestException;
import com.opscore.exception.ResourceNotFoundException;
import com.opscore.repository.AreaRepository;
import com.opscore.repository.RoleRepository;
import com.opscore.repository.UserRepository;
import com.opscore.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import com.opscore.entity.Area;
import java.time.LocalDateTime;


@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_SUPERVISOR = "SUPERVISOR";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final AreaRepository areaRepository;
    private final WelcomeEmailService welcomeEmailService;

    public UserResponseDTO createUser(CreateUserRequestDTO request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("El email ya está registrado.");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found"));

        Area area = null;

        if (request.getAreaId() != null) {
            area = areaRepository.findById(request.getAreaId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Area not found"));
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .area(area)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        // Welcome email — best-effort. Failures are logged but do NOT abort
        // user creation (the account is already persisted). See
        // WelcomeEmailService for SMTP configuration requirements.
        try {
            welcomeEmailService.sendWelcomeEmail(savedUser);
        } catch (Exception ex) {
            log.warn("[users] welcome email failed for {}: {}",
                    savedUser.getEmail(), ex.getMessage());
        }

        return toResponse(savedUser);
    }

    public UserResponseDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("El usuario solicitado no existe.")
                );

        return toResponse(user);
    }

    public List<UserResponseDTO> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<UserResponseDTO> getAssignableUsers() {

        return userRepository
                .findByActiveTrueAndRoleNameIn(List.of("TECHNICIAN"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponseDTO getCurrentUser() {
        return toResponse(loadCurrentUser());
    }

    /**
     * Updates the safe-to-edit identity fields of the authenticated user.
     * Role, email, active state and password are intentionally not exposed
     * via this endpoint (see {@link UpdateMeRequestDTO}).
     */
    public UserResponseDTO updateMe(UpdateMeRequestDTO request) {
        User user = loadCurrentUser();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        return toResponse(userRepository.save(user));
    }

    public UserResponseDTO updateUserRole(
            Long userId,
            UpdateUserRoleDTO request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("El usuario solicitado no existe.")
                );

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found")
                );

        user.setRole(role);

        return toResponse(userRepository.save(user));
    }

    public UserResponseDTO updateUserStatus(
            Long userId,
            UpdateUserStatusDTO request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("El usuario solicitado no existe.")
                );

        user.setActive(request.isActive());

        return toResponse(userRepository.save(user));
    }

    /**
     * Self-service password change for the authenticated user. Validates
     * that the current password matches before applying the new one.
     */
    public void changePassword(ChangePasswordDTO request) {

        User user = loadCurrentUser();

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        )) {
            throw new BadRequestException("La contraseña actual es incorrecta.");
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);
    }

    /**
     * Administrative password reset performed by an ADMIN or SUPERVISOR.
     *
     * <p>Authorization rules:
     * <ul>
     *   <li>ADMIN may reset the password of any user.</li>
     *   <li>SUPERVISOR may reset the password of any user that belongs to
     *       the same area as the supervisor. If the supervisor has no
     *       area assigned, or the target user has no area, the call is
     *       rejected — mirroring the area-scope rule already enforced by
     *       <code>IncidentAccessService#assertCanAssignToTechnician</code>.</li>
     *   <li>Any other role is rejected at the controller via
     *       <code>@PreAuthorize</code>.</li>
     * </ul>
     */
    public void adminChangePassword(Long userId, AdminChangePasswordDTO request) {
        User actor = loadCurrentUser();
        String actorRole = actor.getRole() != null ? actor.getRole().getName() : null;

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "El usuario solicitado no existe."
                ));

        if (ROLE_SUPERVISOR.equals(actorRole)) {
            // Area-scoped supervisor — same rule as assignment.
            if (actor.getArea() == null
                    || target.getArea() == null
                    || !actor.getArea().getId().equals(target.getArea().getId())) {
                throw new AccessDeniedException(
                        "Como supervisor solo puedes cambiar la contraseña de usuarios de tu propia área."
                );
            }
        } else if (!ROLE_ADMIN.equals(actorRole)) {
            // Defense in depth — @PreAuthorize should already block this,
            // but if a future change widens the allowed roles, this stops
            // an unprivileged caller from getting past the service.
            throw new AccessDeniedException(
                    "No tienes permiso para cambiar la contraseña de este usuario."
            );
        }

        target.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(target);
    }

    // ── helpers ─────────────────────────────────────────────────────────

    private User loadCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("El usuario autenticado no existe."));
    }

    private UserResponseDTO toResponse(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().getName() : null)
                .area(user.getArea() != null ? user.getArea().getName() : null)
                .isActive(user.isActive())
                .avatar(user.getAvatar())
                .build();
    }
}
