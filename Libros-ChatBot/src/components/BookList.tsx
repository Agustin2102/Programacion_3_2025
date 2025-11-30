/**
 * COMPONENTE: BookList
 * 
 * PROPÓSITO:
 * Este componente recibe una lista de libros y los muestra en formato de tarjetas.
 * Cada tarjeta es clickeable y navega a la página de detalles del libro.
 * 
 * FUNCIONALIDADES:
 * - Muestra libros en un grid responsivo
 * - Cada libro incluye: imagen, título, autor, fecha, rating, descripción
 * - Navegación clickeable a página de detalles
 * - Manejo de casos cuando no hay imagen disponible
 * - Mensaje cuando no se encuentran libros
 * 
 * PROPS RECIBIDAS:
 * - books: Array de objetos libro con información de Google Books API
 */

"use client"; // Este componente se ejecuta en el navegador

import React from 'react';
import { useRouter } from 'next/navigation'; 

// DEFINICIÓN DE TIPOS
// Estas interfaces definen la estructura de datos que esperamos recibir de Google Books API

/**
 * Interfaz que define la estructura de un libro individual
 * Basada en la respuesta de Google Books API
 */
interface Book {
  id: string; // ID único del libro en Google Books
  volumeInfo: {
    title: string; // Título del libro
    authors?: string[]; // Array de autores (opcional)
    publishedDate?: string; // Fecha de publicación (formato: YYYY-MM-DD)
    description?: string; // Descripción/sinopsis del libro
    imageLinks?: {
      thumbnail?: string; // URL de imagen pequeña
      smallThumbnail?: string; // URL de imagen muy pequeña
    };
    pageCount?: number; // Número de páginas
    categories?: string[]; // Array de categorías/géneros
    averageRating?: number; // Calificación promedio (1-5)
    ratingsCount?: number; // Número de calificaciones
  };
}

/**
 * Props que recibe este componente
 */
interface BookListProps {
  books: Book[]; // Array de libros para mostrar
}

/**
 * Componente principal que renderiza la lista de libros
 * 
 * @param {BookListProps} props - Props con array de libros
 * @returns {JSX.Element} Grid de tarjetas de libros
 */
const BookList: React.FC<BookListProps> = ({ books }) => {
  const router = useRouter(); // Hook para navegación programática

  /**
   * Maneja el clic en una tarjeta de libro
   * Navega a la página de detalles del libro seleccionado
   * 
   * @param {string} bookId - ID único del libro
   */
  const handleBookClick = (bookId: string) => {
    router.push(`/book/${bookId}`);
  };

  // CASO: No hay libros para mostrar
  if (books.length === 0) {
    return (
      <div className="text-center mt-8">
        <p className="text-gray-500 text-lg">No se encontraron libros.</p>
        <p className="text-gray-400 text-sm mt-2">Intenta con otro término de búsqueda.</p>
      </div>
    );
  }

  // RENDERIZADO PRINCIPAL: Grid de libros
  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      {/* HEADER CON CONTADOR DE RESULTADOS */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Resultados de búsqueda ({books.length} {books.length === 1 ? 'libro' : 'libros'})
      </h2>
      
      {/* GRID DE LIBROS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <div
            key={book.id} // Key único para React
            onClick={() => handleBookClick(book.id)} // Clic navega a detalles
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
          >
            
            {/* SECCIÓN DE IMAGEN */}
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              {book.volumeInfo.imageLinks?.thumbnail ? (
                // CASO: Libro tiene imagen
                <img
                  src={book.volumeInfo.imageLinks.thumbnail}
                  alt={book.volumeInfo.title}
                  className="h-full w-auto object-cover"
                />
              ) : (
                // CASO: Libro sin imagen - mostrar placeholder
                <div className="text-gray-400 text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p>Sin imagen</p>
                </div>
              )}
            </div>

            {/* SECCIÓN DE INFORMACIÓN DEL LIBRO */}
            <div className="p-4">
              
              {/* TÍTULO DEL LIBRO */}
              <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                {book.volumeInfo.title}
              </h3>
              
              {/* AUTOR(ES) */}
              <p className="text-sm text-gray-600 mb-2">
                {book.volumeInfo.authors?.join(', ') || 'Autor desconocido'}
              </p>

              {/* FECHA DE PUBLICACIÓN */}
              {book.volumeInfo.publishedDate && (
                <p className="text-xs text-gray-500 mb-2">
                  Publicado: {new Date(book.volumeInfo.publishedDate).getFullYear()}
                </p>
              )}

              {/* CALIFICACIÓN CON ESTRELLAS */}
              {book.volumeInfo.averageRating && (
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {/* Generar 5 estrellas, llenar según calificación */}
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(book.volumeInfo.averageRating!) 
                            ? 'fill-current' // Estrella llena
                            : 'text-gray-300' // Estrella vacía
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  {/* CONTADOR DE CALIFICACIONES */}
                  <span className="text-xs text-gray-500 ml-2">
                    ({book.volumeInfo.ratingsCount || 0})
                  </span>
                </div>
              )}

              {/* DESCRIPCIÓN TRUNCADA */}
              {book.volumeInfo.description && (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {/* Remover etiquetas HTML de la descripción */}
                  {book.volumeInfo.description.replace(/<[^>]*>/g, '')}
                </p>
              )}

              {/* FOOTER CON INFORMACIÓN ADICIONAL */}
              <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                {/* NÚMERO DE PÁGINAS */}
                {book.volumeInfo.pageCount && (
                  <span>{book.volumeInfo.pageCount} páginas</span>
                )}
                
                {/* PRIMERA CATEGORÍA COMO BADGE */}
                {book.volumeInfo.categories && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {book.volumeInfo.categories[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookList;
