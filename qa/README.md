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