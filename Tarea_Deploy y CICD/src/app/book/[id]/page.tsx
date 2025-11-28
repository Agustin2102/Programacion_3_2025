"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReviewForm from '../../../components/ReviewForm';
import ReviewList from '../../../components/ReviewList';

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
    };
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    publisher?: string;
    language?: string;
    previewLink?: string;
    infoLink?: string;
  };
}

const BookDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Función simple para volver a la página anterior
   */
  const handleGoBack = () => {
    router.back();
  };

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId) return;
      
      try {
        setLoading(true);
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${bookId}`
        );
        
        if (!response.ok) {
          throw new Error('No se pudo cargar la información del libro');
        }
        
        const data = await response.json();
        setBook(data);
      } catch (error) {
        setError('Error al cargar los detalles del libro');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalles del libro...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error || 'Libro no encontrado'}</p>
          <button 
            onClick={handleGoBack}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const { volumeInfo } = book;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con botón de volver */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button 
            onClick={handleGoBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a la búsqueda
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Columna izquierda - Imagen del libro */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-center mb-6">
                {volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.medium || volumeInfo.imageLinks?.thumbnail ? (
                  <img
                    src={volumeInfo.imageLinks.large || volumeInfo.imageLinks.medium || volumeInfo.imageLinks.thumbnail}
                    alt={volumeInfo.title}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-64 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <p>Sin imagen disponible</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Enlaces externos */}
              <div className="space-y-2">
                {volumeInfo.previewLink && (
                  <a
                    href={volumeInfo.previewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Vista previa
                  </a>
                )}
                {volumeInfo.infoLink && (
                  <a
                    href={volumeInfo.infoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Más información
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha - Información del libro */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {volumeInfo.title}
              </h1>

              <div className="space-y-3 mb-6">
                {volumeInfo.authors && (
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Autor(es):</span> {volumeInfo.authors.join(', ')}
                  </p>
                )}

                {volumeInfo.publisher && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Editorial:</span> {volumeInfo.publisher}
                  </p>
                )}

                {volumeInfo.publishedDate && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Fecha de publicación:</span> {volumeInfo.publishedDate}
                  </p>
                )}

                {volumeInfo.pageCount && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Páginas:</span> {volumeInfo.pageCount}
                  </p>
                )}

                {volumeInfo.language && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Idioma:</span> {volumeInfo.language}
                  </p>
                )}

                {volumeInfo.categories && (
                  <div className="flex flex-wrap gap-2">
                    <span className="font-semibold text-gray-600">Categorías:</span>
                    {volumeInfo.categories.map((category, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {volumeInfo.averageRating && (
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-600 mr-2">Calificación:</span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(volumeInfo.averageRating!) 
                              ? 'fill-current' 
                              : 'text-gray-300'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-600 ml-2">
                      ({volumeInfo.ratingsCount || 0} reseñas)
                    </span>
                  </div>
                )}
              </div>

              {volumeInfo.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Descripción</h2>
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: volumeInfo.description.replace(/<br\s*\/?>/gi, '<br />') 
                    }}
                  />
                </div>
              )}
            </div>

            {/* Sección de reseñas */}
            <div className="mt-8 space-y-6">
              <ReviewForm 
                bookId={bookId} 
                bookData={{
                  title: volumeInfo.title,
                  authors: volumeInfo.authors,
                  publisher: volumeInfo.publisher,
                  publishedDate: volumeInfo.publishedDate,
                  description: volumeInfo.description,
                  imageUrl: volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.medium || volumeInfo.imageLinks?.thumbnail,
                  pageCount: volumeInfo.pageCount,
                  categories: volumeInfo.categories,
                  language: volumeInfo.language,
                  previewLink: volumeInfo.previewLink,
                  infoLink: volumeInfo.infoLink,
                }}
                onReviewAdded={() => {
                  // Forzar recarga del componente ReviewList
                  window.location.reload();
                }}
              />
              <ReviewList bookId={bookId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
