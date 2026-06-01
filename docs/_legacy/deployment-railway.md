# Despliegue de OpsCore en Railway

Guia para desplegar OpsCore en Railway como dos servicios: backend Spring Boot
4 + Java 25 y frontend Next.js, con PostgreSQL gestionado por Railway.

## 1. Estado actual del stack

| Capa | Stack |
|------|-------|
| Backend | Java 25, Spring Boot 4.0.6, Maven Wrapper |
| API docs | springdoc-openapi 3.0.0 |
| Frontend | Next.js 16.2.6, React 19.2.4, npm |
| Base de datos | PostgreSQL Railway |
| QA | Playwright |
| Deploy | Railway |

## 2. Backend Railway

Crear un servicio Railway apuntando al mismo repositorio y configurar:

- Root directory: `backend/opscore-api`
- Builder: Dockerfile
- Dockerfile: `backend/opscore-api/Dockerfile`
- Healthcheck path: `/actuator/health`

Variables requeridas/recomendadas:

```env
PORT=8080
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
SPRING_DATASOURCE_USERNAME=${{Postgres.PGUSER}}
SPRING_DATASOURCE_PASSWORD=${{Postgres.PGPASSWORD}}
SPRING_JPA_DDL_AUTO=validate
JWT_SECRET=<generar-con-openssl-rand-base64-48>
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=https://<frontend>.up.railway.app
SPRINGDOC_SWAGGER_UI_ENABLED=false
SPRINGDOC_API_DOCS_ENABLED=false
OPSCORE_SEED_ENABLED=false
```

Para el primer deploy de staging/demo, si la base esta vacia y aun no hay
migraciones:

```env
SPRING_JPA_DDL_AUTO=update
OPSCORE_SEED_ENABLED=true
OPSCORE_SEED_ADMIN_EMAIL=admin@opscore.com
OPSCORE_SEED_ADMIN_PASSWORD=<password-demo-temporal>
```

Despues del primer arranque exitoso:

1. Iniciar sesion con el admin demo.
2. Cambiar la contrasena.
3. Cambiar `OPSCORE_SEED_ENABLED=false`.
4. Cambiar `SPRING_JPA_DDL_AUTO=validate`.
5. Redeplegar.

## 3. Frontend Railway

Crear un segundo servicio Railway apuntando al mismo repositorio:

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Start command: `npm run start`

Variable requerida:

```env
NEXT_PUBLIC_API_URL=https://<backend>.up.railway.app
```

`NEXT_PUBLIC_*` se incluye en el bundle del navegador. No guardar secretos en
variables con ese prefijo.

## 4. CORS

`CORS_ALLOWED_ORIGINS` debe incluir la URL real del frontend Railway, por
ejemplo:

```env
CORS_ALLOWED_ORIGINS=https://opscore-frontend.up.railway.app
```

No usar `*` en produccion cuando hay autenticacion con JWT. Si necesitas varios
origenes, separalos por coma.

## 5. Swagger / OpenAPI

Springdoc 3.0.0 esta configurado para Spring Boot 4. Los endpoints se controlan
con:

```env
SPRINGDOC_SWAGGER_UI_ENABLED=false
SPRINGDOC_API_DOCS_ENABLED=false
```

Recomendacion: mantener Swagger/OpenAPI deshabilitado en produccion si el
backend tiene dominio publico y no hay una proteccion adicional para la
documentacion. En staging/demo puede habilitarse temporalmente.

## 6. Seed / DataSeeder

El metodo preferido para datos iniciales es `DataSeeder.java`.

Comportamiento:

- Es idempotente.
- Crea roles: ADMIN, MANAGER, SUPERVISOR, TECHNICIAN, OPERATOR.
- Crea areas base: PRODUCTION, CONTABILITY, RRHH, IT, LOGISTICS.
- Crea un admin demo si no existe.
- Hashea la contrasena con BCrypt en runtime.
- Esta deshabilitado por defecto en `prod`.

Variables:

```env
OPSCORE_SEED_ENABLED=true
OPSCORE_SEED_ADMIN_EMAIL=admin@opscore.com
OPSCORE_SEED_ADMIN_PASSWORD=<password-demo-temporal>
```

`db/seed-dev.sql` queda como fallback manual/documentacion secundaria. No es el
camino recomendado para Railway porque no genera BCrypt en runtime.

## 7. Seguridad por roles en incidentes

La seguridad esta aplicada en backend. El frontend solo puede ocultar o mostrar
controles, pero no es la fuente de autorizacion.

Lectura y listados:

- ADMIN: ve todos los incidentes.
- MANAGER: ve todos los incidentes.
- SUPERVISOR: ve todos los incidentes.
- TECHNICIAN: ve solo incidentes asignados a su usuario.
- OPERATOR: ve solo incidentes reportados por su usuario.

Detalle, timeline, asignaciones y anotaciones:

- Aplican las mismas reglas de visibilidad del incidente.
- Si no hay permiso, la API responde `403 FORBIDDEN`.

Acciones:

- Asignar: ADMIN, MANAGER, SUPERVISOR.
- Iniciar, poner en hold y resolver: TECHNICIAN asignado, ADMIN, MANAGER,
  SUPERVISOR.
- Cerrar: ADMIN, MANAGER, SUPERVISOR.
- Cancelar: ADMIN, MANAGER, SUPERVISOR.
- OPERATOR no cancela por defecto.

Dashboard:

- Las metricas de incidentes se calculan sobre el conjunto visible para el rol
  autenticado.

## 8. Pasos basicos de deploy

1. Crear proyecto Railway.
2. Crear PostgreSQL Railway.
3. Crear servicio backend con root `backend/opscore-api`.
4. Configurar variables backend.
5. Primer deploy de staging/demo con `SPRING_JPA_DDL_AUTO=update` y
   `OPSCORE_SEED_ENABLED=true` si la BD esta vacia.
6. Cambiar password del admin demo.
7. Desactivar seed y volver a `SPRING_JPA_DDL_AUTO=validate`.
8. Crear servicio frontend con root `frontend`.
9. Configurar `NEXT_PUBLIC_API_URL`.
10. Actualizar `CORS_ALLOWED_ORIGINS` del backend con la URL real del frontend.
11. Ejecutar QA contra staging.

## 9. Validacion local

Backend:

```bash
cd backend/opscore-api
./mvnw -B -ntp clean package
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

QA:

```bash
cd qa
npm install
npx playwright test --list
```

No ejecutar E2E completo si no estan corriendo backend, frontend y PostgreSQL
con datos de prueba.

## 10. Riesgos antes de produccion con datos reales

- No hay Flyway/Liquibase todavia.
- `SPRING_JPA_DDL_AUTO=update` solo debe usarse para staging/demo inicial.
- Swagger debe quedar deshabilitado o protegido.
- Seeds demo deben quedar apagados despues del primer arranque.
- El JWT se guarda en `localStorage`; migrar a cookie httpOnly es recomendable.
- Ejecutar Playwright completo contra un ambiente integrado antes de produccion.

Estado recomendado actual: listo para Railway staging/demo. No marcar como
produccion hasta agregar migraciones, endurecer JWT/storage y completar QA E2E
integrado.
