import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// POST - Agregar libro a una lista específica
export async function POST(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId: string;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar que la lista existe y pertenece al usuario
    const list = await prisma.customReadingList.findFirst({
      where: {
        id: params.listId,
        userId
      }
    });

    if (!list) {
      return NextResponse.json({ error: 'Lista no encontrada' }, { status: 404 });
    }

    const body = await request.json();
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json({ error: 'bookId es requerido' }, { status: 400 });
    }

    // Verificar si el libro ya está en la lista
    const existingBook = await prisma.readingList.findUnique({
      where: {
        userId_bookId_listId: {
          userId,
          bookId,
          listId: params.listId
        }
      }
    });

    if (existingBook) {
      return NextResponse.json({ 
        error: 'El libro ya está en esta lista' 
      }, { status: 400 });
    }

    // Agregar libro a la lista
    const newBook = await prisma.readingList.create({
      data: {
        userId,
        bookId,
        listId: params.listId
      }
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error('Error al agregar libro a lista:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar libro de una lista específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId: string;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const url = new URL(request.url);
    const bookId = url.searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: 'bookId es requerido' }, { status: 400 });
    }

    // Verificar que la entrada existe
    const book = await prisma.readingList.findUnique({
      where: {
        userId_bookId_listId: {
          userId,
          bookId,
          listId: params.listId
        }
      }
    });

    if (!book) {
      return NextResponse.json({ error: 'Libro no encontrado en esta lista' }, { status: 404 });
    }

    // Eliminar libro de la lista
    await prisma.readingList.delete({
      where: {
        userId_bookId_listId: {
          userId,
          bookId,
          listId: params.listId
        }
      }
    });

    return NextResponse.json({ message: 'Libro eliminado de la lista' });
  } catch (error) {
    console.error('Error al eliminar libro de lista:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}