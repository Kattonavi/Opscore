# Guía para ejecutar los test con el framework Playwright

## Instalaciones necesarias

- [Visual Studio Code](https://code.visualstudio.com/)
- [NodeJS](https://nodejs.org/)

## Antes de comenzar

Antes de comenzar a instalar las dependencias del proyecto es necesario verificar que tienes las dependencias necesarias instaladas.
Abre la terminal de comandos de tu sistema y sigue los siguientes pasos para asegurarte de que todo está correcto antes de comenzar.

### Verificar instalación de NodeJS

```
node -v
```

### Verificar la política de ejecución de scripts

- Estaremos trabajando con Node para que Playwright funcione, por lo que vas a estar ejecutando comandos desde la consola/cmd. En el caso del sistema operativo Windows esto puede dar problemas debido a que la configuración para ejecutar comandos de herramientas externas está desactivado. Para activarlo sigue los siguientes pasos:

- Abre una terminal de Windows Powershell como administrador
- Ejecuta el siguiente comando:

```
Get-ExecutionPolicy -List
```

- Deberías ver algo como esto:

```
     Scope ExecutionPolicy
        ----- ---------------
MachinePolicy       Undefined
   UserPolicy       Undefined
      Process       Undefined
  CurrentUser       Restricted
 LocalMachine       Restricted
```

- La configuración que nos interesa es la de CurrentUser, debemos cambiarla a RemoteSigned, para ello, ejecuta el siguiente comando:

```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

- Confirma la ejecución del comando
- Vuelve a comprobar la política de ejecución:

```
Get-ExecutionPolicy -List
```

- Deberías ver esto:

```
    Scope ExecutionPolicy
        ----- ---------------
MachinePolicy       Undefined
   UserPolicy       Undefined
      Process       Undefined
  CurrentUser       RemoteSigned
 LocalMachine       Restricted
```

### Comandos para instalar el entorno del QA

```
npm install 
```

## Comando para ejecutar los Test

Para ejecutar los test debes estar dentro de la carpeta QA:

```
npm test
```

Si quieres ejecutar un test especifico ejecuta el siguiente comando (Dentro de la carpeta QA):

```
npx playwright test tests/nombretest.spec.ts
```

<h3 align="center">¡Listo! Has realizado el Test 🥳</h3>

### Si quieres ver el reporte del Test debes de ejecutar el siguiente comando

```
npx playwright show-report
```


## Y debes dirigirte a la siguiente url para visualizarlos

Para ejecutar los test debes estar dentro de la carpeta QA:

```
http://localhost:9323
```

<h3 align="center">¡Listo! ya puedes visualizar el reporte de los Test 🥳</h3>

---

## Fase 4 — Suite E2E reorganizada

A partir de la Fase 4 la suite se divide en dos proyectos Playwright:

| Proyecto | Specs | Driver | Requiere navegador |
|---|---|---|---|
| `api` | `login.spec.ts`, `incidents.spec.ts`, `users.spec.ts`, `incident-workflow.api.spec.ts`, `incident-rbac.api.spec.ts` | HTTP via `request` | ❌ |
| `ui`  | `session-isolation.ui.spec.ts` | navegador | ✅ (`npm run install:browsers`) |

### Variables de entorno

Ver `qa/.env.example` para la lista completa. Las críticas son:

| Variable | Default | Uso |
|---|---|---|
| `E2E_API_URL`     | `http://localhost:8080` | baseURL de tests API |
| `E2E_BASE_URL`    | `http://localhost:3000` | baseURL de tests UI |
| `E2E_ADMIN_EMAIL` | `admin@opscore.com` | login de admin |
| `E2E_ADMIN_PASSWORD` | `abcd1234` | password del seeder |
| `E2E_ROLE_ID_*`   | 1..5 | IDs del seed |

Los aliases legacy (`API_BASE_URL`, `API_ADMIN_EMAIL`, `API_ADMIN_PASSWORD`)
siguen funcionando.

### Bootstrapping de usuarios

Las specs nuevas crean (o reutilizan) usuarios deterministas a partir del
admin en su `beforeAll`:

```
e2e-manager@opscore.local
e2e-supervisor@opscore.local
e2e-technician@opscore.local
e2e-operator@opscore.local
```

Password compartido: `E2eTest1234!` (sólo en `helpers/env.ts`, nunca persistido).

Si querés usar usuarios pre-existentes, exportá `E2E_<ROLE>_EMAIL` y
`E2E_<ROLE>_PASSWORD` antes de correr.

### Comandos

```bash
# Listar tests sin ejecutarlos (smoke):
npx playwright test --list

# Sólo el proyecto API (no requiere navegador):
npx playwright test --project=api

# Sólo el proyecto UI (requiere instalar navegadores primero):
npm run install:browsers
npx playwright test --project=ui

# Una spec en particular:
npx playwright test tests/incident-workflow.api.spec.ts

# Modo UI interactivo:
npx playwright test --ui

# Reporte HTML:
npx playwright show-report
```

### Apuntar a Railway

Linux / macOS:
```bash
E2E_API_URL=https://opscore-api.up.railway.app \
E2E_BASE_URL=https://opscore-frontend.up.railway.app \
npm test
```

Windows PowerShell:
```powershell
$env:E2E_API_URL="https://opscore-api.up.railway.app"
$env:E2E_BASE_URL="https://opscore-frontend.up.railway.app"
npm test
```

### Datos de prueba y limpieza

- Los incidentes E2E se prefijan con `E2E - ` para identificarlos.
- Los usuarios E2E usan dominio `@opscore.local` con prefijo `e2e-<rol>`.
- **No hay endpoint de limpieza automático.** Si necesitás limpiar el
  entorno periódicamente, hacelo con `psql`:
  ```sql
  DELETE FROM incident_logs WHERE incident_id IN (SELECT id FROM incidents WHERE title LIKE 'E2E - %');
  DELETE FROM assignments   WHERE incident_id IN (SELECT id FROM incidents WHERE title LIKE 'E2E - %');
  DELETE FROM incidents     WHERE title LIKE 'E2E - %';
  DELETE FROM users         WHERE email LIKE 'e2e-%@opscore.local';
  ```

Ver `qa/docs/e2e.md` para la guía completa.