import { NextRequest, NextResponse } from 'next/server';
import Review from '@/models/Review';
import { extractTokenFromHeader, validateToken } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    const user = validateToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    // Obtener todas las reviews del usuario
    const userReviews = await Review.find({ userId: user.userId })
      .sort({ createdAt: -1 }) // Ordenar por más recientes primero
      .lean(); // Usar lean() para mejor performance

    return NextResponse.json({
      success: true,
      reviews: userReviews,
      count: userReviews.length
    });

  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}