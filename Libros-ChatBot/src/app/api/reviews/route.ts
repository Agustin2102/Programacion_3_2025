import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth-utils';
import { getBookInfo } from '../../../lib/book-details';

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

    // Verificar si el libro existe en la base de datos, si no, crearlo
    let book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!book) {
      // Obtener detalles del libro desde Google Books API
      const bookDetails = await getBookInfo(bookId);
      
      if (!bookDetails) {
        return NextResponse.json({ error: 'No se pudo obtener información del libro' }, { status: 400 });
      }

      // Crear el libro en la base de datos
      book = await prisma.book.create({
        data: {
          id: bookId,
          title: bookDetails.title,
          authors: bookDetails.authors?.join(', ') || 'Desconocido',
          publisher: bookDetails.publisher || null,
          publishedDate: bookDetails.publishedDate || null,
          description: bookDetails.description || null,
          imageUrl: bookDetails.thumbnail || null,
          pageCount: bookDetails.pageCount || null,
          categories: bookDetails.categories?.join(', ') || '',
          language: bookDetails.language || null,
          previewLink: bookDetails.previewLink || null,
          infoLink: bookDetails.infoLink || null,
        }
      });
    }

    // Crear la reseña usando datos del usuario autenticado
    const review = await prisma.review.create({
      data: {
        bookId,
        userId: user.userId,
        userName: user.name,
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
