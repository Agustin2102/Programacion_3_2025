import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET - Obtener listas de lectura personalizadas de un usuario
export async function GET(request: NextRequest) {
  try {
    // Obtener userId del token
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

    // Obtener todas las listas personalizadas del usuario con conteo de libros
    const customLists = await prisma.customReadingList.findMany({
      where: { userId },
      include: {
        books: true,
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Formatear respuesta
    const formattedLists = customLists.map(list => ({
      _id: list.id,
      name: list.name,
      description: list.description,
      books: list.books.map(b => b.bookId),
      isPublic: list.isPublic,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedLists);
  } catch (error) {
    console.error('Error al obtener listas de lectura:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Crear nueva lista de lectura personalizada
export async function POST(request: NextRequest) {
  try {
    // Obtener userId del token
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

    if (!name) {
      return NextResponse.json({ 
        error: 'El nombre de la lista es requerido' 
      }, { status: 400 });
    }

    // Verificar si ya existe una lista con ese nombre
    const existingList = await prisma.customReadingList.findUnique({
      where: {
        userId_name: {
          userId,
          name: name.trim()
        }
      }
    });
    
    if (existingList) {
      return NextResponse.json({ 
        error: 'Ya existe una lista con ese nombre' 
      }, { status: 400 });
    }

    // Crear la lista personalizada
    const customList = await prisma.customReadingList.create({
      data: {
        userId,
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: isPublic || false,
      },
      include: {
        books: true,
      }
    });

    // Formatear respuesta
    const formattedList = {
      _id: customList.id,
      name: customList.name,
      description: customList.description,
      books: customList.books.map(b => b.bookId),
      isPublic: customList.isPublic,
      createdAt: customList.createdAt.toISOString(),
      updatedAt: customList.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedList, { status: 201 });
  } catch (error) {
    console.error('Error al crear lista:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}