/**
 * Este archivo implementa las tools de búsqueda y detalles de libros.
 */

import { BookDetails } from './types';

/**
 * searchBooks: Busca libros en Google Books API (sin API key)
 */
export async function searchBooks(params: {
    query: string;
    maxResults?: number;
    orderBy?: string;
}): Promise<{ results: any[]; totalItems: number }> {
    try {
        const { query, maxResults = 10, orderBy = 'relevance' } = params;

        if (!query || query.trim() === '') {
            throw new Error('Query de búsqueda es requerido');
        }

        // Llamar a Google Books API SIN API key (funciona con limitaciones)
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=${orderBy}`;

        console.log('Calling Google Books API:', query);
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Books API error:', response.status, errorText);
            throw new Error(`Error de Google Books API: ${response.status}`);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            console.log('No results found for:', query);
            return { results: [], totalItems: 0 };
        }

        console.log(`Found ${data.items.length} books`);

        // Cachear y formatear resultados
        const { prisma } = await import('../../../lib/prisma');
        const formattedResults = await Promise.all(data.items.map(async (item: any) => {
            const bookData = {
                id: item.id,
                title: item.volumeInfo?.title || 'Sin título',
                authors: (item.volumeInfo?.authors || []).join(', '),
                publisher: item.volumeInfo?.publisher,
                publishedDate: item.volumeInfo?.publishedDate,
                description: item.volumeInfo?.description,
                imageUrl: item.volumeInfo?.imageLinks?.thumbnail || item.volumeInfo?.imageLinks?.smallThumbnail,
                pageCount: item.volumeInfo?.pageCount,
                categories: (item.volumeInfo?.categories || []).join(', '),
                language: item.volumeInfo?.language,
                previewLink: item.volumeInfo?.previewLink,
                infoLink: item.volumeInfo?.infoLink,
            };

            try {
                await prisma.book.upsert({
                    where: { id: bookData.id },
                    update: bookData,
                    create: bookData,
                });
            } catch (dbError) {
                console.error('Error cacheando libro:', dbError);
            }

            return {
                id: item.id,
                title: item.volumeInfo?.title || 'Sin título',
                authors: item.volumeInfo?.authors || [],
                description: item.volumeInfo?.description?.substring(0, 200) || '',
                thumbnail: item.volumeInfo?.imageLinks?.thumbnail,
                pageCount: item.volumeInfo?.pageCount,
                publishedDate: item.volumeInfo?.publishedDate,
                categories: item.volumeInfo?.categories || [],
                averageRating: item.volumeInfo?.averageRating,
            };
        }));

        return { results: formattedResults, totalItems: data.totalItems || 0 };

    } catch (error: any) {
        console.error('Error en searchBooks:', error);
        throw new Error(`Error buscando libros: ${error.message || 'Error desconocido'}`);
    }
}

/**
 * getBookDetails: Obtiene detalles de un libro específico (sin API key)
 */
export async function getBookDetails(params: { bookId: string; }): Promise<BookDetails> {
    try {
        const { bookId } = params;

        if (!bookId) {
            throw new Error('bookId es requerido');
        }

        const url = `https://www.googleapis.com/books/v1/volumes/${bookId}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Libro no encontrado: ${response.statusText}`);
        }

        const item = await response.json();
        const volumeInfo = item.volumeInfo || {};

        const bookDetails: BookDetails = {
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

        // Cachear en BD
        try {
            const { prisma } = await import('../../../lib/prisma');
            await prisma.book.upsert({
                where: { id: bookDetails.id },
                update: {
                    title: bookDetails.title,
                    authors: bookDetails.authors.join(', '),
                    publisher: bookDetails.publisher,
                    publishedDate: bookDetails.publishedDate,
                    description: bookDetails.description,
                    imageUrl: bookDetails.thumbnail,
                    pageCount: bookDetails.pageCount,
                    categories: bookDetails.categories.join(', '),
                    language: bookDetails.language,
                    previewLink: bookDetails.previewLink,
                    infoLink: bookDetails.infoLink,
                },
                create: {
                    id: bookDetails.id,
                    title: bookDetails.title,
                    authors: bookDetails.authors.join(', '),
                    publisher: bookDetails.publisher,
                    publishedDate: bookDetails.publishedDate,
                    description: bookDetails.description,
                    imageUrl: bookDetails.thumbnail,
                    pageCount: bookDetails.pageCount,
                    categories: bookDetails.categories.join(', '),
                    language: bookDetails.language,
                    previewLink: bookDetails.previewLink,
                    infoLink: bookDetails.infoLink,
                },
            });
        } catch (dbError) {
            console.error('Error cacheando libro:', dbError);
        }

        return bookDetails;

    } catch (error: any) {
        console.error('Error en getBookDetails:', error);
        throw new Error(`Error obteniendo detalles del libro: ${error.message || 'Error desconocido'}`);
    }
}