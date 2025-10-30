/**
 * Hook personalizado para manejar el chat con persistencia
 * Patrón: Custom Hook
 * - Encapsula la lógica del chat
 * - Maneja persistencia en localStorage
 * - Proporciona interfaz limpia para componentes
 */

'use client'
import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/chat';

interface UseChatReturn {
    messages: Message[];
    append: (message: { role: 'user' | 'assistant'; content: string }) => Promise<void>;
    isLoading: boolean;
    error: Error | undefined;
    clearMessages: () => void;
}

export function useChat(): UseChatReturn {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | undefined>(undefined);

    // Cargar mensajes desde localStorage al iniciar
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        try {
            const saved = localStorage.getItem('chat-messages');
            if (saved) {
                const parsed = JSON.parse(saved);
                setMessages(parsed.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                })));
            }
        } catch (error) {
            console.error('Error cargando mensajes:', error);
        }
    }, []);

    // Guardar mensajes en localStorage cuando cambien
    useEffect(() => {
        if (typeof window === 'undefined' || messages.length === 0) return;
        
        try {
            localStorage.setItem('chat-messages', JSON.stringify(messages));
        } catch (error) {
            console.error('Error guardando mensajes:', error);
        }
    }, [messages]);

    // Función para agregar un mensaje y obtener respuesta
    const append = useCallback(async (message: { role: 'user' | 'assistant'; content: string }) => {
        setIsLoading(true);
        setError(undefined);

        console.log('📤 Enviando mensaje:', message.content.substring(0, 50));

        // Crear el mensaje del usuario
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: message.role,
            content: message.content,
            timestamp: new Date()
        };

        // Agregar mensaje del usuario inmediatamente
        setMessages(prev => [...prev, userMessage]);

        try {
            // Solo enviar el último mensaje del usuario (sin historial)
            // Esto evita problemas con mensajes vacíos del asistente
            const messagesToSend = [{
                //role: userMessage.role,
                content: userMessage.content
            }];

            // Llamar al API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: messagesToSend
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                
                // Manejo específico de rate limit (429)
                if (response.status === 429) {
                    throw new Error('⏳ Demasiadas solicitudes. El modelo gratuito está saturado. Por favor espera 30-60 segundos e intenta de nuevo.');
                }
                
                throw new Error(errorData.error || `Error ${response.status}`);
            }

            // Leer el stream de respuesta
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            
            if (!reader) {
                throw new Error('No se pudo obtener el stream de respuesta');
            }

            let assistantContent = '';
            const assistantMessageId = `assistant-${Date.now()}`;
            let assistantMessageCreated = false;

            // Leer el stream chunk por chunk
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                // Decodificar el chunk - formato de texto simple
                const chunk = decoder.decode(value, { stream: true });
                assistantContent += chunk;
                
                // Crear el mensaje del asistente solo cuando llegue el primer chunk
                if (!assistantMessageCreated) {
                    const assistantMessage: Message = {
                        id: assistantMessageId,
                        role: 'assistant',
                        content: assistantContent,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, assistantMessage]);
                    assistantMessageCreated = true;
                } else {
                    // Actualizar el mensaje del asistente
                    setMessages(prev => prev.map(msg => 
                        msg.id === assistantMessageId 
                            ? { ...msg, content: assistantContent }
                            : msg
                    ));
                }
            }

        } catch (err) {
            console.error('Error en chat:', err);
            setError(err as Error);
            
            // Agregar mensaje de error
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            const errorMsg: Message = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `Error: ${errorMessage}. Por favor, intenta de nuevo.`,
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Función para limpiar mensajes
    const clearMessages = useCallback(() => {
        setMessages([]);
        localStorage.removeItem('chat-messages');
    }, []);

    return {
        messages,
        append,
        isLoading,
        error,
        clearMessages
    };
}
