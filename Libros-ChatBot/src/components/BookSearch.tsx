/**
 * COMPONENTE: BookSearch
 * 
 * PROPÓSITO:
 * Este componente maneja la búsqueda de libros en la página principal.
 * Incluye un formulario de búsqueda y muestra los resultados encontrados.
 * 
 * FUNCIONALIDADES:
 * - Formulario con campo de texto para buscar libros
 * - Detección automática del tipo de búsqueda (título, autor, ISBN)
 * - Muestra estados de carga y error
 * - Muestra resultados en una lista de libros
 * 
 */

"use client"; // Directiva de Next.js: este componente se ejecuta en el navegador (cliente)

import React from 'react';
import useBookSearch from '../hooks/useBookSearch'; // Hook personalizado con lógica de búsqueda
import BookList from './BookList'; // Componente que muestra la lista de libros

/**
 * Componente principal de búsqueda de libros
 * 
 * Este componente:
 * 1. Usa el hook useBookSearch para manejar la lógica de búsqueda
 * 2. Renderiza un formulario para que el usuario ingrese términos de búsqueda
 * 3. Muestra estados de carga, error y resultados
 * 4. Delega la visualización de libros al componente BookList
 */
const BookSearch: React.FC = () => {
  // Extraemos estados y funciones del hook personalizado useBookSearch
  const { 
    searchTerm,    // El texto que escribió el usuario
    setSearchTerm, // Función para actualizar el texto de búsqueda
    books,         // Array de libros encontrados
    isLoading,     // Boolean: ¿está buscando libros?
    error,         // String: mensaje de error (null si no hay error)
    searchBooks,   // Función que ejecuta la búsqueda
    clearSearch    // Función para limpiar la búsqueda
  } = useBookSearch();

  /**
   * Maneja el envío del formulario de búsqueda
   * 
   * @param {React.FormEvent} e - Evento del formulario
   * 
   * Proceso:
   * 1. Previene que la página se recargue (comportamiento por defecto)
   * 2. Llama a la función searchBooks del hook para ejecutar la búsqueda
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    searchBooks(); // Ejecuta la búsqueda usando el hook
  };

  // Renderizado del componente
  return (
    <div>
      {/* FORMULARIO DE BÚSQUEDA */}
      <form
        onSubmit={handleSearch} // Cuando se envía el formulario, ejecuta handleSearch
        className="flex flex-col items-center gap-4 p-6 bg-gray-100 rounded-lg shadow-lg max-w-md mx-auto mt-10"
      >
        {/* CAMPO DE TEXTO PARA BÚSQUEDA */}
        <input
          type="text"
          placeholder="Buscar por título, autor: [nombre], o ISBN: 9780439708180" // Instrucciones para el usuario
          value={searchTerm} // El valor actual del input (controlado por React)
          onChange={(e) => setSearchTerm(e.target.value)} // Actualiza el estado cuando el usuario escribe
          className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-2">
          {/* BOTÓN DE BÚSQUEDA */}
          <button
            type="submit" // Al hacer clic, envía el formulario
            className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Buscar
          </button>
          
          {/* BOTÓN PARA LIMPIAR - Solo mostrar si hay resultados */}
          {(books.length > 0 || searchTerm.length > 0) && (
            <button
              type="button"
              onClick={clearSearch}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Limpiar
            </button>
          )}
        </div>
      </form>

      {/* ESTADOS DE LA BÚSQUEDA */}
      
      {/* ESTADO DE CARGA: Muestra "Cargando..." mientras busca */}
      {isLoading && (
        <p className="text-center text-gray-500">Cargando...</p>
      )}
      
      {/* ESTADO DE ERROR: Muestra mensaje de error si algo sale mal */}
      {error && (
        <p className="text-center text-red-500">{error}</p>
      )}
      
      {/* RESULTADOS: Delega la visualización de libros al componente BookList */}
      <BookList books={books} />
    </div>
  );
};

export default BookSearch;