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
        <div className="flex-1 overflow-y-auto">
            {messages.length === 0 && !isLoading && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400 max-w-md px-4">
                        <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-2xl">AI</span>
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-2">¿En qué puedo ayudarte?</h2>
                        <p className="text-sm text-gray-500">Escribe un mensaje para comenzar la conversación</p>
                    </div>
                </div>
            )}
            
            <div className="max-w-3xl mx-auto px-4 py-6">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-4 mb-6 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        {message.role === 'assistant' && (
                            <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0 mt-1">
                                <span className="text-white font-bold text-xs">AI</span>
                            </div>
                        )}
                        
                        <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                            <div
                                className={`px-4 py-3 rounded-2xl ${
                                    message.role === 'user'
                                        ? 'bg-[#10a37f] text-white'
                                        : 'bg-[#444654] text-gray-100'
                                }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            </div>
                            <span className="text-xs text-gray-500 mt-1 px-1">
                                {message.timestamp.toLocaleTimeString('es-ES', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </span>
                        </div>
                        
                        {message.role === 'user' && (
                            <div className="w-8 h-8 bg-[#10a37f] rounded-lg flex items-center justify-center shrink-0 mt-1">
                                <span className="text-white font-bold text-xs">TÚ</span>
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4 mb-6">
                        <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0 mt-1">
                            <span className="text-white font-bold text-xs">AI</span>
                        </div>
                        <div className="bg-[#444654] px-4 py-3 rounded-2xl">
                            <TypingIndicator />
                        </div>
                    </div>
                )}

                {/* Elemento invisible para scroll automático */}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}