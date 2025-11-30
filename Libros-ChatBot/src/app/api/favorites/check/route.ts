import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth-utils';

// GET - Verificar si un libro está en favoritos (PROTEGIDO CON AUTENTICACIÓN)
async function handleGet(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bookId = searchParams.get('bookId');
        
        // Obtener datos del usuario del token (agregado por requireAuth)
        const user = (request as any).user;

        if (!bookId) {
            return NextResponse.json({
                error: 'bookId es requerido'
            }, {
                status: 400
            });
        }

        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_bookId: {
                    userId: user.userId,
                    bookId
                }
            }
        });

        return NextResponse.json({
            isFavorite: !!favorite,
            favoriteId: favorite?.id || null
        });
    } catch (error) {
        console.error('Error al verificar favorito:', error);
        return NextResponse.json({
            error: 'Error del servidor'
        }, {
            status: 500
        });
    }
}

// Proteger la ruta con autenticación
export const GET = requireAuth(handleGet);
