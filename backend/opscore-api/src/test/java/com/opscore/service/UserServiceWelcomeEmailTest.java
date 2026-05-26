package com.opscore.service;

import com.opscore.dto.user.CreateUserRequestDTO;
import com.opscore.dto.user.UserResponseDTO;
import com.opscore.entity.Role;
import com.opscore.entity.User;
import com.opscore.repository.AreaRepository;
import com.opscore.repository.RoleRepository;
import com.opscore.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Verifies that {@link UserService#createUser} integrates with
 * {@link WelcomeEmailService} according to the contract:
 *
 * <ul>
 *   <li>the welcome service IS invoked once after the user is persisted</li>
 *   <li>if the welcome service throws, user creation still succeeds —
 *       the exception must NOT propagate to the caller</li>
 * </ul>
 *
 * Pure Mockito test; no Spring context is loaded.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceWelcomeEmailTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private RoleRepository roleRepository;
    @Mock private AreaRepository areaRepository;
    @Mock private WelcomeEmailService welcomeEmailService;

    @InjectMocks private UserService userService;

    private CreateUserRequestDTO request;

    @BeforeEach
    void setUp() {
        request = new CreateUserRequestDTO();
        request.setFirstName("Ada");
        request.setLastName("Lovelace");
        request.setEmail("ada@opscore.test");
        request.setPassword("Test1234!");
        request.setRoleId(4L);

        Role technicianRole = new Role();
        technicianRole.setId(4L);
        technicianRole.setName("TECHNICIAN");

        when(userRepository.existsByEmail("ada@opscore.test")).thenReturn(false);
        when(roleRepository.findById(4L)).thenReturn(Optional.of(technicianRole));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");

        // Echo back whatever the service saves so toResponse() can read it.
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User toSave = invocation.getArgument(0);
            toSave.setId(42L);
            return toSave;
        });
    }

    @Test
    void createUser_invokes_welcome_email_service_once() {
        UserResponseDTO response = userService.createUser(request);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("ada@opscore.test");

        verify(welcomeEmailService, times(1)).sendWelcomeEmail(any(User.class));
    }

    @Test
    void createUser_does_not_fail_when_welcome_email_throws() {
        doThrow(new RuntimeException("simulated welcome failure"))
                .when(welcomeEmailService).sendWelcomeEmail(any(User.class));

        assertThatCode(() -> userService.createUser(request))
                .as("a failure in the welcome flow must never reach the caller")
                .doesNotThrowAnyException();

        // And the user must have been persisted before the email attempt.
        verify(userRepository).save(any(User.class));
    }
}
