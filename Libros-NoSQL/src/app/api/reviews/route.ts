import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongoose';
import Book from '../../../models/Book';
import Review from '../../../models/Review';
import Vote from '../../../models/Vote';
import { requireAuth } from '../../../lib/auth-utils';

// GET - Obtener reseñas por libro
export async function GET(request: NextRequest) {
  try {
    await connectDB(); // <-- Se encarga de conectar a la base de datos
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: 'bookId es requerido' }, { status: 400 });
    }

    // Parte en donde se hace el cambio de prisma a mongoose
    const reviews = await Review.find({ bookId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Crear nueva reseña (PROTEGIDA CON AUTENTICACIÓN)
async function handlePost(request: NextRequest) {
  try {
    await connectDB(); // <-- Establece la conexión a la base de datos

    const body = await request.json();
    const { bookId, rating, reviewText, bookData } = body;
    
    // Obtener datos del usuario del token (agregado por requireAuth)
    const user = (request as any).user;

    // Validaciones
    if (!bookId || !rating || !reviewText) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La calificación debe estar entre 1 y 5' }, { status: 400 });
    }

    // Verificar si el libro existe, si no, crearlo
    let book = await Book.findById(bookId); // <-- Cambio de prisma a mongoose

    // Parte en donde se hace el cambio de prisma a mongoose
    if (!book && bookData) {
      book = await Book.create({
        _id: bookId,
        title: bookData.title,
        authors: Array.isArray(bookData.authors) ? bookData.authors : [bookData.authors || ''],
        publisher: bookData.publisher,
        publishedDate: bookData.publishedDate,
        description: bookData.description,
        imageUrl: bookData.imageUrl,
        pageCount: bookData.pageCount,
        categories: Array.isArray(bookData.categories) ? bookData.categories : [bookData.categories || ''],
        language: bookData.language,
        previewLink: bookData.previewLink,
        infoLink: bookData.infoLink,
      });
    }

    // Crear la reseña usando datos del usuario autenticado
    const review = await Review.create({ // <-- Cambio de prisma a mongoose
      bookId,
      userName: user.name, // Usar nombre del usuario autenticado
      userId: user.userId, // Agregar ID del usuario para futuras funcionalidades
      rating,
      reviewText,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// Proteger la ruta POST con autenticación
export const POST = requireAuth(handlePost);
