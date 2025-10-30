/**
 * Componente AUXILIAR que: Es el input donde el usuario escribe la petición
 * - Maneja input de texto
 * - Envío con Enter
 * - Validación de mensajes vacíos
 * - Estados de carga
 */


import {useState} from 'react';

interface MessageInputProps{
    onSendMessage: (message: string) => void;
    disabled: boolean;
}

export function MessageInput({onSendMessage, disabled}: MessageInputProps){
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(message.trim() && !disabled){
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if(e.key === 'Enter' && !e.shiftKey){
            e.preventDefault();
            handleSubmit(e);
        }
    }


    return(
        <div className="border-t border-gray-700/50 bg-[#343541]">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-4">
                <div className="relative flex items-center bg-[#40414f] rounded-2xl border border-gray-600/50 focus-within:border-gray-500 transition-colors">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey){
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder="Envía un mensaje..."
                        disabled={disabled}
                        rows={1}
                        className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-3 pr-12 resize-none focus:outline-none disabled:opacity-50 max-h-32"
                        style={{ 
                            minHeight: '44px',
                            maxHeight: '200px',
                        }}
                    />
                    
                    <button
                        type="submit"
                        disabled={disabled || !message.trim()}
                        className="absolute right-2 w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                        aria-label="Enviar mensaje"
                    >
                        <svg 
                            className="w-4 h-4 text-gray-800" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M5 12h14M12 5l7 7-7 7" 
                            />
                        </svg>
                    </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                    Presiona Enter para enviar, Shift + Enter para nueva línea
                </p>
            </form>
        </div>
    );
}