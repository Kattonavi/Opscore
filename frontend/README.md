# Frontend - Next.js 16 App

Aplicación moderna construida con Next.js 16, Tailwind CSS 4, shadcn/ui y sistema de i18n personalizado.

## Características

- **Next.js 16** - Última versión con App Router
- **Tailwind CSS 4** - Estilizado utilitario moderno
- **shadcn/ui** - Componentes accesibles y personalizables
- **i18n** - Soporte multi-idioma (Español/Inglés/Portugués) con sistema personalizado
- **Dark Mode** - Cambio entre temas claro/oscuro
- **Paleta personalizada** - Tema Stone con ámbar
- **Logo 🐦‍🔥** - SVG, PNG e ICO incluidos

## Estructura

```
app/
├── layout.tsx          # Layout principal con providers
├── page.tsx            # Página de inicio
├── about/page.tsx      # Página Acerca de
├── contact/page.tsx    # Página Contacto
├── globals.css         # Estilos globales y tema
components/
├── ui/                 # Componentes shadcn/ui
├── header.tsx          # Header con navegación
├── theme-toggle.tsx    # Toggle de tema
├── language-switcher.tsx # Selector de idioma
└── providers/
    ├── i18n-provider.tsx   # Provider de i18n
    └── theme-provider.tsx  # Provider de tema
i18n/
├── config.ts           # Configuración de idiomas
└── messages/
    ├── es.json         # Mensajes en español
    └── en.json         # Mensajes en inglés
```

## Paleta de Colores (Tema Stone)

- **Background**: Blanco/Stone muy oscuro
- **Foreground**: Stone oscuro/Blanco stone
- **Primary**: Ámbar/Naranja dorado (oklch 0.555 0.163 48.998)
- **Secondary**: Stone gris
- **Accent**: Stone gris cálido
- **Muted**: Stone gris claro

## Scripts

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en modo producción
npm start
```

## Tecnologías

- Next.js 16.2.6
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Lucide React (iconos)

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Logo 🐦‍🔥

Archivos del logo (phoenix/fénix) disponibles en:
- `public/logo.svg` - Vector original
- `public/logo.png` - PNG 256x256px
- `public/logo-64.png` - PNG 64x64px
- `public/logo-128.png` - PNG 128x128px
- `public/logo-256.png` - PNG 256x256px
- `public/logo-512.png` - PNG 512x512px
- `app/favicon.svg` - Favicon SVG
- `app/favicon.png` - Favicon PNG 32x32px
- `app/favicon.ico` - Favicon multi-resolución

Para regenerar los PNG desde el SVG:
```bash
node scripts/generate-logo.js
```

### Funcionalidades implementadas:

1. **Navegación**: Header con enlaces a Home, About y Contact
2. **Cambio de idioma**: Selector en el header (Español/Inglés/Portugués)
3. **Cambio de tema**: Toggle para Light/Dark/System
4. **Diseño responsivo**: Adaptable a móviles y desktop
5. **Paleta personalizada**: Tema Stone con ámbar
6. **Logo Phoenix**: 🐦‍🔥 en SVG, PNG e ICO
