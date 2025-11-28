import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET - Obtener reseñas por libro
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: 'bookId es requerido' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        bookId: bookId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Crear nueva reseña
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, userName, rating, reviewText, bookData } = body;

    // Validaciones
    if (!bookId || !userName || !rating || !reviewText) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La calificación debe estar entre 1 y 5' }, { status: 400 });
    }

    // Verificar si el libro existe, si no, crearlo
    let book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book && bookData) {
      book = await prisma.book.create({
        data: {
          id: bookId,
          title: bookData.title,
          authors: Array.isArray(bookData.authors) ? bookData.authors.join(', ') : bookData.authors || '',
          publisher: bookData.publisher,
          publishedDate: bookData.publishedDate,
          description: bookData.description,
          imageUrl: bookData.imageUrl,
          pageCount: bookData.pageCount,
          categories: Array.isArray(bookData.categories) ? bookData.categories.join(', ') : bookData.categories || '',
          language: bookData.language,
          previewLink: bookData.previewLink,
          infoLink: bookData.infoLink,
        },
      });
    }

    // Crear la reseña
    const review = await prisma.review.create({
      data: {
        bookId,
        userName,
        rating,
        reviewText,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
