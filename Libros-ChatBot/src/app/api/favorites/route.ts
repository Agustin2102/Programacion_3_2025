import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET - Obtener favoritos del usuario
export async function GET(request: NextRequest){
    try{
        // Obtener el userId de los parámetros de la URL
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get('userId');

        // Validar que userId sea requerido
        if(!userId){
            return NextResponse.json({
                error: 'userId es requerido'
            }, {
                status: 400
            });
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId },
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

// POST - Agregar un libro a favoritos
export async function POST(request: NextRequest){
    try {
        const body = await request.json();
        const {userId, bookId, action} = body;

        if(!userId || !bookId || !action){
            return NextResponse.json({
                error: 'Todos los campos son requeridos'
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
                        userId,
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
                    userId,
                    bookId
                }
            });

            return NextResponse.json(newFavorite, {status: 201});
        } else if(action === 'remove'){
            // Verificar si el libro está en favoritos
            const existingFavorite = await prisma.favorite.findUnique({
                where: {
                    userId_bookId: {
                        userId,
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
                        userId,
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