/**
 * 
 * Este archivo implementa las tools de búsqueda y detalles de libros.
 * 
 */

import { //GoogleBooksResponse, 
    BookDetails } from './types';

/**
 * searchBooks: 
 *      Busca libros en google books API por titulo, autor, tema, o palabras clave
 */
export async function searchBooks(params: {
    query: string;
    maxResults?: number;
    orderBy?: string;
}): Promise<{ results: any[]; totalItems: number }> {
    try {
        const { query, maxResults = 10, orderBy = 'relevance' } = params;

        // Validar la query
        if(!query || query.trim() === ''){
            throw new Error('Query de búsqueda es requerido');
        }

        // Llamar a Google Books API
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const url = apiKey
      ? `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=${orderBy}&key=${apiKey}`
      : `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=${orderBy}`;

    const response = await fetch(url);

    if(!response.ok){
        throw new Error(`Error de API: ${response.statusText}`);
    }

    const data = await response.json();

    // Formatear resultados para el LLM
    const formattedResults = (data.items || []).map((item: any) => ({
        id: item.id,
        title: item.volumeInfo?.title || 'Sin título',
        authors: item.volumeInfo?.authors || [],
        description: item.volumeInfo?.description?.substring(0, 200) || '',
        thumbnail: item.volumeInfo?.imageLinks?.thumbnail,
        pageCount: item.volumeInfo?.pageCount,
        publishedDate: item.volumeInfo?.publishedDate,
        categories: item.volumeInfo?.categories || [],
        averageRating: item.volumeInfo?.averageRating,
    }));


    return { results: formattedResults, totalItems: data.totalItems || 0,};

    } catch (error) {
        console.error('Error en searchBooks:', error);
        throw error; 
    }
}


/**
 * getBookDetails
 *      Obtiene información complleta de un libro usando su google Books id
 */
export async function getBookDetails(params: {bookId: string;}): Promise<BookDetails> {

    try{
        const {bookId} = params;

        if(!bookId){
            throw new Error('bookId es requerido');
        }

        // Llamar a Google Books API
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
        const url = apiKey
        ? `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${apiKey}`
        : `https://www.googleapis.com/books/v1/volumes/${bookId}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Libro no encontrado: ${response.statusText}`);
        }
    
        const item = await response.json();

        // Extraer información detallada
        const volumeInfo = item.volumeInfo || {};
        
        return {
        id: item.id,
        title: volumeInfo.title || 'Sin título',
        authors: volumeInfo.authors || [],
        description: volumeInfo.description || '',
        thumbnail: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail,
        pageCount: volumeInfo.pageCount,
        publishedDate: volumeInfo.publishedDate,
        publisher: volumeInfo.publisher,
        categories: volumeInfo.categories || [],
        language: volumeInfo.language,
        isbn: volumeInfo.industryIdentifiers?.[0]?.identifier,
        averageRating: volumeInfo.averageRating,
        ratingsCount: volumeInfo.ratingsCount,
        previewLink: volumeInfo.previewLink,
        infoLink: volumeInfo.infoLink,
        };

    } catch (error) {
        console.error('Error en getBookDetails:', error);
        throw error;
      }
}