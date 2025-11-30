import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { searchBooks, getBookDetails } from '@/lib/google-books';
import { prisma } from '@/lib/prisma';
import { calculateReadingStats } from '@/lib/stats';
import jwt from 'jsonwebtoken';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Obtener userId del JWT desde Authorization header
        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(
                JSON.stringify({ error: 'No autenticado' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const token = authHeader.substring(7); // Remover "Bearer "

        let userId: string;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
            userId = decoded.userId;
        } catch (error) {
            return new Response(
                JSON.stringify({ error: 'Token inválido' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const result = streamText({
            model: google('gemini-2.0-flash'),
            messages,
            maxSteps: 5, // Permite múltiples pasos: tool call → generar respuesta
            system: `Eres un asistente experto en libros. Ayudas a los usuarios a descubrir nuevos libros, 
      gestionar sus listas de lectura y hacer seguimiento de su progreso. Eres amigable, conocedor y 
      siempre das recomendaciones personalizadas basadas en los gustos del usuario.
      
      CAPACIDADES DE LISTAS DE LECTURA:
      - Los usuarios pueden crear múltiples listas personalizadas con nombres propios (ej: "Quiero leer", "Favoritos", "Para el verano")
      - Cuando agregues un libro, puedes especificar a qué lista agregarlo
      - Si no especificas una lista, el libro se agrega a la lista por defecto "Quiero Leer"
      - Puedes consultar libros de una lista específica o de todas las listas
      - getReadingList y getReadBooks YA INCLUYEN título y autores, NO necesitas llamar a getBookDetails adicionales
      - getReadingList devuelve SOLO libros pendientes (no incluye los ya leídos)
      - getReadBooks devuelve los libros que el usuario YA terminó de leer, con sus ratings
      
      FLUJO PARA AGREGAR LIBROS:
      1. Si el usuario pide agregar un libro SIN especificar la lista:
         a) Primero usa getAllLists para ver qué listas tiene el usuario
         b) Muéstrale sus listas disponibles en un formato claro (nombre y cantidad de libros)
         c) Pregúntale a cuál lista quiere agregarlo
         d) Si no tiene listas, menciona que se creará "Quiero Leer" automáticamente
      2. Si el usuario especifica la lista directamente, agrégalo sin preguntar
      3. Si el usuario dice "la lista por defecto" o "lista principal", usa "Quiero Leer"
      
      IMPORTANTE: Para obtener detalles de un libro específico, SIEMPRE debes:
      1. Primero usar searchBooks para encontrar el libro y obtener su ID
      2. Luego usar getBookDetails con el ID obtenido
      NO inventes IDs de libros.
      
      CUANDO MUESTRES LISTAS: Los resultados de getReadingList y getReadBooks incluyen título y autores,
      muéstralos directamente al usuario con formato bonito. NO necesitas hacer llamadas adicionales a getBookDetails.`,
            tools: {
                searchBooks: tool({
                    description: 'Buscar libros por título, autor, tema o palabras clave. Devuelve una lista de libros con sus IDs.',
                    parameters: z.object({
                        query: z.string().describe('Término de búsqueda (título, autor, género, etc.)'),
                        maxResults: z.number().optional().default(10),
                        orderBy: z.enum(['relevance', 'newest']).optional().default('relevance')
                    }),
                    execute: async ({ query, maxResults, orderBy }) => {
                        try {
                            const books = await searchBooks({ query, maxResults, orderBy });
                            return { books };
                        } catch (error) {
                            throw error;
                        }
                    }
                }),

                getBookDetails: tool({
                    description: 'Obtener información detallada de un libro específico usando su ID. IMPORTANTE: Solo usa IDs obtenidos de searchBooks, nunca inventes un ID.',
                    parameters: z.object({
                        bookId: z.string().describe('ID del libro obtenido previamente de searchBooks')
                    }),
                    execute: async ({ bookId }) => {
                        try {
                            const book = await getBookDetails(bookId);
                            return { book };
                        } catch (error) {
                            throw error;
                        }
                    }
                }),

                addToReadingList: tool({
                    description: 'Agregar un libro a una lista de lectura del usuario. Si no se especifica listName, se agrega a la lista por defecto "Quiero Leer".',
                    parameters: z.object({
                        bookId: z.string().describe('ID del libro de Google Books'),
                        listName: z.string().optional().describe('Nombre de la lista donde agregar el libro. Si no existe, se creará automáticamente.'),
                    }),
                    execute: async ({ bookId, listName }) => {
                        // Si no se especifica lista, usar "Quiero Leer" como lista por defecto
                        const targetListName = listName || 'Quiero Leer';
                        
                        try {
                            // Buscar o crear la lista personalizada
                            let customList = await prisma.customReadingList.findUnique({
                                where: {
                                    userId_name: {
                                        userId,
                                        name: targetListName
                                    }
                                }
                            });

                            if (!customList) {
                                // Crear la lista si no existe
                                customList = await prisma.customReadingList.create({
                                    data: {
                                        userId,
                                        name: targetListName,
                                        description: targetListName === 'Quiero Leer' 
                                            ? 'Libros que quiero leer próximamente' 
                                            : null,
                                        isPublic: false
                                    }
                                });
                            }

                            const listId = customList.id;

                            // Verificar si el libro ya está en la lista
                            const existing = await prisma.readingList.findUnique({
                                where: {
                                    userId_bookId_listId: {
                                        userId,
                                        bookId,
                                        listId
                                    }
                                }
                            });

                            if (existing) {
                                return { 
                                    success: false, 
                                    message: `El libro ya está en ${targetListName}` 
                                };
                            }

                            // Agregar el libro
                            await prisma.readingList.create({
                                data: {
                                    userId,
                                    bookId,
                                    listId
                                }
                            });

                            return { 
                                success: true, 
                                message: `Libro agregado a ${targetListName}` 
                            };
                        } catch (error) {
                            throw error;
                        }
                    }
                }),

                getReadingList: tool({
                    description: 'Obtener la lista de libros PENDIENTES de lectura del usuario con sus títulos y autores (excluye libros ya marcados como leídos). Si no se especifica listName, obtiene todos los libros de todas las listas.',
                    parameters: z.object({
                        listName: z.string().optional().describe('Nombre de la lista específica a consultar'),
                        limit: z.number().optional().default(20).describe('Máximo número de libros a devolver')
                    }),
                    execute: async ({ listName, limit }) => {
                        try {
                            // Obtener IDs de libros ya leídos para excluirlos
                            const readBooks = await prisma.readBook.findMany({
                                where: { userId },
                                select: { bookId: true }
                            });
                            const readBookIds = readBooks.map(b => b.bookId);

                            let books;

                            if (listName) {
                                // Obtener libros de una lista específica
                                const customList = await prisma.customReadingList.findUnique({
                                    where: {
                                        userId_name: {
                                            userId,
                                            name: listName
                                        }
                                    },
                                    include: {
                                        books: {
                                            where: {
                                                bookId: { notIn: readBookIds }
                                            },
                                            take: limit,
                                            orderBy: { addedAt: 'desc' }
                                        }
                                    }
                                });

                                if (!customList) {
                                    return { 
                                        success: false, 
                                        message: `No existe una lista llamada "${listName}"`,
                                        books: [] 
                                    };
                                }

                                books = customList.books;
                            } else {
                                // Obtener todos los libros pendientes de todas las listas
                                books = await prisma.readingList.findMany({
                                    where: { 
                                        userId,
                                        bookId: { notIn: readBookIds }
                                    },
                                    take: limit,
                                    orderBy: { addedAt: 'desc' }
                                });
                            }

                            // Obtener detalles de cada libro desde Google Books
                            const booksWithDetails = await Promise.all(
                                books.map(async (book) => {
                                    try {
                                        const details = await getBookDetails(book.bookId);
                                        return {
                                            ...book,
                                            title: details.title,
                                            authors: details.authors,
                                            thumbnail: details.thumbnail
                                        };
                                    } catch (error) {
                                        return {
                                            ...book,
                                            title: 'Desconocido',
                                            authors: [],
                                            thumbnail: null
                                        };
                                    }
                                })
                            );

                            return { success: true, books: booksWithDetails, count: booksWithDetails.length };
                        } catch (error) {
                            throw error;
                        }
                    }
                }),

                getAllLists: tool({
                    description: 'Obtener todas las listas de lectura personalizadas del usuario con información de cuántos libros tiene cada una',
                    parameters: z.object({}),
                    execute: async () => {
                        try {
                            const lists = await prisma.customReadingList.findMany({
                                where: { userId },
                                include: {
                                    _count: {
                                        select: { books: true }
                                    }
                                },
                                orderBy: { updatedAt: 'desc' }
                            });

                            const formattedLists = lists.map(list => ({
                                name: list.name,
                                description: list.description,
                                bookCount: list._count.books,
                                isPublic: list.isPublic
                            }));

                            return { success: true, lists: formattedLists, count: lists.length };
                        } catch (error) {
                            throw error;
                        }
                    }
                }),

                markAsRead: tool({
                    description: 'Marcar un libro como leído con rating y review opcionales. Si el libro ya estaba marcado como leído, actualiza el rating/review.',
                    parameters: z.object({
                        bookId: z.string(),
                        rating: z.number().min(1).max(5).optional(),
                        review: z.string().optional()
                    }),
                    execute: async ({ bookId, rating, review }) => {
                        try {
                            // Usar upsert para crear o actualizar
                            const readBook = await prisma.readBook.upsert({
                                where: {
                                    userId_bookId: {
                                        userId,
                                        bookId
                                    }
                                },
                                update: {
                                    rating: rating ?? undefined,
                                    review: review ?? undefined,
                                    dateFinished: new Date()
                                },
                                create: {
                                    userId,
                                    bookId,
                                    rating,
                                    review
                                }
                            });

                            // Remover de las listas de lectura
                            await prisma.readingList.deleteMany({
                                where: { userId, bookId }
                            });
                            
                            return { 
                                success: true, 
                                message: rating 
                                    ? `Libro marcado como leído con ${rating} estrellas` 
                                    : 'Libro marcado como leído',
                                bookId,
                                rating: readBook.rating
                            };
                        } catch (error) {
                            return { 
                                success: false, 
                                error: 'Error al marcar el libro como leído. Verifica que el libro exista.' 
                            };
                        }
                    }
                }),

                getReadBooks: tool({
                    description: 'Obtener los libros que el usuario ya marcó como leídos, con sus títulos, autores, ratings y reviews',
                    parameters: z.object({
                        limit: z.number().optional().default(20).describe('Máximo número de libros a devolver')
                    }),
                    execute: async ({ limit }) => {
                        try {
                            const readBooks = await prisma.readBook.findMany({
                                where: { userId },
                                take: limit,
                                orderBy: { dateFinished: 'desc' }
                            });

                            // Obtener detalles de cada libro desde Google Books
                            const booksWithDetails = await Promise.all(
                                readBooks.map(async (book) => {
                                    try {
                                        const details = await getBookDetails(book.bookId);
                                        return {
                                            ...book,
                                            title: details.title,
                                            authors: details.authors,
                                            thumbnail: details.thumbnail
                                        };
                                    } catch (error) {
                                        return {
                                            ...book,
                                            title: 'Desconocido',
                                            authors: [],
                                            thumbnail: null
                                        };
                                    }
                                })
                            );

                            return { 
                                success: true, 
                                books: booksWithDetails, 
                                count: booksWithDetails.length 
                            };
                        } catch (error) {
                            throw error;
                        }
                    }
                }),

                getReadingStats: tool({
                    description: 'Obtener estadísticas de lectura del usuario',
                    parameters: z.object({
                        period: z.enum(['all-time', 'year', 'month', 'week']).optional().default('all-time')
                    }),
                    execute: async ({ period }) => {
                        try {
                            const stats = await calculateReadingStats(userId, period);
                            return { stats };
                        } catch (error) {
                            throw error;
                        }
                    }
                })
            },
        });

        return result.toDataStreamResponse();
    } catch (error) {

        return new Response(
            JSON.stringify({
                error: 'Error en el servidor del chat',
                message: error instanceof Error ? error.message : 'Error desconocido',
                type: error instanceof Error ? error.constructor.name : typeof error
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
