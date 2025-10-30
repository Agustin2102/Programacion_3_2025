/**
 * Componente PRINCIPAL del chat que:
 * - Muestra la interfaz del chat
 * - Maneja el estado de la conversación
 * - Implementa el streaming de respuestas
 * - Incluye los indicadores de carga
 * - Maneja persistencia de mensajes
 */

'use client'
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ErrorMessage } from './ErrorMessage';
import { useChat } from '@/hooks/useChat';

export function Chat() {
    const { 
        messages, 
        append,
        isLoading, 
        error, 
        clearMessages 
    } = useChat();

    // Función para enviar mensaje desde el componente MessageInput
    const handleSendMessage = async (message: string) => {
        try {
            // Usar el método append del hook para enviar mensajes
            //console.log('📥 Mensaje enviado por el usuario:', message.substring(0, 50));
            await append({
                role: 'user',
                content: message
            });
        } catch (error) {
            console.error('Error enviando mensaje:', error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#343541]">
            {/* Header estilo ChatGPT */}
            <header className="sticky top-0 z-10 bg-[#202123] border-b border-gray-700/50">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">AI</span>
                        </div>
                        <h1 className="text-white text-lg font-semibold">ChatBot</h1>
                    </div>
                    <button
                        onClick={clearMessages}
                        className="px-3 py-1.5 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors text-sm flex items-center gap-2"
                        title="Nueva conversación"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva
                    </button>
                </div>
            </header>
            
            {/* Lista de mensajes */}
            <MessageList messages={messages} isLoading={isLoading} />
            
            {/* Manejo de errores */}
            {error && (
                <ErrorMessage 
                    error={error.message} 
                    onRetry={() => window.location.reload()} 
                />
            )}
            
            {/* Input de mensajes */}
            <MessageInput 
                onSendMessage={handleSendMessage} 
                disabled={isLoading} 
            />
        </div>
    );
}