export interface Message {
    // Defino la estructura que tendra el msj
    id: string;                 // <-- Identificador único para cada mensaje (por ejemplo, para guardar o buscar en localStorage).
    role: 'user' | 'assistant'; // <-- Indica si el mensaje fue enviado por el usuario o por el bot/assistant.
    content: string;            // <-- Texto del mensaje.
    timestamp: Date;            // <-- fecha y hora en que se envió o recibió el mensaje.
}

export interface ChatState {
    messages: Message[];        // <-- Array de Mensajes, almacena la conversación completa de un chat
    isLoading: boolean;         // <-- Indica si el chat está esperando respuesta del bot. "True" : se muestra un spinner o un "el bot está escribiendo…" en la UI.
    error: string | null;       // <-- Guarda mensajes de error si algo salió mal (por ejemplo, falló la llamada al backend o la API de OpenRouter). 
}

// Tipo para el hook useChat
export interface UseChatReturn {
    messages: Message[];
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
    error: Error | undefined;
    clearMessages: () => void;
}
