import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongoose';
import ReadingList from '../../../../../models/ReadingList';

// PUT - Agregar/quitar libro de una lista
export async function PUT(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    await connectDB();
    
    const { listId } = params;
    const body = await request.json();
    const { bookId, action } = body; // action: 'add' o 'remove'

    if (!bookId || !action) {
      return NextResponse.json({ 
        error: 'bookId y action son requeridos' 
      }, { status: 400 });
    }

    const readingList = await ReadingList.findById(listId);
    
    if (!readingList) {
      return NextResponse.json({ 
        error: 'Lista de lectura no encontrada' 
      }, { status: 404 });
    }

    if (action === 'add') {
      // Verificar si el libro ya está en la lista
      if (readingList.books.includes(bookId)) {
        return NextResponse.json({ 
          error: 'El libro ya está en esta lista' 
        }, { status: 400 });
      }

      // Agregar libro
      readingList.books.push(bookId);
      
    } else if (action === 'remove') {
      // Remover libro
      readingList.books = readingList.books.filter((id: string) => id !== bookId);
      
    } else {
      return NextResponse.json({ 
        error: 'action debe ser "add" o "remove"' 
      }, { status: 400 });
    }

    await readingList.save();
    return NextResponse.json(readingList);
    
  } catch (error) {
    console.error('Error al manejar libro en lista:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}