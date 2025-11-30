import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth-utils';

// GET - Obtener reseñas por libro
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: 'bookId es requerido' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { bookId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Crear nueva reseña (PROTEGIDA CON AUTENTICACIÓN)
async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, rating, reviewText } = body;
    
    // Obtener datos del usuario del token (agregado por requireAuth)
    const user = (request as any).user;

    // Validaciones
    if (!bookId || !rating || !reviewText) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La calificación debe estar entre 1 y 5' }, { status: 400 });
    }

    // Crear la reseña usando datos del usuario autenticado
    const review = await prisma.review.create({
      data: {
        bookId,
        userId: user.userId,
        rating,
        reviewText,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// Proteger la ruta POST con autenticación
export const POST = requireAuth(handlePost);
