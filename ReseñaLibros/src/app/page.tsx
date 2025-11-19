import BookSearch from '../components/BookSearch';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900 text-center">
            📚 Plataforma de Reseñas de Libros
          </h1>
          <p className="text-gray-600 text-center mt-2 text-lg">
            Descubre, reseña y comparte tus libros favoritos
          </p>
        </div>

        <a
          href="/advisor"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          🤖 Probar AI Advisor
        </a>
      </header>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Sección de búsqueda */}
        <section className="mb-12">
          <BookSearch />
        </section>

        {/* Sección de características */}
        <section className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Buscar Libros</h3>
            <p className="text-gray-600">
              Encuentra libros por título, autor o ISBN usando la API de Google Books
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Escribir Reseñas</h3>
            <p className="text-gray-600">
              Comparte tu opinión con calificaciones de 1-5 estrellas y reseñas detalladas
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">👍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Votación Comunitaria</h3>
            <p className="text-gray-600">
              Vota las reseñas más útiles para ayudar a otros lectores
            </p>
          </div>
        </section>

        {/* Instrucciones de uso */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Busca</h4>
              <p className="text-sm text-gray-600">
                Escribe el título, autor o ISBN del libro que buscas
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Explora</h4>
              <p className="text-sm text-gray-600">
                Haz clic en cualquier libro para ver sus detalles completos
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Reseña</h4>
              <p className="text-sm text-gray-600">
                Escribe tu opinión y califica el libro con estrellas
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Comparte</h4>
              <p className="text-sm text-gray-600">
                Vota las mejores reseñas y ayuda a la comunidad
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-300">
            © 2025 Plataforma de Reseñas de Libros. Desarrollado con Next.js, PostgreSQL y la API de Google Books.
          </p>
        </div>
      </footer>
    </main>
  );
}