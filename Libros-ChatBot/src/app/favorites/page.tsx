/**
 * PÁGINA: Favoritos
 * 
 * PROPÓSITO:
 * Página para mostrar todos los libros favoritos del usuario.
 * Permite ver detalles y quitar libros de favoritos.
 * 
 * FUNCIONALIDADES:
 * - Mostrar todos los favoritos del usuario
 * - Quitar libros de favoritos
 * - Navegar a listas de lectura
 * - Estados de carga y error
 */

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// DEFINICIÓN DE TIPOS
interface Favorite {
  _id: string;
  userId: string;
  bookId: string;
  createdAt: string;
}

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
    description?: string;
    publishedDate?: string;
    publisher?: string;
  };
}

const FavoritesPage: React.FC = () => {
  const router = useRouter();
  
  // ESTADOS DEL COMPONENTE
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  // TEMPORAL: ID de usuario hardcodeado
  const userId = 'user-123';

  /**
   * Carga todos los favoritos del usuario
   */
  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}`);
      
      if (response.ok) {
        const data: Favorite[] = await response.json();
        setFavorites(data);
        
        // Cargar detalles de los libros
        await loadBookDetails(data);
      } else {
        setError('Error al cargar los favoritos');
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      setError('Error al cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga los detalles de los libros desde Google Books API
   */
  const loadBookDetails = async (favoritesList: Favorite[]) => {
    try {
      const bookPromises = favoritesList.map(async (favorite) => {
        try {
          const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${favorite.bookId}`
          );
          if (response.ok) {
            return await response.json();
          }
          return null;
        } catch (error) {
          console.error(`Error al cargar libro ${favorite.bookId}:`, error);
          return null;
        }
      });

      const bookResults = await Promise.all(bookPromises);
      const validBooks = bookResults.filter(book => book !== null);
      setBooks(validBooks);
    } catch (error) {
      console.error('Error al cargar detalles de libros:', error);
    }
  };

  /**
   * Quita un libro de favoritos
   */
  const handleRemoveFavorite = async (bookId: string) => {
    try {
      setRemoving(bookId);
      
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          bookId,
          action: 'remove',
        }),
      });

      if (response.ok) {
        // Actualizar estado local
        setFavorites(favorites.filter(fav => fav.bookId !== bookId));
        setBooks(books.filter(book => book.id !== bookId));
        alert('Libro quitado de favoritos');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al quitar de favoritos');
      }
    } catch (error) {
      console.error('Error al quitar favorito:', error);
      alert('Error al quitar de favoritos. Inténtalo de nuevo.');
    } finally {
      setRemoving(null);
    }
  };

  // EFECTO: Cargar favoritos al montar el componente
  useEffect(() => {
    loadFavorites();
  }, []);

  // RENDERIZADO PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ❤️ Mis Favoritos
              </h1>
              <p className="text-gray-600 mt-2">
                Tus libros favoritos ({favorites.length})
              </p>
            </div>
            
            {/* Botones de navegación */}
            <div className="flex space-x-3">
              <Link
                href="/reading-lists"
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Listas</span>
              </Link>
              
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Inicio</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Lista de favoritos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando favoritos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
            <button 
              onClick={loadFavorites}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reintentar
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes favoritos
            </h3>
            <p className="text-gray-600 mb-6">
              Agrega libros a tus favoritos para verlos aquí
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Buscar Libros
            </Link>
          </div>
        ) : (
          /* Grid de libros favoritos */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Imagen del libro */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {book.volumeInfo.imageLinks?.thumbnail ? (
                    <img
                      src={book.volumeInfo.imageLinks.thumbnail}
                      alt={book.volumeInfo.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <p className="text-sm">Sin imagen</p>
                    </div>
                  )}
                </div>

                {/* Información del libro */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {book.volumeInfo.title}
                  </h3>
                  
                  {book.volumeInfo.authors && (
                    <p className="text-sm text-gray-600 mb-2">
                      {book.volumeInfo.authors.join(', ')}
                    </p>
                  )}

                  {book.volumeInfo.publishedDate && (
                    <p className="text-xs text-gray-500 mb-3">
                      {book.volumeInfo.publishedDate}
                    </p>
                  )}

                  {/* Botones de acción */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/book/${book.id}`}
                      className="flex-1 text-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      Ver Detalles
                    </Link>
                    
                    <button
                      onClick={() => handleRemoveFavorite(book.id)}
                      disabled={removing === book.id}
                      className={`
                        px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${removing === book.id
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600'
                        }
                      `}
                    >
                      {removing === book.id ? '...' : 'Quitar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;