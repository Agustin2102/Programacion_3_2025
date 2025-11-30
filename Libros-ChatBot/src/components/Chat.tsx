'use client';

import { useChat } from 'ai/react';
import { useEffect, useState } from 'react';

function ChatInterface({ token }: { token: string }) {
  // Log del token para debug
  useEffect(() => {
    console.log('[Chat] Token recibido:', token ? `${token.substring(0, 20)}...` : 'null');
  }, [token]);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    fetch: async (input, init) => {
      console.log('[Chat] Custom fetch called with token');
      const headers = {
        ...init?.headers,
        'Authorization': `Bearer ${token}`,
      };
      return fetch(input, {
        ...init,
        headers,
      });
    },
    onError: (error) => {
      console.error('[Chat] Error en el chat:', error);
    },
    onResponse: (response) => {
      console.log('[Chat] Response status:', response.status);
    },
  });

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto border rounded-lg overflow-hidden bg-white shadow-lg">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-xl mb-2">👋 ¡Hola! Soy tu asistente de libros</p>
            <p>Pregúntame sobre libros, pídeme recomendaciones, o gestiona tu lista de lectura</p>
          </div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
                }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <p className="text-gray-500">Pensando...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Pregúntame sobre libros..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Chat() {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Obtener token del localStorage al montar el componente
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.log('[Chat] Token desde localStorage:', storedToken ? `${storedToken.substring(0, 20)}...` : 'null');
    
    // Verificar formato del token (decodificar el payload)
    if (storedToken) {
      try {
        const parts = storedToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('[Chat] Token payload:', payload);
          
          if (!payload.userId) {
            console.error('[Chat] Token inválido: no contiene userId');
            setTokenError('Token antiguo detectado. Por favor, cierra sesión y vuelve a iniciar sesión.');
          }
        }
      } catch (e) {
        console.error('[Chat] Error al decodificar token:', e);
      }
    }
    
    setToken(storedToken);
    setIsReady(true);
  }, []);

  // Mostrar mensaje de carga mientras se obtiene el token
  if (!isReady) {
    return (
      <div className="flex flex-col h-[600px] max-w-4xl mx-auto border rounded-lg overflow-hidden bg-white shadow-lg items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  // Mostrar mensaje si no hay token
  if (!token) {
    return (
      <div className="flex flex-col h-[600px] max-w-4xl mx-auto border rounded-lg overflow-hidden bg-white shadow-lg items-center justify-center">
        <p className="text-gray-500 text-center">
          Por favor, inicia sesión para usar el chat
        </p>
        <a href="/login" className="mt-4 text-blue-500 hover:underline">
          Ir a login
        </a>
      </div>
    );
  }

  // Mostrar error de token si existe
  if (tokenError) {
    return (
      <div className="flex flex-col h-[600px] max-w-4xl mx-auto border rounded-lg overflow-hidden bg-white shadow-lg items-center justify-center p-8">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 max-w-md">
          <p className="text-yellow-800 text-center mb-4">
            ⚠️ {tokenError}
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Cerrar sesión e ir a login
          </button>
        </div>
      </div>
    );
  }

  return <ChatInterface key={token} token={token} />;
}