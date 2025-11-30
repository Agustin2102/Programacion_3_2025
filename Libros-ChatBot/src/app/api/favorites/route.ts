import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth-utils';

// GET - Obtener favoritos del usuario (PROTEGIDO CON AUTENTICACIÓN)
async function handleGet(request: NextRequest){
    try{
        // Obtener datos del usuario del token (agregado por requireAuth)
        const user = (request as any).user;

        const favorites = await prisma.favorite.findMany({
            where: { userId: user.userId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(favorites);
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        return NextResponse.json({
            error: 'Error del servidor'
        }, {
            status: 500
        });
    }
}

// POST - Agregar/Eliminar un libro de favoritos (PROTEGIDO CON AUTENTICACIÓN)
async function handlePost(request: NextRequest){
    try {
        const body = await request.json();
        const {bookId, action} = body;
        
        // Obtener datos del usuario del token (agregado por requireAuth)
        const user = (request as any).user;

        if(!bookId || !action){
            return NextResponse.json({
                error: 'bookId y action son requeridos'
            }, {
                status: 400
            });
        }

        if(action !== 'add' && action !== 'remove'){
            return NextResponse.json({
                error: 'action debe ser add o remove'
            }, {
                status: 400
            });
        }

        if(action === 'add'){
            // Verificar si el libro ya está en favoritos
            const existingFavorite = await prisma.favorite.findUnique({
                where: {
                    userId_bookId: {
                        userId: user.userId,
                        bookId
                    }
                }
            });

            if(existingFavorite){
                return NextResponse.json({
                    error: 'El libro ya está en favoritos'
                }, {
                    status: 400
                });
            }

            // Si no está, lo agrego
            const newFavorite = await prisma.favorite.create({
                data: {
                    userId: user.userId,
                    bookId
                }
            });

            return NextResponse.json(newFavorite, {status: 201});
        } else if(action === 'remove'){
            // Verificar si el libro está en favoritos
            const existingFavorite = await prisma.favorite.findUnique({
                where: {
                    userId_bookId: {
                        userId: user.userId,
                        bookId
                    }
                }
            });

            if(!existingFavorite){
                return NextResponse.json({
                    error: 'El libro no está en favoritos'
                }, {
                    status: 400
                });
            }

            // Si está, lo elimino
            await prisma.favorite.delete({
                where: {
                    userId_bookId: {
                        userId: user.userId,
                        bookId
                    }
                }
            });

            return NextResponse.json({
                message: 'Libro eliminado de favoritos'
            }, {
                status: 200
            });
        }
    } catch(error){
        console.error('Error al agregar o eliminar libro de favoritos:', error);
        return NextResponse.json({
            error: 'Error del servidor'
        }, {
            status: 500
        });
    }
}

// Proteger las rutas con autenticación
export const GET = requireAuth(handleGet);
export const POST = requireAuth(handlePost);