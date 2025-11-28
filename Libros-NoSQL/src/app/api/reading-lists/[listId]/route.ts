import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import ReadingList from '../../../../models/ReadingList';

// GET - Obtener una lista específica por ID
export async function GET(
    request: NextRequest,
    { params }: { params: { listId: string } }
) {
    try {
        await connectDB();

        const { listId } = params;

        const readingList = await ReadingList.findById(listId).lean();

        if (!readingList) {
            return NextResponse.json(
                { error: 'Lista no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(readingList);
    } catch (error) {
        console.error('Error al obtener lista:', error);
        return NextResponse.json(
            { error: 'Error del servidor' },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar una lista
export async function DELETE(
    request: NextRequest,
    { params }: { params: { listId: string } }
) {
    try {
        await connectDB();

        const { listId } = params;

        const deletedList = await ReadingList.findByIdAndDelete(listId);

        if (!deletedList) {
            return NextResponse.json(
                { error: 'Lista no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Lista eliminada exitosamente',
            list: deletedList
        });
    } catch (error) {
        console.error('Error al eliminar lista:', error);
        return NextResponse.json(
            { error: 'Error del servidor' },
            { status: 500 }
        );
    }
}
