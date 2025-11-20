/**
 * 
 * Tools de estadísticas
 * 
 */

import { prisma } from '../../../lib/prisma';

/**
 * markAsRead
 * Marca un libro como leído y opcionalmente agrega rating/review
 */
export async function markAsRead(params: {
    bookId: string;
    rating?: number;
    review?: string;
    dateFinished?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
        const { bookId, rating, review, dateFinished } = params;
    
        if (!bookId) {
            throw new Error('bookId es requerido');
        }
    
        // Validar rating si se proporciona
        if (rating !== undefined && (rating < 1 || rating > 5)) {
            throw new Error('Rating debe estar entre 1 y 5');
        }
    
        // Verificar que el libro existe en la base de datos, si no, obtenerlo de Google Books
        let book = await prisma.book.findUnique({
            where: { id: bookId },
        });

        if (!book) {
            // Obtener el libro de Google Books API y guardarlo
            const { getBookDetails } = await import('./books');
            try {
                await getBookDetails({ bookId });
                book = await prisma.book.findUnique({
                    where: { id: bookId },
                });
            } catch (error) {
                throw new Error(`No se pudo encontrar el libro con ID ${bookId}. Asegúrate de usar un ID válido de Google Books.`);
            }
        }
    
        // Verificar si ya está marcado como leído
        const existing = await prisma.readBook.findUnique({
            where: { bookId },
        });
    
        if (existing) {
            // Actualizar
            await prisma.readBook.update({
            where: { bookId },
            data: {
                rating,
                review,
                dateFinished: dateFinished ? new Date(dateFinished) : undefined,
            },
            });
            return {
                success: true,
                message: `"${book.title}" actualizado en tu historial de lectura${rating ? ` con ${rating} estrellas` : ''}`,
            };
        }
    
        // Crear nuevo registro
        await prisma.readBook.create({
            data: {
                bookId,
                rating,
                review,
                dateFinished: dateFinished ? new Date(dateFinished) : new Date(),
            },
        });
    
        // Remover de lista "Quiero Leer" si está ahí
        await prisma.readingListItem
            .delete({
                where: { bookId },
            })
            .catch(() => {}); // Ignorar si no existe
    
        return {
            success: true,
            message: `"${book.title}" marcado como leído exitosamente${rating ? ` con ${rating} estrellas` : ''}`,
        };
    } catch (error: any) {
      console.error('Error en markAsRead:', error);
      throw error;
    }
}


/**
 * getReadingStats
 * Genera estadísticas y analytics de hábitos de lectura
 */
export async function getReadingStats(params: {
    period: 'all-time' | 'year' | 'month' | 'week';
    groupBy?: 'genre' | 'author' | 'year';
  }): Promise<any> {
    try {
        const { period } = params;
    
        // Calcular fecha de inicio según periodo
        const now = new Date();
        let startDate = new Date(0); // Inicio de los tiempos
    
        if (period === 'year') {
            startDate = new Date(now.getFullYear(), 0, 1);
        } else if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (period === 'week') {
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
        }
    
        // Obtener libros leídos
        const readBooks = await prisma.readBook.findMany({
            where: {
            dateFinished: {
                gte: startDate,
            },
            },
            include: {
                book: true,
            },
        });
    
        // Calcular estadísticas
        const totalBooksRead = readBooks.length;
        const totalPagesRead = readBooks.reduce(
            (sum, rb) => sum + (rb.book?.pageCount || 0),
            0
        );
    
        // Calcular rating promedio
        const booksWithRating = readBooks.filter((rb) => rb.rating);
        const averageRating =
            booksWithRating.length > 0
            ? booksWithRating.reduce((sum, rb) => sum + rb.rating!, 0) /
                booksWithRating.length
            : 0;
    
        // Contar géneros
        const genreCount: Record<string, number> = {};
        readBooks.forEach((rb) => {
            if (rb.book?.categories) {
                const categories = rb.book.categories.split(',').map((c) => c.trim());
                categories.forEach((cat) => {
                    if (cat) {
                        genreCount[cat] = (genreCount[cat] || 0) + 1;
                    }
                });
            }
        });
    
        // Contar autores
        const authorCount: Record<string, number> = {};
        readBooks.forEach((rb) => {
            if (rb.book?.authors) {
                const authors = rb.book.authors.split(',').map((a) => a.trim());
                authors.forEach((author) => {
                    if (author) {
                        authorCount[author] = (authorCount[author] || 0) + 1;
                    }
                });
            }
        });
    
        // Top géneros
        const topGenres = Object.entries(genreCount)
            .map(([genre, count]) => ({ genre, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    
        // Top autores
        const topAuthors = Object.entries(authorCount)
            .map(([author, count]) => ({ author, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    
        // Libros este mes
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const booksThisMonth = readBooks.filter(
            (rb) => rb.dateFinished >= monthStart
        ).length;
    
        return {
            totalBooksRead,
            totalPagesRead,
            averageRating: Number(averageRating.toFixed(2)),
            topGenres,
            topAuthors,
            booksThisMonth,
            readingStreak: 0, // TODO: implementar lógica de racha
        };
    } catch (error) {
        console.error('Error en getReadingStats:', error);
        throw error;
    }
}