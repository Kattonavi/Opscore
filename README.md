# 🚨 Sistema de Gestión de Incidentes

## 📌 Descripción

Este proyecto es un sistema de gestión de incidentes para reportar, dar seguimiento y analizar la resolución de fallas en equipos industriales, dispositivos, computadoras y cualquier tipo de activo crítico. Permite registrar daños, asignar técnicos, seguir el progreso de las reparaciones y analizar causas raíz para reducir la frecuencia de incidentes críticos.

## 🎯 Funcionalidades clave

- 📝 Registro de incidentes y reportes técnicos.
- 👷‍♂️ Asignación de tareas de reparación a técnicos.
- 📊 Seguimiento del estado y historial de incidentes.
- 🔍 Análisis de causas raíz para prevenir nuevas fallas.
- 📁 Almacenamiento de archivos e imágenes relacionadas.

## 🧩 Alcance del proyecto

- Backend / API REST en **Spring Boot (Java)**
- Documentación de la API con **Swagger**
- Despliegue del backend en **Render**
- Almacenamiento de archivos en **Cloudinary**
- Base de datos PostgreSQL para el backend
- Frontend desarrollado en **Next.ts + React + Tailwind CSS**
- Despliegue del frontend en **Vercel**
- QA automatizado con **Playwright y Selenium**
- Gestión de tareas del equipo con **Trello**
 - QA automatizado con **Playwright y Selenium**, y gestión de casos con **TestRail**
 - Gestión de tareas del equipo con **Trello**

## 🛠️ Tecnologías principales

### Backend

[![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=java&logoColor=white)](https://www.java.com/) [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/) [![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/) [![Render](https://img.shields.io/badge/Render-0A191E?style=for-the-badge&logo=render&logoColor=white)](https://render.com) [![Cloudinary](https://img.shields.io/badge/Cloudinary-3438C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com)

### Frontend

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

### QA

[![Playwright](https://img.shields.io/badge/Playwright-2B7489?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/) [![Selenium](https://img.shields.io/badge/Selenium-43B02A?style=for-the-badge&logo=selenium&logoColor=white)](https://www.selenium.dev/) [![Trello](https://img.shields.io/badge/Trello-0052CC?style=for-the-badge&logo=trello&logoColor=white)](https://trello.com/invite/b/6a03fbd9faabb3ec3dbd76d4/ATTIec43e55818a498d81561f0c6161eab1a85ABE816/opscore)
[![TestRail](https://img.shields.io/badge/TestRail-FF6C37?style=for-the-badge&logo=testrail&logoColor=white)](https://opscore.testrail.io)


> **Nota:** QA usa Trello para la gestión de tareas y **TestRail** para la elaboracion de casos de prueba.

## 📁 Estructura del repositorio

- `/backend/opscore-api` — API REST construida con **Spring Boot**.
- `/frontend` — Aplicación web frontend en **Next.js** con **Tailwind CSS**.
- `/qa` — Pruebas automatizadas y configuración de QA con **Playwright y Selenium**.


## Estado actual de estabilizacion

El despliegue objetivo actual es **Railway staging/demo**:

- Backend: Java 25, Spring Boot 4.0.6, springdoc-openapi 3.0.0.
- Frontend: Next.js 16.2.6 y React 19.2.4.
- Base de datos: PostgreSQL Railway.
- Documentacion de despliegue: [`docs/deployment-railway.md`](docs/deployment-railway.md).

Seguridad backend de incidentes:

- ADMIN, MANAGER y SUPERVISOR ven todos los incidentes.
- TECHNICIAN ve solo incidentes asignados.
- OPERATOR ve solo incidentes reportados por su usuario.
- La API responde `403 FORBIDDEN` cuando un usuario autenticado intenta acceder a un incidente fuera de su alcance.

No usar datos reales de produccion hasta agregar migraciones Flyway/Liquibase,
apagar seeds demo, proteger/deshabilitar Swagger y ejecutar QA E2E completo.


## 👥 Equipo del proyecto

Somos un equipo de 4 colaboradores:
- 2 desarrolladores backend
- 1 desarrollador frontend
- 1 QA


## 🤵‍♂️Equipo [🔝](#readme-for--restify-app-)

### Frontend 

|![Avatar](https://avatars.githubusercontent.com/u/69812733?s=96&v=4) |
|:-:|
| **David H. Caycedo B.** |
| [![Github Link](https://img.shields.io/badge/github-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white 'Github Link')](https://github.com/davidcoachdev) [![LinkedIn Link](https://custom-icon-badges.demolab.com/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin-white&logoColor=fff 'LinkedIn Link')](https://www.linkedin.com/in/davidcoachdev/)  |

### Backends

|<img src="https://media.licdn.com/dms/image/v2/D4E03AQG6Ec171YNU4A/profile-displayphoto-crop_800_800/B4EZs5pCDBIMAI-/0/1766198616537?e=1781136000&v=beta&t=dFy9qY_Jo0tMLMRsAAugqwyIIqYvFij1oDXi6-LtlLs" width="96" height="96" alt="Avatar" /> |
|:-:|
|**Rodrigo Peña**|
| [![Github Link](https://img.shields.io/badge/github-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white 'Github Link')](https://github.com/IngRodrigoPena) [![LinkedIn Link](https://custom-icon-badges.demolab.com/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin-white&logoColor=fff 'LinkedIn Link')](https://www.linkedin.com/in/ing-rodrigo-pena-ramirez/) |


|![Avatar](https://avatars.githubusercontent.com/u/66507975?s=96&v=4) |
|:-:|
|**Estanislao Hancco**|
| [![Github Link](https://img.shields.io/badge/github-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white 'Github Link')](https://github.com/hanquito) [![LinkedIn Link](https://custom-icon-badges.demolab.com/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin-white&logoColor=fff 'LinkedIn Link')](https://www.linkedin.com/) |


### QA

| ![Avatar](https://avatars.githubusercontent.com/u/141883724?s=96&v=4) |
|:-:|
|**Jesus Medina**|
| [![Github Link](https://img.shields.io/badge/github-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white 'Github Link')](https://github.com/JesusMedina21) [![LinkedIn Link](https://custom-icon-badges.demolab.com/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin-white&logoColor=fff 'LinkedIn Link')](https://www.linkedin.com/in/jesusmedina-dev/ ) |


## 🚀 Cómo ejecutar el proyecto localmente

> **Stack actualizado:** Java 25 (LTS) + Spring Boot 4.0.6 + Next.js 16 +
> React 19. Despliegue en Railway documentado en
> [`docs/deployment-railway.md`](docs/deployment-railway.md).

### Requisitos
- Java 25
- Node.js 22.x
- PostgreSQL 16+
- Maven incluido vía `mvnw` (no requiere instalación global)

### Backend

```bash
cd backend/opscore-api
cp .env.example .env           # editar valores locales
./mvnw spring-boot:run         # perfil dev por defecto
```

Swagger UI: http://localhost:8080/swagger-ui/index.html

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                    # http://localhost:3000
```

### QA

```bash
cd qa
npm install
npm run install:browsers       # primera vez
npm run test:local             # tests contra backend local
```

### Carpeta `propotito/`

Prototipo histórico / app paralela. **No forma parte del sistema desplegable**
y se conserva tal cual para referencia.



### 📚 Deploy [🔝](#readme-for--restify-app-)

| Descripcion |  Deploy | link |
|:-: |:-: | :-: |
| Repositorio | [![Github Link](https://img.shields.io/badge/github-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white 'Github Link')](https://github.com/) | [Repositorio](https://github.com/No-Country-simulation/s04-26-e26-wad 'Repo App') |
| Frontend | [![Vercel Link](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white 'Vercel Link')](https://vercel.com/) |[Sitio ](https://opscore-app.vercel.app) |
| Backend | [![Render](https://img.shields.io/badge/Render-0A191E?style=for-the-badge&logo=render&logoColor=white)](https://render.com) |[Documentacion](https://opscoreapi.onrender.com/swagger-ui/index.html#/) |
| Data Base | [![Postgres Link](https://img.shields.io/badge/Postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)| [PostgreSQL](https://www.clever.cloud/) |


## 🎯 Objetivo del sistema

El sistema busca centralizar el flujo completo de gestión de incidentes:
- reporte rápido de fallas,
- asignación de técnicos,
- seguimiento de la reparación,
- análisis de causas raíz,
- reducción de incidentes críticos.

