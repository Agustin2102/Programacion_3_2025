import { prisma } from '../../../lib/prisma';

/**
 * addToReadingList
 *      Agrega un libro a la lista "Quiero Leer"
 */
export async function addToReadingList(params: {
    bookId: string;
    priority?: 'high' | 'medium' | 'low';
    notes?: string;
}): Promise<{ success: boolean; message: string}> {

    try {
        const { bookId, priority = 'medium', notes } = params;

        if(!bookId) {
            throw new Error('bookId es requerido');
        }

        // Verificar si el libro ya está en la lista
        const existing = await prisma.readingListItem.findUnique({
            where: { bookId },
        });

        if (existing) {
            // Actualizar si ya existe
            await prisma.readingListItem.update({
                where: { bookId },
                data: { priority, notes },
            });
            return {
                success: true,
                message: 'Lista de lectura actualizada exitosamente',
            };
        }

        // Crear nuevo item
        await prisma.readingListItem.create({
            data: {
                bookId,
                priority,
                notes,
            },
        });

        return {
            success: true,
            message: 'Libro agregado a la lista de lectura exitosamente',
        };

    } catch (error) {
        console.error('Error en addToReadingList:', error);
        throw error;
    }
}


/**
 * getReadingList
 * Obtiene la lista de libros pendientes del usuario
 */

export async function getReadingList(params: {
    filter?: string;
    limit?: number;
  }): Promise<any[]> {
    try {
        const { filter, limit = 50 } = params;
    
        let whereClause: any = {};
    
        // Aplicar filtros si existen
        if (filter === 'high') {
            whereClause.priority = 'high';
        } else if (filter === 'medium') {
            whereClause.priority = 'medium';
        } else if (filter === 'low') {
            whereClause.priority = 'low';
        }
  
        // Obtener items de la lista
        const items = await prisma.readingListItem.findMany({
                where: whereClause,
                orderBy: {
                addedAt: 'desc',
            },
            take: limit,
            include: {
                book: true,
            },
        });
    
        // Formatear para el LLM
        return items.map((item) => ({
            id: item.id,
            bookId: item.bookId,
            title: item.book.title,
            authors: item.book.authors,
            priority: item.priority,
            notes: item.notes,
            addedAt: item.addedAt,
        }));
    } catch (error) {
        console.error('Error en getReadingList:', error);
        throw error;
    }
  }