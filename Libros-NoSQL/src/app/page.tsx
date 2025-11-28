import BookSearch from '../components/BookSearch';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
            Plataforma de Reseñas de Libros
          </h1>
          <BookSearch />
        </div>
      </main>
    </div>
  );
}