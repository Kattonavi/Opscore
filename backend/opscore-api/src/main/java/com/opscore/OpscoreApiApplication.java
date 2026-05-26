package com.opscore;

import com.opscore.entity.Area;
import com.opscore.entity.User;
import com.opscore.entity.Role;
//import com.opscore.enums.Role;
import com.opscore.repository.AreaRepository;
import com.opscore.repository.RoleRepository;
import com.opscore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@EnableJpaAuditing
@SpringBootApplication
@RequiredArgsConstructor
public class OpscoreApiApplication {

	private final RoleRepository roleRepository;
	private final AreaRepository areaRepository;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;


	public static void main(String[] args) {
		SpringApplication.run(OpscoreApiApplication.class, args);
	}

	@Bean
	CommandLineRunner init() {

		return args -> {

			// =========================
			// ROLES
			// =========================
			Role adminRole = roleRepository.findByName("ADMIN")
					.orElseGet(() -> {
						Role role = new Role();
						role.setName("ADMIN");
						role.setDescription("System administrator");
						return roleRepository.save(role);
					});

			Role managerRole = roleRepository.findByName("MANAGER")
					.orElseGet(() -> {
						Role role = new Role();
						role.setName("MANAGER");
						role.setDescription("System manager");
						return roleRepository.save(role);
					});

			Role supervisorRole = roleRepository.findByName("SUPERVISOR")
					.orElseGet(() -> {
						Role role = new Role();
						role.setName("SUPERVISOR");
						role.setDescription("Supervisor");
						return roleRepository.save(role);
					});

			Role technicianRole = roleRepository.findByName("TECHNICIAN")
					.orElseGet(() -> {
						Role role = new Role();
						role.setName("TECHNICIAN");
						role.setDescription("Technician");
						return roleRepository.save(role);
					});

			Role operatorRole = roleRepository.findByName("OPERATOR")
					.orElseGet(() -> {
						Role role = new Role();
						role.setName("OPERATOR");
						role.setDescription("Operator");
						return roleRepository.save(role);
					});

			Role userRole = roleRepository.findByName("USER")
					.orElseGet(() -> {
						Role role = new Role();
						role.setName("USER");
						role.setDescription("User");
						return roleRepository.save(role);
					});

			// =========================
			// AREA
			// =========================

			Area productionArea = areaRepository.findByName("PRODUCTION")
					.orElseGet(() -> {
						Area area = new Area();
						area.setName("PRODUCTION");
						area.setDescription("Production area");
						area.setColor("#FF5733");
						return areaRepository.save(area);
					});

			Area contabilityArea = areaRepository.findByName("CONTABILITY")
					.orElseGet(() -> {
						Area area = new Area();
						area.setName("CONTABILITY");
						area.setDescription("Contability area");
						area.setColor("#adff33");
						return areaRepository.save(area);
					});
					
			Area rrhhArea = areaRepository.findByName("RRHH")
					.orElseGet(() -> {
						Area area = new Area();
						area.setName("RRHH");
						area.setDescription("RRHH area");
						area.setColor("#7a33ff");
						return areaRepository.save(area);
					});

			// =========================
			// 1.- ADMIN USER
			// =========================

			if (!userRepository.existsByEmail("admin@opscore.com")) {
				User admin = User.builder()
						.firstName("System")
						.lastName("Admin")
						.email("admin@opscore.com")
						.password(passwordEncoder.encode("abcd1234"))
						.role(adminRole)
						.area(productionArea)
						.createdAt(LocalDateTime.now())
						.build();

				userRepository.save(admin);
			}
			// =========================
			// 2.- MANAGER USER
			// =========================

			if (!userRepository.existsByEmail("manager@opscore.com")) {
				User manager = User.builder()
						.firstName("System")
						.lastName("Manager")
						.email("manager@opscore.com")
						.password(passwordEncoder.encode("abcd1234"))
						.role(managerRole)
						.area(productionArea)
						.createdAt(LocalDateTime.now())
						.build();

				userRepository.save(manager);
			}

			// =========================
			// 3.- SUPERVISOR USER
			// =========================
			if (!userRepository.existsByEmail("supervisor@opscore.com")) {

				User supervisor = User.builder()
						.firstName("System")
						.lastName("Supervisor")
						.email("supervisor@opscore.com")
						.password(passwordEncoder.encode("abcd1234"))
						.role(supervisorRole)
						.area(productionArea)
						.createdAt(LocalDateTime.now())
						.build();

				userRepository.save(supervisor);
			}
			// =========================
			// 4.- TECHNICIAN USER
			// =========================
			if (!userRepository.existsByEmail("technician@opscore.com")) {

				User technician = User.builder()
						.firstName("System")
						.lastName("technician")
						.email("technician@opscore.com")
						.password(passwordEncoder.encode("abcd1234"))
						.role(technicianRole)
						.area(productionArea)
						.createdAt(LocalDateTime.now())
						.build();

				userRepository.save(technician);
			}
			// =========================
			// 5.- OPERATOR USER
			// =========================
			if (!userRepository.existsByEmail("operator@opscore.com")) {

				User operator = User.builder()
						.firstName("System")
						.lastName("Operator")
						.email("operator@opscore.com")
						.password(passwordEncoder.encode("abcd1234"))
						.role(operatorRole)
						.area(productionArea)
						.createdAt(LocalDateTime.now())
						.build();

				userRepository.save(operator);
			}
			// =========================
			// 6.- USER USER
			// =========================
			if (!userRepository.existsByEmail("user@opscore.com")) {

				User user = User.builder()
						.firstName("System")
						.lastName("user")
						.email("user@opscore.com")
						.password(passwordEncoder.encode("abcd1234"))
						.role(userRole)
						.area(productionArea)
						.createdAt(LocalDateTime.now())
						.build();

				userRepository.save(user);
			}

		};
	}



	/*@Bean
	CommandLineRunner init(UserRepository repo, PasswordEncoder encoder) {
		return args -> {

			if (repo.findByUsername("admin").isEmpty()) {

				User user = new User();
				user.setUsername("admin");

				user.setRole(Role.ADMIN);

				user.setPassword(encoder.encode("1234"));

                user.setEnabled(true);

				repo.save(user);
			}
		};
	}*/


}
