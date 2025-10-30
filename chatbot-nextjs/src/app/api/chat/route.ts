/**
 * API Route para el chat
 * IMPORTANTE: Este archivo DEBE estar en /app/api/chat/route.ts
 * 
 * Responsabilidades:
 * - Recibir mensajes del frontend
 * - Comunicarse con OpenRouter de forma segura
 * - Implementar streaming de respuestas
 * - Validar inputs
 * - Manejar errores
 */

import { createOpenAI } from '@ai-sdk/openai';
import { streamText, CoreMessage } from 'ai';

// Configuración de OpenRouter como proveedor OpenAI-compatible
const openrouter = createOpenAI({
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    headers: {
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_SITE_NAME || 'Chatbot Educativo',
    },
});

// Configurar el runtime como edge para mejor performance
export const runtime = 'edge';

// Manejar requests GET con información del endpoint
export async function GET() {
    return new Response(
        JSON.stringify({ 
            message: 'Este endpoint solo acepta POST requests',
            usage: 'Enviar mensajes usando POST con { messages: [...] }'
        }),
        { 
            status: 405, 
            headers: { 'Content-Type': 'application/json' } 
        }
    );
}

export async function POST(req: Request) {
    try {
        // 1. Validar que exista la API key
        if (!process.env.OPENROUTER_API_KEY) {
            console.error('❌ OPENROUTER_API_KEY no está configurada');
            return new Response(
                JSON.stringify({ 
                    error: 'API Key no configurada. Verifica tu archivo .env.local' 
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 2. Parsear el body de la request
        const { messages } = await req.json();

        // 3. Validar que haya mensajes
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No se proporcionaron mensajes' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 4. Obtener solo el ÚLTIMO mensaje del usuario (sin contexto previo)
        const lastMessage = messages[messages.length - 1];
        
        if (!lastMessage || !lastMessage.content) {
            return new Response(
                JSON.stringify({ error: 'Mensaje inválido' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 5. Crear un mensaje simple para OpenRouter (solo el actual)
        const userMessage: CoreMessage = {
            role: 'user',
            content: String(lastMessage.content).slice(0, 10000)
        };

        // 6. Obtener el modelo de las variables de entorno
        const model = process.env.OPENROUTER_MODEL || 'google/gemini-flash-1.5-8b';

        console.log('🤖 Usando modelo:', model);
        console.log('💬 Enviando mensaje del usuario');
        console.log('📊 Timestamp:', new Date().toISOString());

        // 7. Crear el stream de respuesta usando AI SDK (sin historial)
        const result = streamText({
            model: openrouter(model),
            messages: [userMessage], // Solo el mensaje actual
            temperature: 0.7,
            maxRetries: 0, // Evitar reintentos automáticos
        });

        // 8. Convertir a stream de texto y retornar
        const stream = result.textStream;
        
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        // Manejo robusto de errores
        console.error('❌ Error en API route:', error);

        // Determinar tipo de error
        let errorMessage = 'Error al procesar la solicitud';
        let statusCode = 500;

        // Detectar error 429 específicamente
        if (error?.statusCode === 429 || error?.data?.error?.code === 429) {
            errorMessage = '⏳ El modelo está temporalmente saturado. Por favor espera 30 segundos e intenta de nuevo.';
            statusCode = 429;
        } else if (error?.message?.includes('API key')) {
            errorMessage = 'API Key inválida o no configurada';
            statusCode = 401;
        } else if (error?.message?.includes('rate limit')) {
            errorMessage = 'Límite de requests excedido. Intenta en unos momentos';
            statusCode = 429;
        } else if (error?.message?.includes('model')) {
            errorMessage = 'Modelo no disponible o no soportado';
            statusCode = 400;
        }

        return new Response(
            JSON.stringify({ 
                error: errorMessage,
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            }),
            { 
                status: statusCode, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }
}
