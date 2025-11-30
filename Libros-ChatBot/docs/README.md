# Plataforma de Reseñas de Libros

## Índice

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Configuración Local](#configuración-local)
4. [Variables de Entorno](#variables-de-entorno)
5. [Base de Datos](#base-de-datos)
6. [Funcionalidades](#funcionalidades)
7. [Testing](#testing)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Docker](#docker)

---
 
## Descripción del Proyecto

Aplicación web para gestionar y compartir reseñas de libros. Permite a los usuarios buscar libros, escribir reseñas, votar en reseñas de otros usuarios, y organizar sus libros en listas de lectura personalizadas.

**Repositorio:** [https://github.com/Agustin2102/Libros](https://github.com/Agustin2102/Libros)

---

## Stack Tecnológico

### Frontend y Backend
- **Next.js 15** - Framework React con App Router
- **React 18** - Biblioteca de interfaces de usuario
- **TypeScript** - Lenguaje con tipado estático
- **Tailwind CSS** - Framework de estilos

### Base de Datos
- **MongoDB Atlas** - Base de datos NoSQL en la nube
- **Mongoose** - ODM para MongoDB

### Autenticación
- **Argon2** - Hash de contraseñas
- **JWT (jsonwebtoken)** - Tokens de autenticación

### Testing
- **Vitest** - Framework de testing unitario
- **51 tests unitarios** implementados

### DevOps
- **GitHub Actions** - Pipeline CI/CD
- **Docker** - Containerización
- **GitHub Container Registry** - Registro de imágenes

---

## Configuración Local

### Requisitos Previos
- Node.js 18 o superior
- MongoDB Atlas account (o MongoDB local)
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Agustin2102/Libros.git
   cd Libros
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear archivo `.env.local` en la raíz del proyecto:
   ```env
   MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/?retryWrites=true&w=majority
   JWT_SECRET=tu_secreto_jwt_aqui
   ```

4. **Migrar datos existentes (opcional)**
   
   Si tienes datos en SQLite/Prisma:
   ```bash
   npm run migrate:mongodb
   ```

5. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en navegador**
   ```
   http://localhost:3000
   ```

---

## Variables de Entorno

### Requeridas

**`MONGODB_URI`**
- Cadena de conexión a MongoDB Atlas
- Formato: `mongodb+srv://usuario:contraseña@cluster.mongodb.net/?retryWrites=true&w=majority`
- Obtener en: [MongoDB Atlas](https://cloud.mongodb.com)

**`JWT_SECRET`**
- Secreto para firmar tokens JWT
- Debe ser una cadena aleatoria segura (mínimo 32 caracteres)
- Generar con: `openssl rand -hex 32`

### Opcionales

**`GOOGLE_BOOKS_API_KEY`**
- API key de Google Books
- La aplicación funciona sin ella (con límites de tasa más bajos)

### Ejemplo completo

Ver `docs/ENV_TEMPLATE.md` para un template completo con instrucciones.

---

## Base de Datos

### MongoDB

La aplicación utiliza MongoDB como base de datos principal.

**Modelos implementados:**
- `User` - Usuarios del sistema
- `Review` - Reseñas de libros
- `Vote` - Votos en reseñas (upvote/downvote)
- `Favorite` - Libros marcados como favoritos
- `ReadingList` - Listas de lectura personalizadas
- `Book` - Información de libros (cache de Google Books API)

### Configuración de MongoDB Atlas

1. Crear cuenta en [MongoDB Atlas](https://cloud.mongodb.com)
2. Crear un cluster gratuito
3. Configurar Database Access (crear usuario y contraseña)
4. Configurar Network Access (whitelist `0.0.0.0/0` para desarrollo)
5. Obtener cadena de conexión y agregarla a `.env.local`

### Migración desde SQLite

Si tienes datos existentes en SQLite/Prisma, ejecutar:
```bash
npm run migrate:mongodb
```

Este script migra:
- Libros con toda su información
- Reseñas con ratings y contadores
- Votos con relaciones correctas

Ver `migration_guide.md` para más detalles.

---

## Funcionalidades

### Autenticación y Usuarios
- Registro de usuarios con validación
- Login con JWT
- Perfiles de usuario
- Rutas protegidas con middleware

### Reseñas y Votaciones
- Crear reseñas de libros
- Editar y eliminar reseñas propias
- Sistema de votos (upvote/downvote)
- Prevención de votos duplicados por IP
- Contadores de votos en tiempo real

### Favoritos
- Marcar libros como favoritos
- Ver todos los favoritos en una página dedicada
- Quitar libros de favoritos

### Listas de Lectura
- Crear listas personalizadas
- Agregar/quitar libros de listas
- Ver contenido de cada lista
- Descripción y visibilidad de listas

### Búsqueda de Libros
- Integración con Google Books API
- Búsqueda por título, autor, categoría
- Detalles completos de cada libro

---

## Testing

### Suites de Pruebas

**Autenticación** (14 tests)
- Registro y login de usuarios
- Validación de credenciales
- Generación de tokens JWT
- Seguridad (hashing de contraseñas)

**Votaciones** (17 tests)
- Creación de votos UP/DOWN
- Cambios de voto
- Prevención de duplicados
- Actualización de contadores
- Extracción de IP

**Favoritos** (20 tests)
- Operaciones CRUD de favoritos
- Validación de acciones
- Prevención de duplicados
- Manejo de errores

**Total: 51 tests unitarios**

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Suite específica
npm test -- src/app/api/auth/__tests__/auth-routes.test.ts
npm test -- src/app/api/reviews/__tests__/vote.test.ts
npm test -- src/app/api/favorites/__tests__/favorites.test.ts

# Con coverage
npm run test:coverage
```

---

## CI/CD Pipeline

### GitHub Actions Implementados

**1. Build en Pull Requests**

Archivo: `.github/workflows/build-pr.yml`

- Se ejecuta automáticamente en cada PR
- Instala dependencias
- Genera schemas de Mongoose
- Buildea la aplicación
- Falla el PR si el build no es exitoso

**2. Tests en Pull Requests**

Archivo: `.github/workflows/test-pr.yml`

- Se ejecuta automáticamente en cada PR
- Instala dependencias
- Ejecuta toda la suite de tests
- Reporta resultados
- Falla el PR si algún test no pasa

**3. Docker Build**

Archivo: `.github/workflows/docker-build.yml`

- Se ejecuta al mergear a la rama main
- Construye imagen Docker optimizada
- Publica en GitHub Container Registry
- Tags: `latest`, commit hash

### Verificar Workflows

Ver workflows activos en: [GitHub Actions](https://github.com/Agustin2102/Libros/actions)

---

## Docker

### Usar Imagen desde Registry

```bash
# Descargar imagen
docker pull ghcr.io/agustin2102/libros:latest

# Ejecutar contenedor
docker run -p 3000:3000 -e MONGODB_URI="tu_uri" -e JWT_SECRET="tu_secreto" ghcr.io/agustin2102/libros:latest
```

### Build Local

```bash
# Construir imagen
docker build -t libros-local .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e MONGODB_URI="tu_uri" \
  -e JWT_SECRET="tu_secreto" \
  libros-local

# Acceder en http://localhost:3000
```

### Características del Dockerfile

- Multi-stage build optimizado
- Imagen base `node:18-alpine`
- Tamaño optimizado (~313MB)
- Variables de entorno configurables
- Preparado para producción

---

## Estructura del Proyecto

```
Libros/
├── .github/
│   └── workflows/          # GitHub Actions workflows
├── docs/                   # Documentación
│   ├── ENVIRONMENT_VARIABLES.md
│   └── ENV_TEMPLATE.md
├── scripts/
│   └── migrate-to-mongodb.js  # Script de migración
├── src/
│   ├── app/
│   │   ├── api/            # API Routes
│   │   │   ├── auth/       # Autenticación
│   │   │   ├── favorites/  # Favoritos
│   │   │   ├── reading-lists/  # Listas de lectura
│   │   │   └── reviews/    # Reseñas y votaciones
│   │   ├── favorites/      # Página de favoritos
│   │   ├── reading-lists/  # Páginas de listas
│   │   └── ...
│   ├── components/         # Componentes React
│   ├── context/            # React Context (Auth)
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilidades
│   │   ├── mongoose.ts     # Conexión MongoDB
│   │   ├── auth-utils.ts   # Utilidades de auth
│   │   └── validations.ts  # Schemas Zod
│   └── models/             # Modelos Mongoose
│       ├── User.ts
│       ├── Review.ts
│       ├── Vote.ts
│       ├── Favorite.ts
│       ├── ReadingList.ts
│       └── Book.ts
├── Dockerfile
├── package.json
└── README.md
```

---

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm start                # Servidor de producción

# Testing
npm test                 # Ejecutar tests
npm run test:run         # Tests sin watch mode
npm run test:coverage    # Tests con coverage

# Base de Datos
npm run migrate:mongodb  # Migrar desde SQLite a MongoDB

# Linting
npm run lint             # Ejecutar ESLint
```

---

## Documentación Adicional

- **Variables de Entorno:** `docs/ENVIRONMENT_VARIABLES.md`
- **Template de ENV:** `docs/ENV_TEMPLATE.md`
- **Guía de Migración:** Ver artifact `migration_guide.md`
- **Resumen Completo:** Ver artifact `walkthrough.md`

---

## Contribuir

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

Los workflows de GitHub Actions verificarán automáticamente:
- Build exitoso
- Tests pasando
- Formato de código

---

## Licencia

Este proyecto está bajo la Licencia MIT.

---

## Contacto

**Repositorio:** [github.com/Agustin2102/Libros](https://github.com/Agustin2102/Libros)
