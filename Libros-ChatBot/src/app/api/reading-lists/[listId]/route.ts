import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET - Obtener una lista específica
export async function GET(
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

    const customList = await prisma.customReadingList.findFirst({
      where: {
        id: params.listId,
        userId
      },
      include: {
        books: true
      }
    });

    if (!customList) {
      return NextResponse.json({ error: 'Lista no encontrada' }, { status: 404 });
    }

    const formattedList = {
      _id: customList.id,
      name: customList.name,
      description: customList.description,
      books: customList.books.map(b => b.bookId),
      isPublic: customList.isPublic,
      createdAt: customList.createdAt.toISOString(),
      updatedAt: customList.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedList);
  } catch (error) {
    console.error('Error al obtener lista:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// PATCH - Actualizar información de la lista
export async function PATCH(
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

    const body = await request.json();
    const { name, description, isPublic } = body;

    // Verificar que la lista existe y pertenece al usuario
    const existingList = await prisma.customReadingList.findFirst({
      where: {
        id: params.listId,
        userId
      }
    });

    if (!existingList) {
      return NextResponse.json({ error: 'Lista no encontrada' }, { status: 404 });
    }

    // Actualizar la lista
    const updatedList = await prisma.customReadingList.update({
      where: { id: params.listId },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? (description?.trim() || null) : undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined,
      },
      include: {
        books: true
      }
    });

    const formattedList = {
      _id: updatedList.id,
      name: updatedList.name,
      description: updatedList.description,
      books: updatedList.books.map(b => b.bookId),
      isPublic: updatedList.isPublic,
      createdAt: updatedList.createdAt.toISOString(),
      updatedAt: updatedList.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedList);
  } catch (error) {
    console.error('Error al actualizar lista:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar lista
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

    // Verificar que la lista existe y pertenece al usuario
    const existingList = await prisma.customReadingList.findFirst({
      where: {
        id: params.listId,
        userId
      }
    });

    if (!existingList) {
      return NextResponse.json({ error: 'Lista no encontrada' }, { status: 404 });
    }

    // Eliminar la lista (Prisma eliminará automáticamente los libros asociados por el cascade)
    await prisma.customReadingList.delete({
      where: { id: params.listId }
    });

    return NextResponse.json({ message: 'Lista eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar lista:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}