# Base de datos OpsCore

## Archivos en este directorio

- **`seed-dev.sql`** — seed mínimo para entornos de desarrollo/staging recién
  creados. Crea filas en `roles` y `areas` que el resto del sistema asume.
  Incluye un bloque comentado para sembrar un usuario admin (requiere un hash
  BCrypt válido generado en runtime).

## El archivo `../init.sql` está **obsoleto**

El `init.sql` que vive en `backend/opscore-api/init.sql` describe un esquema
legacy (`username`, sin `email`/`first_name`/`last_name`/`role_id`/`area_id`,
hashes BCrypt placeholder no válidos, etc.) que ya no coincide con las
entidades JPA actuales.

Se conserva tal cual por decisión explícita del proyecto, pero **no debe
ejecutarse contra una base de datos que vaya a usar la app**: rompería el
contrato esperado por Hibernate (`ddl-auto=validate` en producción) y los
INSERT del seed fallarían por columnas faltantes.

## Esquema actual (generado por Hibernate)

Las tablas reales las crea Hibernate al iniciar la app (perfil `dev` con
`ddl-auto=update`). Mapeo entidad → tabla:

| Entidad                | Tabla              |
|------------------------|--------------------|
| `User`                 | `users`            |
| `Role`                 | `roles`            |
| `Area`                 | `areas`            |
| `Incident`             | `incidents`        |
| `Assignment`           | `assignments`      |
| `IncidentLog`          | `incident_logs`    |

## Procedimiento recomendado al provisionar una nueva BD

El camino recomendado ahora es el seeder Java `DataSeeder.java`, no este SQL.
Para una BD vacia de desarrollo o staging/demo:

```bash
SPRING_PROFILES_ACTIVE=dev OPSCORE_SEED_ENABLED=true ./mvnw spring-boot:run
```

En Railway staging/demo, usar temporalmente:

```env
SPRING_JPA_DDL_AUTO=update
OPSCORE_SEED_ENABLED=true
OPSCORE_SEED_ADMIN_EMAIL=admin@opscore.com
OPSCORE_SEED_ADMIN_PASSWORD=<password-demo-temporal>
```

Luego cambiar la password del admin, apagar `OPSCORE_SEED_ENABLED` y volver a
`SPRING_JPA_DDL_AUTO=validate`.

`seed-dev.sql` queda como fallback manual/documentacion secundaria.

## Fallback manual con SQL

```bash
# 1. Levantar la app la primera vez con SPRING_JPA_DDL_AUTO=update
SPRING_PROFILES_ACTIVE=dev SPRING_JPA_DDL_AUTO=update ./mvnw spring-boot:run

# 2. Una vez creadas las tablas, parar la app y sembrar roles/areas:
psql "$SPRING_DATASOURCE_URL" -f db/seed-dev.sql

# 3. (Una sola vez) crear un usuario admin con hash BCrypt válido.
#    Ver instrucciones en seed-dev.sql.

# 4. Volver a ddl-auto=validate para producción (recomendado).
```

## Migraciones (pendiente)

El proyecto **no usa Flyway/Liquibase** todavía. Es el siguiente paso natural
antes de promover a producción con datos reales. Hasta entonces, cualquier
cambio de esquema debe coordinarse manualmente.
