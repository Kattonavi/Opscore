-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255),
    password VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    resolved_at TIMESTAMP,
    updated_by VARCHAR(255),
    resolved_by VARCHAR(255)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    assigned_to VARCHAR(255) NOT NULL,
    assigned_by VARCHAR(255) NOT NULL,
    assigned_at TIMESTAMP NOT NULL,
    FOREIGN KEY (incident_id) REFERENCES incidents(id)
);

-- Create incident_comments table
CREATE TABLE IF NOT EXISTS incident_comments (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    comment VARCHAR(1000),
    created_by VARCHAR(255),
    created_at TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id)
);

-- Insert test users with BCrypt encrypted passwords
-- Passwords: admin123, supervisor123, tecnico123, user123
INSERT INTO users (username, password, role, enabled) VALUES 
    ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqBmJ8P9A7aXMH9hP8J8mH7J3K3P2', 'ADMIN', true),
    ('supervisor', '$2a$10$7Q8hN9qo8uLOickgx2ZMRZoMy.MqrqBmJ8P9A7aXMH9hP8J8mH7J3', 'SUPERVISOR', true),
    ('tecnico', '$2a$10$LOickgx2ZMRZoMy.MqrqBmJ8P9A7aXMH9hP8J8mH7J3K3P2N9qo8u', 'TECHNICIAN', true),
    ('user', '$2a$10$ickgx2ZMRZoMy.MqrqBmJ8P9A7aXMH9hP8J8mH7J3K3P2N9qo8uLO', 'USER', true);

-- Insert sample incidents
INSERT INTO incidents (title, description, status, priority, category, created_at) VALUES 
    ('Falla en servidor principal', 'El servidor de producción no responde desde las 08:00 AM', 'OPEN', 'CRITICAL', 'OPERATIONS', NOW()),
    ('Actualización de seguridad pendiente', 'Se requiere aplicar parches de seguridad al sistema', 'IN_PROGRESS', 'HIGH', 'MAINTENANCE', NOW() - INTERVAL '2 days'),
    ('Error en reporte mensual', 'El reporte de ventas no genera los totales correctos', 'CLOSED', 'MEDIUM', 'QUALITY', NOW() - INTERVAL '5 days');
