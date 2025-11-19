import { NextResponse } from 'next/server';
import { getReadingList } from '../tools/reading-list';

export async function GET() {
  try {
    const items = await getReadingList({ limit: 100 });
    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error('Error en API /api/reading-list:', err);
    return NextResponse.json({ error: 'Error al obtener la lista de lectura' }, { status: 500 });
  }
}
