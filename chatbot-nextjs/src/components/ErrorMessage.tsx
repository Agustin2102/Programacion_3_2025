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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
            <div className="flex items-center">
                <div className="text-red-400 mr-3 text-xl">⚠️</div>
                <div className="flex-1">
                    <h3 className="text-red-800 font-medium">Error de conexión</h3>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm transition-colors"
                    >
                        🔄 Reintentar
                    </button>
                )}
            </div>
        </div>
    );
}
