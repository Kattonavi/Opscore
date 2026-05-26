# Desarrollar un sistema de gestión de incidentes

 Que permita reportar fallas desde cualquier dispositivo, realizar el seguimiento de la resolución y analizar las causas raíz recurrentes para reducir la frecuencia de incidentes críticos.

## Descripción

 - OpsCore está digitalizando las operaciones de una planta industrial con 400 operarios. 
 - Cuando ocurre una falla de máquina, un accidente o una desviación de calidad, se registra en papel o por WhatsApp. 
 - No hay trazabilidad, no se miden los tiempos de respuesta y las causas raíz se repiten debido a la falta de aprendizaje sistemático.

## Expectativas

 - Formulario de reporte optimizado para móviles, accesible desde el celular del operario.
 - Panel de monitoreo con incidentes abiertos, en proceso y cerrados.
 - Módulo de análisis de causa raíz con clasificación por tipo y área. 
 - Métricas de tiempo de respuesta y tasa de resolución por período.

### Usuarios Operario.- 
 Es el encargado de reporta un incidente desde la línea de producción. 

### Supervisor.-
 Es el encargado de supervisar los incidentes de su área y asigna responsabilidades y monitorea el progreso.
 
### Gerente.-
 Es el encargado de planta que analiza patrones y causas raíz.

## Flujo de trabajo.

**El operador** detecta una falla → abre el formulario en su teléfono → completa el tipo de incidente, el área y una breve descripción → lo envía → **el supervisor** recibe la alerta → asigna un técnico responsable → **el técnico** resuelve y cierra el incidente con la solución aplicada → **el sistema** registra el tiempo de resolución → **el gerente** revisa el análisis semanal de la causa raíz e identifica patrones recurrentes.
