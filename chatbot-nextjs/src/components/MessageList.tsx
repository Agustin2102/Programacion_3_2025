/**
 * Componente AUXILIAR que: muestra la lista de mensajes
 * - Renderiza lista de mensajes
 * - Muestra indicador de typing
 * - Scroll automático
 * - Diseño responsive
 */

import { Message } from '@/types/chat';
import { TypingIndicator } from './TypingIndicator';
import { useRef, useEffect } from 'react';

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll automático cuando hay nuevos mensajes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && !isLoading && (
                <div className="text-center text-gray-500 mt-8">
                    <p className="text-lg">¡Hola!</p>
                    <p className="text-sm">Escribe un mensaje para comenzar la conversación</p>
                </div>
            )}
            
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                            message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                    >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            ))}

            {isLoading && <TypingIndicator />}

            {/* Elemento invisible para scroll automático */}
            <div ref={messagesEndRef} />
        </div>
    );
}