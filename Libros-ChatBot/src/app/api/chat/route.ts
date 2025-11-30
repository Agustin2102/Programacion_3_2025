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
        console.log('[CHAT API] ========== Nueva petición ==========');
        const { messages } = await req.json();
        console.log('[CHAT API] Mensajes recibidos:', messages.length);

        // Obtener userId del JWT desde Authorization header
        const authHeader = req.headers.get('authorization');
        console.log('[CHAT API] Authorization header:', authHeader ? `${authHeader.substring(0, 30)}...` : 'NO PRESENTE');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[CHAT API] ✗ No hay token en el header');
            return new Response(
                JSON.stringify({ error: 'No autenticado' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const token = authHeader.substring(7); // Remover "Bearer "
        console.log('[CHAT API] Token extraído:', `${token.substring(0, 20)}...`);

        let userId: string;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
            userId = decoded.userId;
            console.log('[CHAT API] Usuario autenticado:', userId);
            console.log('[CHAT API] Token decodificado completo:', decoded);
        } catch (error) {
            console.log('[CHAT API] ✗ Error al verificar token:', error);
            return new Response(
                JSON.stringify({ error: 'Token inválido' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log('[CHAT API] Configuración:');
        console.log('  - Modelo: gemini-2.0-flash');
        console.log('  - API Key presente:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);
        console.log('  - UserId:', userId);

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
      NO inventes IDs de libros.`,
            tools: {
                searchBooks: tool({
                    description: 'Buscar libros por título, autor, tema o palabras clave. Devuelve una lista de libros con sus IDs.',
                    parameters: z.object({
                        query: z.string().describe('Término de búsqueda (título, autor, género, etc.)'),
                        maxResults: z.number().optional().default(10),
                        orderBy: z.enum(['relevance', 'newest']).optional().default('relevance')
                    }),
                    execute: async ({ query, maxResults, orderBy }) => {
                        console.log('[TOOL searchBooks] Ejecutando con:', { query, maxResults, orderBy });
                        try {
                            const books = await searchBooks({ query, maxResults, orderBy });
                            console.log('[TOOL searchBooks] ✓ Encontrados', books.length, 'libros');
                            return { books };
                        } catch (error) {
                            console.error('[TOOL searchBooks] ✗ Error:', error);
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
                        console.log('[TOOL getBookDetails] Ejecutando para:', bookId);
                        try {
                            const book = await getBookDetails(bookId);
                            console.log('[TOOL getBookDetails] ✓ Libro obtenido');
                            return { book };
                        } catch (error) {
                            console.error('[TOOL getBookDetails] ✗ Error:', error);
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
                        console.log('[TOOL addToReadingList] Agregando:', bookId, 'a lista:', targetListName);
                        
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
                                console.log('[TOOL addToReadingList] ✓ Lista creada:', targetListName);
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

                            console.log('[TOOL addToReadingList] ✓ Libro agregado');
                            return { 
                                success: true, 
                                message: `Libro agregado a ${targetListName}` 
                            };
                        } catch (error) {
                            console.error('[TOOL addToReadingList] ✗ Error:', error);
                            throw error;
                        }
                    }
                }),

                getReadingList: tool({
                    description: 'Obtener la lista de libros de una lista específica del usuario. Si no se especifica listName, obtiene todos los libros de todas las listas.',
                    parameters: z.object({
                        listName: z.string().optional().describe('Nombre de la lista específica a consultar'),
                        limit: z.number().optional().default(20).describe('Máximo número de libros a devolver')
                    }),
                    execute: async ({ listName, limit }) => {
                        console.log('[TOOL getReadingList] Obteniendo lista:', listName || 'todas', 'limit:', limit);
                        try {
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
                                // Obtener todos los libros de todas las listas
                                books = await prisma.readingList.findMany({
                                    where: { userId },
                                    take: limit,
                                    orderBy: { addedAt: 'desc' }
                                });
                            }

                            console.log('[TOOL getReadingList] ✓ Encontrados', books.length, 'libros');
                            return { success: true, books, count: books.length };
                        } catch (error) {
                            console.error('[TOOL getReadingList] ✗ Error:', error);
                            throw error;
                        }
                    }
                }),

                getAllLists: tool({
                    description: 'Obtener todas las listas de lectura personalizadas del usuario con información de cuántos libros tiene cada una',
                    parameters: z.object({}),
                    execute: async () => {
                        console.log('[TOOL getAllLists] Obteniendo todas las listas del usuario');
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

                            console.log('[TOOL getAllLists] ✓ Encontradas', lists.length, 'listas');
                            return { success: true, lists: formattedLists, count: lists.length };
                        } catch (error) {
                            console.error('[TOOL getAllLists] ✗ Error:', error);
                            throw error;
                        }
                    }
                }),

                markAsRead: tool({
                    description: 'Marcar un libro como leído con rating y review opcionales',
                    parameters: z.object({
                        bookId: z.string(),
                        rating: z.number().min(1).max(5).optional(),
                        review: z.string().optional()
                    }),
                    execute: async ({ bookId, rating, review }) => {
                        console.log('[TOOL markAsRead] Marcando como leído:', bookId);
                        try {
                            await prisma.readBook.create({
                                data: {
                                    userId,
                                    bookId,
                                    rating,
                                    review
                                }
                            });

                            await prisma.readingList.deleteMany({
                                where: { userId, bookId }
                            });
                            console.log('[TOOL markAsRead] ✓ Libro marcado como leído');
                            return { success: true, message: 'Libro marcado como leído' };
                        } catch (error) {
                            console.error('[TOOL markAsRead] ✗ Error:', error);
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
                        console.log('[TOOL getReadingStats] Obteniendo stats, period:', period);
                        try {
                            const stats = await calculateReadingStats(userId, period);
                            console.log('[TOOL getReadingStats] ✓ Stats calculadas');
                            return { stats };
                        } catch (error) {
                            console.error('[TOOL getReadingStats] ✗ Error:', error);
                            throw error;
                        }
                    }
                })
            }
        });

        console.log('[CHAT API] ✓ StreamText configurado, devolviendo respuesta');
        return result.toDataStreamResponse();
    } catch (error) {
        console.error('[CHAT API] ✗✗✗ ERROR CRÍTICO ✗✗✗');
        console.error('[CHAT API] Tipo:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('[CHAT API] Mensaje:', error instanceof Error ? error.message : String(error));
        console.error('[CHAT API] Stack:', error instanceof Error ? error.stack : 'No stack available');
        console.error('[CHAT API] Objeto completo:', error);

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