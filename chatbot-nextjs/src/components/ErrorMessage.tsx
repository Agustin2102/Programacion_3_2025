/**
 * Componente para mostrar errores de manera elegante
 * - Muestra errores de conexión
 * - Botón de reintentar
 * - Diseño consistente
 */

interface ErrorMessageProps {
    error: string;
    onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
    return (
        <div className="max-w-3xl mx-auto px-4 py-2">
            <div className="bg-red-900/20 border border-red-800/50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                    <div className="text-red-400 text-xl shrink-0">⚠️</div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-red-400 font-medium mb-1">Error de conexión</h3>
                        <p className="text-red-300/90 text-sm leading-relaxed">{error}</p>
                    </div>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-3 py-1.5 bg-red-800/30 text-red-300 rounded-lg hover:bg-red-800/50 text-sm transition-colors shrink-0 flex items-center gap-1"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reintentar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
