package com.opscore.config;

import com.opscore.entity.Area;
import com.opscore.entity.Role;
import com.opscore.entity.User;
import com.opscore.repository.AreaRepository;
import com.opscore.repository.RoleRepository;
import com.opscore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Idempotent seeder for roles, areas and a demo admin user.
 *
 * <p>Runs on app startup whenever {@code OPSCORE_SEED_ENABLED=true} (default
 * {@code false} in production). Existing rows are never modified — the seeder
 * is a no-op once data is present.
 *
 * <p>Role IDs are aligned with {@code frontend/lib/rbac.ts} and
 * {@code qa/tests/test-utils.ts} (1 ADMIN, 2 MANAGER, 3 SUPERVISOR,
 * 4 TECHNICIAN, 5 OPERATOR).
 *
 * <p><b>Demo password — change after first login.</b> The seeded password
 * comes from the {@code OPSCORE_SEED_ADMIN_PASSWORD} env var (default
 * {@code abcd1234}, which matches the quick-login buttons on the login page).
 * BCrypt hashing happens at runtime, so the value stored in the database is
 * always a valid hash.
 */
@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final AreaRepository areaRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${opscore.seed.enabled:false}")
    private boolean seedEnabled;

    @Value("${opscore.seed.admin.email:admin@opscore.com}")
    private String adminEmail;

    @Value("${opscore.seed.admin.password:abcd1234}")
    private String adminPassword;

    private static final List<Map<String, String>> ROLES = List.of(
            Map.of("name", "ADMIN",      "description", "Acceso total al sistema"),
            Map.of("name", "MANAGER",    "description", "Gerencia: reportes y gestion de incidentes/usuarios"),
            Map.of("name", "SUPERVISOR", "description", "Supervision y asignacion de incidentes"),
            Map.of("name", "TECHNICIAN", "description", "Resolucion de incidentes asignados"),
            Map.of("name", "OPERATOR",   "description", "Creacion y seguimiento de incidentes propios")
    );

    private static final List<Map<String, String>> AREAS = List.of(
            Map.of("name", "PRODUCTION",  "description", "Linea de produccion",         "color", "#ef4444"),
            Map.of("name", "CONTABILITY", "description", "Contabilidad y finanzas",     "color", "#f59e0b"),
            Map.of("name", "RRHH",        "description", "Recursos humanos",            "color", "#8b5cf6"),
            Map.of("name", "IT",          "description", "Tecnologia de la informacion","color", "#06b6d4"),
            Map.of("name", "LOGISTICS",   "description", "Logistica y distribucion",    "color", "#10b981")
    );

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("[seeder] skipped (opscore.seed.enabled=false)");
            return;
        }

        log.info("[seeder] starting idempotent seed");
        seedRoles();
        seedAreas();
        seedAdminUser();
        log.info("[seeder] done");
    }

    private void seedRoles() {
        for (Map<String, String> entry : ROLES) {
            String name = entry.get("name");
            if (roleRepository.existsByName(name)) {
                continue;
            }
            Role role = new Role();
            role.setName(name);
            role.setDescription(entry.get("description"));
            roleRepository.save(role);
            log.info("[seeder] role created: {}", name);
        }
    }

    private void seedAreas() {
        for (Map<String, String> entry : AREAS) {
            String name = entry.get("name");
            if (areaRepository.existsByName(name)) {
                continue;
            }
            Area area = new Area();
            area.setName(name);
            area.setDescription(entry.get("description"));
            area.setColor(entry.get("color"));
            areaRepository.save(area);
            log.info("[seeder] area created: {}", name);
        }
    }

    private void seedAdminUser() {
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("[seeder] admin user already exists ({}), skipping", adminEmail);
            return;
        }
        Role adminRole = roleRepository.findByName("ADMIN").orElseThrow(() ->
                new IllegalStateException("ADMIN role must exist before seeding admin user"));

        User admin = User.builder()
                .firstName("Admin")
                .lastName("OpsCore")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(adminRole)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(admin);
        log.warn(
                "[seeder] admin user created: {} (DEMO PASSWORD — change immediately via PATCH /users/change-password)",
                adminEmail
        );
    }
}
