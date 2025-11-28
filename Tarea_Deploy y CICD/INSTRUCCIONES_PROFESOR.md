# 🎓 Instrucciones para el Profesor


### 🚀 Pasos para ejecutar la aplicación:

1. **Clonar/Descargar el proyecto**
   ```bash
   # Ya tienes el proyecto, ve al directorio
   cd libros
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar archivo de entorno**
   ```bash
   # Copiar el archivo de ejemplo
   copy .env.example .env
   # O crear manualmente un archivo .env con:
   DATABASE_URL="file:./dev.db"
   ```

4. **Ejecutar migraciones de base de datos**
   ```bash
   npx prisma migrate dev
   ```

5. **Iniciar la aplicación**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```
