# Sistema de Gestión de Incidentes - OpsCore

Sistema completo de gestión de incidentes para plantas industriales con 400+ operarios. Permite reportar fallas desde cualquier dispositivo, realizar seguimiento de resolución y analizar causas raíz recurrentes.

## 🚀 Características Principales

### ✅ Gestión Completa de Incidentes
- **Reporte móvil optimizado**: Formulario accesible desde cualquier dispositivo
- **Seguimiento en tiempo real**: Estados (Abierto, En Proceso, Cerrado)
- **Asignación de responsables**: Supervisores asignan técnicos
- **Análisis de causa raíz**: Identificación de patrones recurrentes
- **Métricas automáticas**: Tiempo de respuesta y tasa de resolución

### 📊 Canvas de Análisis Interactivo
- **Visualización por Estado**: Gráfico de barras con distribución de incidentes
- **Visualización por Prioridad**: Gráfico de pie con porcentajes
- **Visualización por Tipo**: Gráfico de pie con categorías
- **Timeline**: Gráfico de líneas mostrando tendencias temporales
- **Heatmap**: Matriz interactiva Área vs Tipo con intensidad de color
- **Exportación de datos**: Descarga JSON de todos los incidentes
- **Animaciones fluidas**: GSAP + Framer Motion para transiciones suaves

### 👥 Roles de Usuario

1. **Operario**
   - Reporta incidentes desde la línea de producción
   - Ve sus incidentes reportados
   - Acceso móvil optimizado

2. **Supervisor**
   - Supervisa incidentes de su área
   - Asigna responsabilidades a técnicos
   - Monitorea progreso en tiempo real
   - Cierra incidentes con solución

3. **Gerente**
   - Análisis completo de patrones
   - Dashboard con métricas clave
   - Análisis de causa raíz
   - Reportes por tipo, área y prioridad

### 🌍 Multiidioma
- **Español** (ES)
- **English** (EN)
- **Português** (PT)

### 🎨 Características de UI/UX
- **Tema claro/oscuro** con persistencia
- **Animaciones fluidas** con Framer Motion y GSAP
- **Diseño responsive** optimizado para móviles
- **Componentes shadcn/ui** con Tailwind CSS
- **Notificaciones toast** con Sonner

## 📊 Flujo de Trabajo

```
1. OPERARIO detecta falla
   ↓
2. Abre formulario en teléfono
   ↓
3. Completa: tipo, área, prioridad, descripción
   ↓
4. Envía incidente
   ↓
5. SUPERVISOR recibe alerta
   ↓
6. Asigna técnico responsable
   ↓
7. TÉCNICO resuelve y cierra con solución
   ↓
8. Sistema registra tiempo de resolución
   ↓
9. GERENTE analiza causa raíz semanal
   ↓
10. Identifica patrones recurrentes
```

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + shadcn/ui
- **Estilos**: Tailwind CSS 3
- **Animaciones**: Framer Motion + GSAP
- **Gráficos**: Recharts
- **Estado**: Zustand con persistencia
- **Notificaciones**: Sonner
- **Iconos**: Lucide React
- **TypeScript**: Tipado completo

## 📦 Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd propotito

# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Compilar producción
npm run build
npm start
```

## 🔐 Credenciales de Prueba

### Gerente
- **Email**: gerente@opscore.com
- **Password**: gerente123
- **Permisos**: Acceso completo, análisis, reportes

### Supervisor
- **Email**: supervisor@opscore.com
- **Password**: supervisor123
- **Permisos**: Asignar incidentes, cerrar, monitorear

### Operario
- **Email**: operario@opscore.com
- **Password**: operario123
- **Permisos**: Reportar incidentes, ver propios

## 📱 Tipos de Incidentes

- **Falla de Máquina**: Problemas mecánicos o eléctricos
- **Accidente**: Incidentes de seguridad
- **Desviación de Calidad**: Problemas de calidad del producto
- **Otro**: Otros tipos de incidentes

## 🏭 Áreas

- **Producción**: Líneas de producción
- **Mantenimiento**: Equipos y maquinaria
- **Calidad**: Control de calidad
- **Seguridad**: Seguridad industrial
- **Logística**: Almacén y distribución

## ⚡ Prioridades

- **Baja**: No afecta producción inmediata
- **Media**: Afecta parcialmente
- **Alta**: Afecta producción significativamente
- **Crítica**: Detiene producción completamente

## 📈 Métricas y Analytics

### Dashboard Principal
- Total de incidentes
- Incidentes abiertos (alerta roja)
- Incidentes en proceso (amarillo)
- Incidentes cerrados (verde)

### Análisis Avanzado
- **Tasa de resolución**: % de incidentes cerrados
- **Tiempo promedio de resolución**: En horas y minutos
- **Distribución por tipo**: Gráfico de barras
- **Distribución por área**: Análisis por departamento
- **Distribución por prioridad**: Identificación de criticidad

### Causa Raíz
- Análisis de patrones recurrentes
- Identificación de problemas sistémicos
- Prevención de incidentes futuros

## 🎯 Características Técnicas

### Persistencia
- **Zustand** con middleware de persistencia
- Datos guardados en localStorage
- Sincronización automática entre pestañas

### Optimización
- **React Compiler**: Sin useMemo/useCallback manual
- **Server Components**: Renderizado optimizado
- **Code Splitting**: Carga bajo demanda
- **Image Optimization**: Next.js Image

### Animaciones
- **GSAP**: Animaciones de entrada con stagger
- **Framer Motion**: Transiciones suaves
- **useGSAP hook**: Cleanup automático

### Responsive
- **Mobile First**: Optimizado para móviles
- **Tablet**: Layout adaptativo
- **Desktop**: Experiencia completa

## 📂 Estructura del Proyecto

```
propotito/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── recovery/
│   │   ├── dashboard/
│   │   │   ├── incidentes/          # Sistema de incidentes
│   │   │   ├── canvas/              # Canvas de análisis
│   │   │   ├── usuarios/
│   │   │   ├── contenido/
│   │   │   └── configuracion/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── incidents/               # Componentes de incidentes
│   │   │   ├── incident-card.tsx
│   │   │   ├── new-incident-dialog.tsx
│   │   │   ├── assign-incident-dialog.tsx
│   │   │   ├── close-incident-dialog.tsx
│   │   │   ├── incident-details-dialog.tsx
│   │   │   ├── incident-stats.tsx
│   │   │   └── incident-analytics.tsx
│   │   ├── canvas/                  # Componentes de visualización
│   │   │   ├── status-chart.tsx
│   │   │   ├── priority-chart.tsx
│   │   │   ├── type-chart.tsx
│   │   │   ├── timeline-chart.tsx
│   │   │   └── heatmap-chart.tsx
│   │   └── ui/                      # shadcn/ui components
│   └── lib/
│       ├── store.ts                 # Zustand stores
│       ├── i18n.ts                  # Traducciones
│       └── utils.ts
├── package.json
└── README.md
```

## 🔄 Estados del Incidente

```typescript
type IncidentStatus = "abierto" | "en_proceso" | "cerrado";
```

### Transiciones
1. **Abierto** → Supervisor asigna → **En Proceso**
2. **En Proceso** → Técnico resuelve → **Cerrado**

## 🎨 Paleta de Colores

### Estados
- **Abierto**: Rojo (#ef4444)
- **En Proceso**: Amarillo (#eab308)
- **Cerrado**: Verde (#22c55e)

### Prioridades
- **Baja**: Azul (#3b82f6)
- **Media**: Amarillo (#eab308)
- **Alta**: Naranja (#f97316)
- **Crítica**: Rojo (#ef4444)

## 🚀 Próximas Mejoras

- [ ] Exportar reportes a PDF/Excel
- [ ] Notificaciones push en tiempo real
- [ ] Adjuntar fotos a incidentes
- [ ] Firma digital en cierre
- [ ] Integración con WhatsApp
- [ ] Dashboard de gerencia avanzado
- [ ] Reportes programados por email
- [ ] API REST para integraciones
- [x] Canvas de análisis con visualizaciones interactivas
- [x] Heatmap de incidentes por área y tipo
- [x] Timeline de tendencias temporales
- [x] Exportación de datos en JSON

## 📝 Licencia

MIT

## 👨‍💻 Desarrollo

Desarrollado con ❤️ usando Next.js 14, React 19, shadcn/ui y Tailwind CSS.

---

**OpsCore** - Digitalizando operaciones industriales
