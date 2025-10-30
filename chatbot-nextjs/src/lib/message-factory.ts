/**
 * Patron : Factory
 *      - Crea mensajes de diferentes tipos
 *      - Valida y sanitiza el contenido
 */

import { Message } from '@/types/chat';
import { validateMessage, sanitizeContent } from './validation';

export class MessageFactory {

    // Crear mensaje de usuario
    static createUserMessage(content: string): Message {
        const sanitizedContent = sanitizeContent(content);
        const validatedData = validateMessage({
            content: sanitizedContent,
            role: 'user'
        });

        return {
            id: crypto.randomUUID(),
            role: validatedData.role,
            content: validatedData.content,
            timestamp: new Date(),
        };
    }

    // Crear mensaje de error
    static createErrorMessage(error: string): Message{
        return {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Error: ${error}`,
            timestamp: new Date(),
        };
    }
}