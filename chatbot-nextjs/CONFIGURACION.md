# Chatbot Next.js - Guía de Configuración

Un chatbot educativo construido con Next.js y OpenRouter API.

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Configuración de OpenRouter
OPENROUTER_API_KEY=tu_api_key_aqui
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=nousresearch/hermes-3-llama-3.1-405b:free
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=Chatbot Educativo

# Configuración de Next.js
NODE_ENV=development
```

### 2. Obtener API Key de OpenRouter

1. Ve a [OpenRouter](https://openrouter.ai/)
2. Crea una cuenta
3. Genera una API key
4. Reemplaza `tu_api_key_aqui` con tu API key real

### 3. Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## Solución de Problemas

### Error de Conexión con OpenRouter
- Verifica que tu API key sea válida
- Asegúrate de tener conexión a internet
- El modelo gratuito puede estar saturado, espera unos minutos

### Errores de Fuentes
- Las fuentes ahora usan Inter de Google Fonts (más confiable)
- Si persisten problemas, verifica tu conexión a internet

### Error 405 en API
- El endpoint `/api/chat` solo acepta POST requests
- Los GET requests ahora devuelven información útil del endpoint

## Características

- ✅ Chat en tiempo real con streaming
- ✅ Persistencia de mensajes en localStorage
- ✅ Manejo robusto de errores
- ✅ Interfaz moderna y responsive
- ✅ Soporte para modelos de OpenRouter
