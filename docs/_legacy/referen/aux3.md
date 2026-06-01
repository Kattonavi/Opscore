OPsCore. Plataforma de Gestión de Incidentes

Equipo: S04-26-Equipo 25-Web App
Integrantes:
Estanislao Hancco Apaza
Rodrigo Peña Ramirez
David Caycedo Blum
Jesus Medina

1. Introducción y Propósito
El presente documento define los objetivos, el alcance y las reglas de negocio para la plataforma OpsCore. El sistema surge como una solución tecnológica para eliminar el uso de papel y mensajería informal (WhatsApp) en la planta industrial, permitiendo la trazabilidad total de fallas, accidentes y desviaciones de calidad.

2. Objetivos del Proyecto
2.1. Objetivo General
Desarrollar e implementar una plataforma digital para la gestión integral de incidentes que permita el reporte inmediato, el seguimiento del ciclo de vida de la resolución y el análisis de causas raíz para optimizar la eficiencia operativa y reducir incidentes críticos.
2.2. Objetivos Específicos
Digitalización: Proveer un formulario móvil optimizado para el reporte de fallas en tiempo real por parte de 400 operarios.
Trazabilidad: Registrar cada cambio de estado del incidente mediante un sistema de logs (INCIDENT_LOG).
Eficiencia: Medir métricas críticas como el tiempo de respuesta y la tasa de resolución.
Prevención: Implementar un módulo de análisis de causa raíz para identificar patrones recurrentes por área y tipo de incidente.

3. Alcance del Sistema
El sistema cubrirá el ciclo de vida completo de un incidente, desde su detección hasta su cierre y análisis posterior.
3.1. Módulos Principales
Gestión de Usuarios y Accesos: Control basado en roles (Operario, Supervisor, Gerente, Técnico) y asignación por Áreas.
Módulo de Reportes: Formulario de entrada de datos con validaciones de tipo de incidente y descripción.
Panel de Monitoreo (Dashboard): Visualización de estados (Abierto, En Proceso, Finalizado, Cancelado).
Módulo de Auditoría (Logs): Registro histórico automático de quién hizo qué y cuándo.

4. Limitaciones del Sistema:
Estado en Cascada: Un incidente no puede pasar de "Abierto" a "Finalizado" directamente; debe pasar obligatoriamente por "En Proceso".
Áreas: Un usuario solo puede reportar incidentes en las áreas a las que tiene permisos o visibilidad técnica.
Restricciones por Rol:
Operario:
No puede asignar técnicos a un incidente.
No puede cambiar el estado de un incidente a "Finalizado".
Solo puede editar un reporte si este aún no ha sido "Asignado" por un supervisor.
Supervisor:
No puede eliminar registros de INCIDENT_LOG (la trazabilidad es inalterable).
No puede cerrar un incidente sin que el técnico haya registrado previamente una "Solución Aplicada".
Técnico:
No puede auto-asignarse incidentes (debe ser asignado por el supervisor).
No puede ver métricas de costos o salarios (si el sistema las tuviera), solo datos operativos.
5.1 Requerimientos Funcionales (RF)
Son las funciones específicas que el software debe hacer.
RF-01 Gestión de Sesión: El sistema debe permitir el inicio de sesión único mediante credenciales institucionales y asignar el perfil según el ROLE en la base de datos.
RF-02 Reporte de Incidente: El sistema debe capturar Tipo de Incidente, Área, Descripción y Timestamp de creación.
RF-03 Trazabilidad (Log): Por cada cambio de estado, el sistema debe insertar automáticamente una fila en la tabla INCIDENT_LOG con el ID del usuario que realizó el cambio.
RF-04 Cálculo de MTTR: El sistema debe calcular la diferencia de tiempo entre la creación (reported_at) y el cierre (closed_at) para generar métricas de eficiencia.

4.2. Requerimientos No Funcionales (RNF)
Son las características de cómo debe funcionar el sistema (calidad, rendimiento, seguridad).
RNF-01 Usabilidad (Mobile First): La interfaz de reporte debe ser responsiva y operable con una sola mano (pensando en el operario en la línea de producción).
RNF-02 Disponibilidad: El sistema debe garantizar un uptime del 99.9% durante los turnos operativos de la planta.
RNF-03 Persistencia Offline: El formulario debe permitir guardar el reporte de forma local si el operario pierde conexión en zonas de baja cobertura, sincronizándose al recuperar la señal.
RF-04 Notificaciones: El sistema debe enviar una alerta al Supervisor cuando un Operario cree un nuevo registro.
