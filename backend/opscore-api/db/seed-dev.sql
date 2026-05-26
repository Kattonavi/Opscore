-- ──────────────────────────────────────────────────────────────────────
--  OpsCore — Seed inicial (PostgreSQL)
--
--  ⚠ MÉTODO PREFERIDO: usar el seeder Java (DataSeeder.java)
--    Levanta la app con OPSCORE_SEED_ENABLED=true y un perfil que cargue
--    el seeder (por defecto, `dev` lo hace). Es idempotente, no toca
--    filas existentes y genera el hash BCrypt en runtime.
--
--    En Railway:
--      1) Primer deploy: SPRING_JPA_DDL_AUTO=update + OPSCORE_SEED_ENABLED=true
--      2) Cambiar la contraseña del admin (PATCH /users/change-password).
--      3) Quitar OPSCORE_SEED_ENABLED y poner SPRING_JPA_DDL_AUTO=validate.
--
--  Este SQL es un FALLBACK manual por si no se puede ejecutar el seeder.
--
--  ⚠ El archivo `init.sql` que vive junto a este es OBSOLETO. Crea tablas
--    `users`, `incidents`, `assignments`, `incident_comments` con un esquema
--    legacy (campo `username`, sin first/last name, sin areas/roles) que YA
--    NO coincide con las entidades JPA actuales. Se conserva intacto por
--    pedido del proyecto. NO lo ejecutes en producción.
--
--  Uso típico de este SQL fallback:
--    1. Levanta la app una primera vez con SPRING_JPA_DDL_AUTO=update para
--       que Hibernate cree las tablas.
--    2. Conéctate a la BD y ejecuta este archivo:
--           psql $DATABASE_URL -f db/seed-dev.sql
--    3. Crea el admin con un hash BCrypt válido (ver bloque más abajo).
--    4. A partir de aquí podés volver a `ddl-auto=validate`.
--
--  Los IDs de roles aquí coinciden con los defaults del seeder Java y de
--  `qa/`:  1 ADMIN, 2 MANAGER, 3 SUPERVISOR, 4 TECHNICIAN, 5 OPERATOR.
-- ──────────────────────────────────────────────────────────────────────

-- ── Roles ─────────────────────────────────────────────────────────────
INSERT INTO roles (id, name, description) VALUES
    (1, 'ADMIN',      'Acceso total al sistema'),
    (2, 'MANAGER',    'Gerencia: reportes y gestión de incidentes/usuarios'),
    (3, 'SUPERVISOR', 'Supervisión y asignación de incidentes'),
    (4, 'TECHNICIAN', 'Resolución de incidentes asignados'),
    (5, 'OPERATOR',   'Creación y seguimiento de incidentes propios')
ON CONFLICT (id) DO NOTHING;

-- Asegurar que la secuencia de roles avance más allá de los IDs sembrados.
SELECT setval(
    pg_get_serial_sequence('roles', 'id'),
    GREATEST((SELECT MAX(id) FROM roles), 5)
);

-- ── Areas ─────────────────────────────────────────────────────────────
INSERT INTO areas (id, name, description, color) VALUES
    (1, 'PRODUCTION',   'Línea de producción',     '#ef4444'),
    (2, 'CONTABILITY',  'Contabilidad y finanzas', '#f59e0b'),
    (3, 'RRHH',         'Recursos humanos',        '#8b5cf6'),
    (4, 'IT',           'Tecnología de la información', '#06b6d4'),
    (5, 'LOGISTICS',    'Logística y distribución', '#10b981')
ON CONFLICT (id) DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('areas', 'id'),
    GREATEST((SELECT MAX(id) FROM areas), 5)
);

-- ── Usuario admin demo ────────────────────────────────────────────────
--
-- ⚠ No es posible incluir aquí un hash BCrypt válido sin conocer el costo
--   y el salt usados por BCryptPasswordEncoder en runtime, ya que el hash
--   depende del salt aleatorio que genera el encoder. Para sembrar el
--   usuario admin tenés dos opciones soportadas:
--
--   OPCIÓN A — recomendada (después del primer despliegue):
--     Insertar el usuario con un hash conocido. Generá el hash desde una
--     consola Java (o desde la app) y reemplazá el valor BCRYPT_HASH abajo.
--
--   OPCIÓN B — para CI o pruebas locales:
--     Ejecutá un pequeño comando dentro del contenedor para insertar el
--     usuario admin usando el endpoint POST /users con un token preexistente
--     o levantando la app sin Spring Security temporalmente.
--
-- Si tenés un hash listo, descomentá y reemplazá el bloque siguiente:
--
-- INSERT INTO users (first_name, last_name, email, password, role_id, area_id, is_active, created_at)
-- VALUES (
--     'Admin', 'OpsCore',
--     'admin@opscore.com',
--     'REEMPLAZAR_CON_HASH_BCRYPT_VALIDO',   -- $2a$10$...
--     1, 4, true, NOW()
-- )
-- ON CONFLICT (email) DO NOTHING;
