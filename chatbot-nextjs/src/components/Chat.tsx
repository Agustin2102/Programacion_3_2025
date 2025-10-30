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
            await append({
                role: 'user',
                content: message
            });
        } catch (error) {
            console.error('Error enviando mensaje:', error);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-lg">
            {/* Header */}
            <div className="bg-blue-500 text-white p-4 text-center flex justify-between items-center">
                <h1 className="text-xl font-bold">Chatbot con IA</h1>
                <button
                    onClick={clearMessages}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                    title="Limpiar conversación"
                >
                    🗑️ Limpiar
                </button>
            </div>
            
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