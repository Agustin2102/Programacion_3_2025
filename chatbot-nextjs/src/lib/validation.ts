/**
 * Patron : Strategy
 *      - Diferentes estratregias de validación
 *      - Permite la extención de nuevos tipos de validaciónes
 */

import {z} from 'zod';

// Estrategia de valición para mensajes
export const messageSchema = z.object({
    content: z.string()
        .min(1, 'El mensaje no puede estar vacío.')
        .max(1000, 'El mensaje es demasiado largo')
        .trim(),
    role: z.enum(['user', 'assistant']),
});

// Estrategia de validación para request del chat
export const chatRequestSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
    })).min(1, 'Debe haber al menos un mensaje'),
});


// Función para validar mensaje
export function validateMessage(data: unknown) {
    return messageSchema.parse(data);
}

// Función para validar reuqest del chat
export function validateChatRequest(data: unknown) {
    return chatRequestSchema.parse(data);
}

// Función para sanitizar contenido
export function sanitizeContent(content: string): string {
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
      .replace(/javascript:/gi, '') // Remover javascript: URLs
      .trim();
}