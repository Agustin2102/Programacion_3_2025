# Plataforma de Reseñas de Libros - CI/CD Pipeline

## **Entregables del Ejercicio 10**

### **Enlaces Principales:**
- **Aplicación Deployada:** [https://tarealibrost9.vercel.app](https://tarealibrost9.vercel.app)
- **Repositorio GitHub:** [https://github.com/Agustin2102/Libros](https://github.com/Agustin2102/Libros)
- **Container Registry:** [ghcr.io/agustin2102/libros](https://github.com/Agustin2102/Libros/pkgs/container/libros)

---

## **GitHub Actions Implementados**

### **1. Build en Pull Requests** 
**Archivo:** `.github/workflows/build-pr.yml`
- Se ejecuta automáticamente en cada PR
- Instala dependencias del proyecto  
- Buildea la aplicación
- Falla el PR si el build no es exitoso
- Feedback claro sobre errores

### **2. Tests en Pull Requests**
**Archivo:** `.github/workflows/test-pr.yml`
- Se ejecuta automáticamente en cada PR
- Instala dependencias del proyecto
- Ejecuta todos los tests unitarios
- Reporta resultados de tests
- Falla el PR si algún test no pasa

### **3. Docker Container**
**Archivo:** `.github/workflows/docker-build.yml`
- Se ejecuta al mergear a rama principal (main)
- Construye imagen Docker de la aplicación
- Publica en GitHub Container Registry (ghcr.io)
- Tags apropiados (latest, commit hash, branch)

---

## **Deploy Local**

```bash
# 1. Clonar repositorio
git clone https://github.com/Agustin2102/Libros.git
cd Libros

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
echo 'DATABASE_URL="file:./dev.db"' > .env

# 4. Configurar base de datos
npx prisma generate
npx prisma migrate dev

# 5. Iniciar aplicación
npm run dev

# 6. Abrir http://localhost:3000
```

---

## **Variables de Entorno**

### **Desarrollo Local (.env)**
```env
DATABASE_URL="file:./dev.db"
```

### **Producción (Vercel)**
- `DATABASE_URL` - URL de base de datos PostgreSQL
- `NEXT_TELEMETRY_DISABLED=1` - Deshabilitar telemetría

---

## **Instrucciones Docker**

### **Usar Imagen del Registry**
```bash
# Descargar y ejecutar desde GitHub Container Registry
docker pull ghcr.io/agustin2102/libros:latest
docker run -p 3000:3000 ghcr.io/agustin2102/libros:latest
```

### **Build Local**
```bash
# Construir imagen localmente
docker build -t libros-local .

# Ejecutar contenedor
docker run -p 3000:3000 libros-local

# Acceder en http://localhost:3000
```

### **Características del Dockerfile:**
- Multi-stage build optimizado
- Imagen base `node:18-alpine`
- Tamaño final optimizado (~313MB)
- Variables de entorno configuradas
- Prisma Client generation incluido

---

## **Demostración GitHub Actions**

### **Workflows Activos:**
1. **Verificar en GitHub:** [Actions Tab](https://github.com/Agustin2102/Libros/actions)
2. **Ver últimas ejecuciones:** Cada push/PR triggerea automáticamente
3. **Docker Images:** [Container Registry](https://github.com/Agustin2102/Libros/pkgs/container/libros)

### **Para Probar:**
```bash
# Crear PR de prueba
git checkout -b test-actions
echo "# Test" >> test.md
git add test.md
git commit -m "Test GitHub Actions"
git push origin test-actions
# Crear PR en GitHub - verás los workflows ejecutándose
```

### **Estado Verificado:**
- **Build Check:** Pasa automáticamente en PRs
- **Test Suite:** Ejecuta tests unitarios
- **Docker Build:** Construye y publica imágenes
- **Cache:** Optimiza tiempos de build
- **Secrets:** GITHUB_TOKEN configurado correctamente

---

## **Consideraciones Técnicas Cumplidas**

### **Repositorio:**
- Repositorio público (GitHub Actions gratuitas)
- Workflows documentados y funcionales
- Multi-stage Dockerfile optimizado

### **GitHub Actions:**
- Versiones recientes (node@v4, docker@v5)
- Cache para dependencias (`cache: 'npm'`)
- Manejo seguro de secrets
- Documentación clara de workflows

### **Deployment:**
- Vercel deployment funcional
- Variables de entorno configuradas
- Base de datos PostgreSQL en producción

---

## **Stack Tecnológico**

- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** SQLite (dev)
- **DevOps:** GitHub Actions, Docker, Vercel
- **Testing:** Vitest, React Testing Library

---