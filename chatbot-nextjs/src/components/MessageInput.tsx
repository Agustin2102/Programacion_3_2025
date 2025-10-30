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
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
            <input
                type = 'text'
                value = {message}
                onChange = {(e) => setMessage(e.target.value)}
                onKeyPress = {handleKeyPress}
                placeholder = "Escribe tu mensaje..."
                disabled = {disabled}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />

            <button
                type = 'submit'
                disabled = {disabled || !message.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Enviar
            </button>
        </form>
    );
}