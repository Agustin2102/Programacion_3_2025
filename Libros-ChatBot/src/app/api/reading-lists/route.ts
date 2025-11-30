import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongoose';
import ReadingList from '../../../models/ReadingList';

// GET - Obtener listas de lectura de un usuario
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    const readingLists = await ReadingList.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(readingLists);
  } catch (error) {
    console.error('Error al obtener listas de lectura:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Crear nueva lista de lectura
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, name, description, isPublic } = body;

    if (!userId || !name) {
      return NextResponse.json({ 
        error: 'userId y name son requeridos' 
      }, { status: 400 });
    }

    // Verificar si ya existe una lista con ese nombre
    const existingList = await ReadingList.findOne({ userId, name });
    
    if (existingList) {
      return NextResponse.json({ 
        error: 'Ya existe una lista con ese nombre' 
      }, { status: 400 });
    }

    const readingList = await ReadingList.create({
      userId,
      name,
      description: description || '',
      books: [],
      isPublic: isPublic || false,
    });

    return NextResponse.json(readingList, { status: 201 });
  } catch (error) {
    console.error('Error al crear lista de lectura:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}