/**
 * Página principal del AI Advisor:
*/

'use client';

import { useChat } from '../../lib/useChat';
import { useEffect, useRef } from 'react';

export default function AdvisorPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/advisor',
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📚 AI Book Advisor
              </h1>
              <p className="text-sm text-gray-600">
                Tu asistente inteligente para descubrir libros
              </p>
            </div>
            <a
              href="/"
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              ← Volver a Búsqueda
            </a>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Hola! Soy tu Book Advisor
              </h2>
              <p className="text-gray-600 mb-8">
                Puedo ayudarte a encontrar libros, gestionar tu lista de lectura,
                y ver estadísticas de lectura.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🔍</div>
                  <h3 className="font-semibold mb-1">Buscar Libros</h3>
                  <p className="text-sm text-gray-600">
                    "Recomiéndame libros de ciencia ficción"
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">📋</div>
                  <h3 className="font-semibold mb-1">Mi Lista</h3>
                  <p className="text-sm text-gray-600">
                    "Muéstrame mi lista de lectura"
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold mb-1">Estadísticas</h3>
                  <p className="text-sm text-gray-600">
                    "¿Cuántos libros he leído este año?"
                  </p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message: any) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                }`}
              >
                {/* Content */}
                <div className="prose max-w-none">
                  {message.content}
                </div>

                {/* Tool Calls */}
                {message.toolInvocations && message.toolInvocations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-2">
                      📎 Tools ejecutadas:
                    </div>
                    {message.toolInvocations.map((tool: any, idx: number) => (
                      <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                        {tool.toolName} → {tool.state}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 shadow-sm rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-bounce">🤔</div>
                  <span className="text-sm">Pensando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}