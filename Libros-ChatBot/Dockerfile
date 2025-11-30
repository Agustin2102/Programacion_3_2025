# Multi-stage build para optimizar el tamaño final
FROM node:18-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
# Verificar https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
# para entender por qué se necesita libc6-compat
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependencias basadas en el gestor de paquetes preferido
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts --silent

# Rebuild el código fuente solo cuando sea necesario
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Instalar dependencias de desarrollo necesarias para el build
RUN npm install --production=false --silent

# Next.js recolecta telemetría completamente anónima sobre el uso general.
# Aprende más aquí: https://nextjs.org/telemetry
# Descomenta la siguiente línea si quieres deshabilitar la telemetría durante el build.
ENV NEXT_TELEMETRY_DISABLED=1

# Generar cliente de Prisma y buildear aplicación
RUN npm run build

# Imagen de producción, copiar todos los archivos y ejecutar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Descomenta la siguiente línea si quieres deshabilitar la telemetría durante el runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Aprovechar automáticamente las trazas de salida para reducir el tamaño de imagen
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar esquema de Prisma y base de datos (si existe)
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
