# Plataforma de Reseñas de Libros - CI/CD Pipeline

## **Índice de Entregables del Proyecto**

### **Navegación Rápida para Profesores:**

1. [URL de la Aplicación Deployada](#url-de-la-aplicación-deployada)
2. [Repositorio GitHub con Workflows](#repositorio-github)
3. [Documentación Requerida](#documentación-requerida)
   - [Cómo hacer Deploy Local](#deploy-local)
   - [Cómo funcionan los GitHub Actions](#github-actions---pipeline-cicd)
   - [Variables de Entorno](#variables-de-entorno)
   - [Instrucciones para Docker](#ejecución-con-docker)
4. [Demostración de GitHub Actions](#demostración-de-github-actions)

---

## **URL de la Aplicación Deployada**

**Aplicación funcionando en producción:** 
[https://tarealibrost9.vercel.app](https://tarealibrost9.vercel.app)

**Verificación:** La aplicación está deployada en Vercel y funcionando correctamente.

---

## **Repositorio GitHub**

**Repositorio:** [https://github.com/Agustin2102/Libros](https://github.com/Agustin2102/Libros)

### **Workflows GitHub Actions Implementados:**
- `.github/workflows/build-pr.yml` - Build en Pull Requests
- `.github/workflows/test-pr.yml` - Tests en Pull Requests  
- `.github/workflows/docker-build.yml` - Docker Container Build

---

## **Documentación Requerida**

## **Deploy Local**

### **Requisitos Previos**
- Node.js 18+ instalado
- Git instalado

### **Pasos de Instalación**

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Agustin2102/Libros.git
   cd Libros/Tarea_Deploy y CICD
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   # Crear archivo .env
   echo 'DATABASE_URL="file:./dev.db"' > .env
   ```

4. **Configurar base de datos**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

6. **Abrir en navegador**:
   ```
   http://localhost:3000
   ```

---

## **GitHub Actions - Pipeline CI/CD**

### **1. Build en Pull Requests** (`.github/workflows/build-pr.yml`)

**Funcionalidad según enunciado:**
- Se ejecuta automáticamente en cada Pull Request
- Instala las dependencias del proyecto
- Buildea la aplicación
- Falla el PR si el build no es exitoso
- Proporciona feedback claro sobre errores de build

**Configuración:**
```yaml
name: Build Check on Pull Request
on:
  pull_request:
    branches: [ main, master ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npx prisma generate
    - run: npm run build
```

### **2. Tests en Pull Requests** (`.github/workflows/test-pr.yml`)

**Funcionalidad según enunciado:**
- Se ejecuta automáticamente en cada Pull Request
- Instala las dependencias del proyecto
- Ejecuta todos los tests unitarios
- Reporta los resultados de los tests
- Falla el PR si algún test no pasa

**Configuración:**
```yaml
name: Test Suite on Pull Request
on:
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npx prisma generate
    - run: npm run test:run
```

### **3. Docker Container** (`.github/workflows/docker-build.yml`)

**Funcionalidad según enunciado:**
- Se ejecuta cuando se mergea código a la rama principal (main)
- Construye una imagen Docker de la aplicación
- Publica la imagen en GitHub Container Registry (ghcr.io)
- Usa tags apropiados (latest, commit hash)

**Configuración:**
```yaml
name: Build and Push Docker Image
on:
  push:
    branches: [ main, master ]
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: docker/setup-buildx-action@v3
    - uses: docker/login-action@v3
    - uses: docker/build-push-action@v5
      with:
        push: true
        tags: ghcr.io/agustin2102/libros:latest
```

---

## **Variables de Entorno**

### **Desarrollo Local**
```env
# .env
DATABASE_URL="file:./dev.db"
```

### **Producción (Vercel)**
- `DATABASE_URL` - URL de la base de datos
- `NEXT_TELEMETRY_DISABLED` - Deshabilitar telemetría de Next.js (opcional)

---

## **Instrucciones para ejecutar con Docker**

### **Estado de las Imágenes Docker:**
**Confirmado:** Las imágenes Docker se están construyendo y subiendo exitosamente
- Workflow de GitHub Actions funciona correctamente
- Build local verificado (imagen de 312.59 MB)
- Contenedor ejecutándose sin errores
- **Nota:** El acceso público a `ghcr.io/agustin2102/libros:latest` puede estar restringido por configuración del repositorio

### **Verificación Local Exitosa:**
```bash
# Construir imagen localmente (VERIFICADO FUNCIONANDO)
docker build -t libros-local .

# Ejecutar el contenedor (VERIFICADO FUNCIONANDO)
docker run -p 3000:3000 libros-local

# Verificar imagen creada
docker images
# REPOSITORY     TAG       IMAGE ID       CREATED         SIZE
# libros-local   latest    1f89fa6e9e6b   7 minutes ago   312.59 MB
```

### **Usando imagen desde GitHub Container Registry:**
```bash
# Intentar descargar la imagen del registry
docker pull ghcr.io/agustin2102/libros:latest

# Ejecutar si el pull es exitoso
docker run -p 3000:3000 ghcr.io/agustin2102/libros:latest
```

### **Dockerfile Optimizado y Verificado**
- Multi-stage build para optimizar tamaño final
- Imagen base `node:18-alpine` 
- Variables de entorno configuradas correctamente
- Generación de Prisma Client incluida
- **Probado localmente** - Build exitoso y contenedor funcionando

---

## **Demostración de GitHub Actions**

### **Cómo Verificar que Funcionan:**

1. **Ver Workflows en GitHub:**
   - Ve a [GitHub.com/Agustin2102/Libros](https://github.com/Agustin2102/Libros)
   - Click en la pestaña "Actions"
   - Verás los workflows ejecutándose o completados

2. **Crear un Pull Request para probar:**
   ```bash
   # Crear una rama de prueba
   git checkout -b test-feature
   
   # Hacer un cambio mínimo
   echo "# Test" >> test.md
   git add test.md
   git commit -m "Test PR"
   git push origin test-feature
   
   # Crear PR en GitHub
   # Los workflows build y test se ejecutarán automáticamente
   ```

3. **Docker Images - Estado Verificado:**
   - **Workflow ejecutándose:** El push a main trigger automáticamente el build de Docker
   - **Build local exitoso:** Imagen construida localmente (312.59 MB)
   - **Contenedor funcionando:** Probado en localhost:3000
   - **Acceso público:** GitHub Container Registry puede requerir autenticación
   - **Registry URL:** `ghcr.io/agustin2102/libros:latest`

### **Evidencia de Funcionamiento:**
- Build checks pasan en PRs
- Tests se ejecutan automáticamente
- **Docker images se construyen automáticamente** al mergear a main
- **Docker image verificada localmente** (312.59 MB, funcionando)
- Cache de dependencias mejora tiempos de build
- Secrets de GitHub se usan correctamente
- **Dockerfile probado** - Contenedor ejecutándose sin errores

### **Estado Docker Detallado:**
```bash
# Evidencia de imagen local construida exitosamente
REPOSITORY     TAG       IMAGE ID       CREATED         SIZE
libros-local   latest    1f89fa6e9e6b   7 minutes ago   312.59 MB

# Contenedor ejecutándose correctamente
✓ Ready in 167ms
Local: http://localhost:3000
```

---

## **Consideraciones Técnicas Implementadas**

### **GitHub Actions:**
- Versiones más recientes de actions (node@v4, docker@v5)
- Cache implementado para dependencias (`cache: 'npm'`)
- Secrets de GitHub para información sensible (`GITHUB_TOKEN`)
- Workflows claramente documentados

### **Dockerfile:**
- Imagen base `node:18-alpine` 
- Multi-stage build implementado
- Variables de entorno configuradas
- Optimización de tamaño con `.dockerignore`

### **Repositorio:**
- Repositorio público para GitHub Actions gratuitas
- Workflows en `.github/workflows/`
- Documentación completa en README

---

## **Tecnologías del Proyecto**

### **Frontend & Backend**
- **Next.js 15** - Framework de React
- **React 18** - Biblioteca para interfaces
- **TypeScript** - Lenguaje tipado
- **Tailwind CSS** - Estilos
- **Prisma** - ORM para base de datos
- **SQLite** - Base de datos

### **DevOps & CI/CD**
- **GitHub Actions** - Pipeline automatizado
- **Docker** - Containerización
- **Vercel** - Deployment
- **GitHub Container Registry** - Registro de imágenes

---

**Proyecto CI/CD completado según especificaciones del enunciado**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   # Crear archivo .env
   echo 'DATABASE_URL="file:./dev.db"' > .env
   ```

4. **Configurar base de datos**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

6. **Abrir en navegador**:
   ```
   http://localhost:3000
   ```

---

---

## **Variables de Entorno**

### **Desarrollo Local**
```env
# .env
DATABASE_URL="file:./dev.db"
```

### **Producción (Vercel)**
- `DATABASE_URL` - URL de la base de datos PostgreSQL
- `NEXT_TELEMETRY_DISABLED` - Deshabilitar telemetría de Next.js

---

## **Demostración de GitHub Actions**

### **Cómo Verificar que Funcionan:**

1. **Ver Workflows en GitHub:**
   - Ve a [GitHub.com/Agustin2102/Libros](https://github.com/Agustin2102/Libros)
   - Click en la pestaña "Actions"
   - Verás los workflows ejecutándose o completados

2. **Crear un Pull Request para probar:**
   ```bash
   # Crear una rama de prueba
   git checkout -b test-feature
   
   # Hacer un cambio mínimo
   echo "# Test" >> test.md
   git add test.md
   git commit -m "Test PR"
   git push origin test-feature
   
   # Crear PR en GitHub
   # Los workflows build y test se ejecutarán automáticamente
   ```

3. **Ver Docker Images en GitHub Container Registry:**
   - Ve a [GitHub Container Registry](https://github.com/Agustin2102/Libros/pkgs/container/libros)
   - Verás las imágenes Docker publicadas automáticamente

### **Evidencia de Funcionamiento:**
- Build checks pasan en PRs
- Tests se ejecutan automáticamente  
- Docker images se construyen al mergear a main
- Cache de dependencias mejora tiempos de build
- Secrets de GitHub se usan correctamente

---

## **Consideraciones Técnicas Implementadas**

### **GitHub Actions:**
- Versiones más recientes de actions (node@v4, docker@v5)
- Cache implementado para dependencias
- Secrets de GitHub para información sensible
- Workflows claramente documentados

### **Dockerfile:**
- Imagen base `node:18-alpine` 
- Multi-stage build implementado
- Variables de entorno configuradas
- Optimización de tamaño con `.dockerignore`

### **Repositorio:**
- Repositorio público para GitHub Actions gratuitas
- Workflows en `.github/workflows/`
- Documentación completa en README

---

**Proyecto CI/CD completado según especificaciones del enunciado**


