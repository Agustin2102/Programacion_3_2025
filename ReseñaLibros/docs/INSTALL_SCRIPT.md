# 🚀 Script de Instalación Rápida

## 📦 Comandos para Ejecutar en Orden

Copia y pega estos comandos uno por uno en tu terminal:

### 1️⃣ Instalar Dependencias

```bash
npm install ai @ai-sdk/openai zod
```

### 2️⃣ Configurar Variables de Entorno

Crea o edita `.env.local`:

```bash
# En Windows PowerShell
notepad .env.local
```

Agrega estas líneas (reemplaza con tus propias keys):

```env
DATABASE_URL="file:./dev.db"
OPENROUTER_API_KEY=sk-or-v1-tu-clave-aqui
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=anthropic/claude-3-haiku
GOOGLE_BOOKS_API_KEY=
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### 3️⃣ Actualizar Schema de Prisma

```bash
# Abrir el archivo para editar
notepad prisma/schema.prisma
```

Agrega los nuevos modelos al final del archivo (ver GUIA_IMPLEMENTACION_OPCION1.md para los modelos exactos).

### 4️⃣ Crear Migración de Base de Datos

```bash
npx prisma migrate dev --name add_ai_advisor_tables
```

Esto automáticamente:
- Crea las nuevas tablas
- Regenera Prisma Client

### 5️⃣ Verificar la Migración

```bash
npx prisma studio
```

Deberías ver las nuevas tablas: `reading_list_items` y `read_books`.

### 6️⃣ Crear Archivos de Backend

Crea estos directorios y archivos:

```bash
# Crear directorios
mkdir src\app\api\advisor
mkdir src\app\api\tools

# Crear archivos (cada uno con notepad)
notepad src\app\api\tools\types.ts
notepad src\app\api\tools\books.ts
notepad src\app\api\tools\reading-list.ts
notepad src\app\api\tools\stats.ts
notepad src\app\api\advisor\route.ts
notepad src\app\advisor\page.tsx
```

Copia el contenido de cada archivo desde `GUIA_IMPLEMENTACION_OPCION1.md`.

### 7️⃣ Actualizar Header Principal (Opcional)

```bash
notepad src\app\page.tsx
```

Agrega un enlace al AI Advisor en el header.

### 8️⃣ Iniciar Servidor y Probar

```bash
npm run dev
```

Abre en el navegador: `http://localhost:3000/advisor`

### 9️⃣ Probar Funcionalidades

Ejecuta estos comandos en el chat:

1. "Hola, busca libros de ciencia ficción"
2. "Agrega 'Dune' a mi lista de lectura"
3. "Muéstrame mi lista"
4. "¿Cuántos libros he leído?"

---

## ✅ Checklist de Verificación

Antes de considerar la instalación completa, verifica:

- [ ] Las dependencias se instalaron sin errores
- [ ] `.env.local` existe y tiene OPENROUTER_API_KEY
- [ ] La migración de Prisma se ejecutó sin errores
- [ ] `npx prisma studio` muestra las 2 tablas nuevas
- [ ] Todos los archivos se crearon correctamente
- [ ] El servidor inicia sin errores
- [ ] Puedes acceder a `/advisor`
- [ ] El chat responde y ejecuta tools

---

## 🆘 Si Algo Sale Mal

### Problema: "npm install falla"
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problema: "Prisma migration failed"
```bash
# Ver errores específicos
npx prisma migrate dev --name add_ai_advisor_tables

# Si todo falla, resetear BD (CUIDADO: pierdes datos)
rm prisma/dev.db
npx prisma migrate dev
```

### Problema: "OPENROUTER_API_KEY not found"
```bash
# Verificar que .env.local existe
notepad .env.local

# Reiniciar el servidor después de editar
npm run dev
```

### Problema: "Module not found"
```bash
# Verificar que instalaste las dependencias
npm list ai @ai-sdk/openai zod

# Si faltan, reinstalar
npm install ai @ai-sdk/openai zod
```

---

## 📞 Siguiente Paso

Una vez que todo funcione:
1. Lee `GUIA_IMPLEMENTACION_OPCION1.md` para entender cada componente
2. Personaliza la UI según tus gustos
3. Agrega más features si quieres

¡Buena suerte! 🍀

