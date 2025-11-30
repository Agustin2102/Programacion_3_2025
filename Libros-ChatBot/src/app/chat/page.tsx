import Chat from '@/components/Chat';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ChatPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <Navbar />
            <main className="py-8">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold text-gray-900 mb-3">
                            AI Book Advisor
                        </h1>
                        <p className="text-lg text-gray-600 mb-4">
                            Conversa con el asistente inteligente para obtener recomendaciones personalizadas
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                            ← Volver a búsqueda manual
                        </Link>
                    </div>

                    {/* Chat Component */}
                    <Chat />

                    {/* Info Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mt-12">
                        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                            <div className="text-3xl mb-3">🔍</div>
                            <h3 className="font-semibold text-lg mb-2">Buscar Libros</h3>
                            <p className="text-gray-600 text-sm">
                                Pregunta "Busca libros sobre ciencia ficción" y el AI te mostrará resultados
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                            <div className="text-3xl mb-3">📚</div>
                            <h3 className="font-semibold text-lg mb-2">Gestionar Listas</h3>
                            <p className="text-gray-600 text-sm">
                                Di "Agrega este libro a mi lista" para guardar libros que quieres leer
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                            <div className="text-3xl mb-3">📊</div>
                            <h3 className="font-semibold text-lg mb-2">Estadísticas</h3>
                            <p className="text-gray-600 text-sm">
                                Pregunta "Muéstrame mis estadísticas" para ver tu progreso de lectura
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
