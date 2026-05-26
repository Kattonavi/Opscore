Este proyecto consiste en crear un sistema digital para reportar 
y gestionar problemas (incidentes) dentro de una fábrica.
______________
🧠 ¿Cuál es el problema actual?
Hoy en día, cuando pasa algo (una máquina falla, hay un accidente o un error de calidad):
•	Se anota en papel o se manda por WhatsApp 
•	No hay orden ni seguimiento 
•	No se sabe cuánto tardan en resolverlo 
•	Los mismos problemas vuelven a ocurrir 
______________
💡 ¿Qué propone el proyecto?
Crear una herramienta (tipo app o sistema web) que haga todo eso de forma organizada.
______________
⚙️ ¿Cómo funcionaría? (flujo sencillo)
1.	👷 El operador detecta un problema 
o	Abre un formulario desde su celular 
o	Describe qué pasó (tipo de problema, área, breve texto) 
o	Lo envía 
2.	📢 El superv…
🧭 Plan paso a paso
1. 🧩 Entender y delimitar el alcance (Día 1–2)
Antes de escribir código, definan:
•	Tipos de incidentes (falla, accidente, calidad, etc.) 
•	Estados del incidente (abierto, en proceso, cerrado) 
•	Roles de usuario: 
o	Operador 
o	Supervisor 
o	Técnico 
o	Gerente 
👉 Salida de esta etapa:
•	Lista de funcionalidades (MVP) 
•	Primer esquema de datos (aunque sea simple) 
______________
2. 🗄️ Diseño de base de datos (Día 2–3)
Tablas clave:
•	users (id, nombre, rol) 
•	incidents (id, tipo, área, descripción, estado, fecha_creación) 
•	assignments (incidente_id, técnico_id) 
•	resolutions (incidente_id, solución, fecha_cierre) 
•	categories (para análisis de causa raíz) 

👉 Piensa desde ya en:
•	timestamps (para métricas) 
•	historial de cambios (opcional pero valioso) 
______________
3. ⚙️ Backend base con Spring Boot (Día 3–6)
Con tu stack:
•	Spring Boot 
•	PostgreSQL 
•	Apache Maven 

Endpoints mínimos:
Incidentes
•	POST /incidents → crear incidente 
•	GET /incidents → listar 
•	GET /incidents/{id} 
•	PUT /incidents/{id}/status 

Asignación
•	POST /incidents/{id}/assign 

Resolución
•	POST /incidents/{id}/resolve 
______________
4. 🔐 Autenticación básica (Día 6–7)
No lo compliquen demasiado al inicio:
•	Login simple (email + password) 
•	Roles (Spring Security) 
Más adelante puedes mejorar con JWT.
______________