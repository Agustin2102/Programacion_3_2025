import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar la búsqueda de libros
 * 
 * Este hook encapsula toda la lógica relacionada con:
 * - Estado de búsqueda (término, resultados, loading, errores)
 * - Persistencia del estado en sessionStorage
 * - Detección automática del tipo de búsqueda (ISBN, autor, título)
 * - Formateo de queries para la API de Google Books
 * - Manejo de errores y estados de carga
 * 
 * @returns {Object} Objeto con estados y funciones para la búsqueda
 */
const useBookSearch = () => {
  // Claves para sessionStorage
  const STORAGE_KEYS = {
    searchTerm: 'book-search-term',
    books: 'book-search-results',
    error: 'book-search-error'
  };

  // Estados del hook con valores iniciales desde sessionStorage
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efecto para cargar el estado desde sessionStorage al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSearchTerm = sessionStorage.getItem(STORAGE_KEYS.searchTerm);
      const savedBooks = sessionStorage.getItem(STORAGE_KEYS.books);
      const savedError = sessionStorage.getItem(STORAGE_KEYS.error);

      if (savedSearchTerm) {
        setSearchTerm(savedSearchTerm);
      }
      if (savedBooks) {
        try {
          setBooks(JSON.parse(savedBooks));
        } catch (e) {
          console.error('Error parsing saved books:', e);
        }
      }
      if (savedError) {
        setError(savedError);
      }
    }
  }, []);

  // Función para guardar en sessionStorage
  const saveToStorage = (key: string, value: string | unknown[]) => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      } catch (e) {
        console.error('Error saving to sessionStorage:', e);
      }
    }
  };

  // Función personalizada para actualizar searchTerm y guardarlo
  const updateSearchTerm = (term: string) => {
    setSearchTerm(term);
    saveToStorage(STORAGE_KEYS.searchTerm, term);
  };

  // Función para limpiar todos los datos de búsqueda
  const clearSearch = () => {
    setSearchTerm('');
    setBooks([]);
    setError(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEYS.searchTerm);
      sessionStorage.removeItem(STORAGE_KEYS.books);
      sessionStorage.removeItem(STORAGE_KEYS.error);
    }
  };

  /**
   * Función principal que ejecuta la búsqueda de libros
   * 
   * Proceso:
   * 1. Valida que haya un término de búsqueda
   * 2. Detecta el tipo de búsqueda (ISBN, autor, o título)
   * 3. Formatea el query apropiadamente para Google Books API
   * 4. Realiza la petición HTTP
   * 5. Procesa los resultados y maneja errores
   * 6. Guarda los resultados en sessionStorage
   */
  const searchBooks = async () => {
    // No buscar si el campo está vacío
    if (searchTerm.trim() === '') return;

    setIsLoading(true); // Activar estado de carga
    setError(null); // Limpiar errores previos
    saveToStorage(STORAGE_KEYS.error, ''); // Limpiar error guardado

    try {
      // Detectar si es un ISBN (solo números, con o sin guiones)
      const cleanTerm = searchTerm.replace(/[-\s]/g, ''); // Remover guiones y espacios
      const isISBN = /^\d{10}(\d{3})?$/.test(cleanTerm); // Regex para ISBN-10 o ISBN-13
      
      // Formatear la query según el tipo de búsqueda detectado
      let query = '';
      if (isISBN) {
        // Búsqueda específica por ISBN
        query = `isbn:${cleanTerm}`;
      } else {
        // Verificar si es búsqueda por autor (contiene "autor:" o "author:")
        const isAuthorSearch = searchTerm.toLowerCase().includes('autor:') || 
                              searchTerm.toLowerCase().includes('author:');
        if (isAuthorSearch) {
          // Extraer el nombre del autor y usar el filtro específico
          const authorName = searchTerm.replace(/autor:|author:/gi, '').trim();
          query = `inauthor:${authorName}`;
        } else {
          // Búsqueda general por título
          query = searchTerm;
        }
      }

      // Realizar petición a Google Books API
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      // Verificar si se encontraron resultados
      if (data.totalItems === 0) {
        const errorMsg = 'No se encontraron libros con ese término de búsqueda.';
        setError(errorMsg);
        saveToStorage(STORAGE_KEYS.error, errorMsg);
        setBooks([]);
        saveToStorage(STORAGE_KEYS.books, []);
      } else {
        // Guardar resultados (data.items puede ser undefined si no hay resultados)
        const results = data.items || [];
        setBooks(results);
        saveToStorage(STORAGE_KEYS.books, results);
        setError(null);
        saveToStorage(STORAGE_KEYS.error, '');
      }
    } catch (error) {
      // Manejar errores de red o de la API
      const errorMsg = 'Error al buscar libros. Inténtalo de nuevo.';
      setError(errorMsg);
      saveToStorage(STORAGE_KEYS.error, errorMsg);
      console.error('Error en búsqueda:', error);
    } finally {
      // Siempre desactivar el estado de carga, sin importar si hubo error o éxito
      setIsLoading(false);
    }
  };

  // Retornar todo lo que los componentes necesitan para usar este hook
  return {
    searchTerm,           // Término actual de búsqueda
    setSearchTerm: updateSearchTerm, // Función para actualizar el término (con persistencia)
    books,                // Array de libros encontrados
    isLoading,            // Estado de carga
    error,                // Mensaje de error (si existe)
    searchBooks,          // Función para ejecutar la búsqueda
    clearSearch,          // Función para limpiar la búsqueda
  };
};

export default useBookSearch;