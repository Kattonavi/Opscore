package com.opscore;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Boots the full application context (web, security, JPA, Flyway) against a real
 * PostgreSQL container. A passing {@code contextLoads} confirms the M1 foundation
 * wires up and Flyway applies the baseline migration. Requires a running Docker daemon.
 */
@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
class OpscoreApiApplicationTests {

	@Container
	@ServiceConnection
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

	@Test
	void contextLoads() {
		// Intentionally empty: success means the context started and migrations ran.
	}
}
