import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// POST - Votar en una reseña
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, voteType } = body;

    // Obtener IP del usuario (simplificado)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const userIP = forwarded ? forwarded.split(',')[0] : realIP || 'unknown';

    if (!reviewId || !voteType) {
      return NextResponse.json({ error: 'reviewId y voteType son requeridos' }, { status: 400 });
    }

    if (voteType !== 'UP' && voteType !== 'DOWN') {
      return NextResponse.json({ error: 'voteType debe ser UP o DOWN' }, { status: 400 });
    }

    // Verificar si el usuario ya votó en esta reseña
    const existingVote = await prisma.vote.findUnique({
      where: {
        reviewId_userIP: {
          reviewId,
          userIP,
        },
      },
    });

    if (existingVote) {
      // Si ya votó, actualizar el voto si es diferente
      if (existingVote.voteType !== voteType) {
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { voteType },
        });
      } else {
        return NextResponse.json({ error: 'Ya has votado en esta reseña' }, { status: 400 });
      }
    } else {
      // Crear nuevo voto
      await prisma.vote.create({
        data: {
          reviewId,
          userIP,
          voteType,
        },
      });
    }

    // Recalcular votos de la reseña
    const votes = await prisma.vote.findMany({
      where: { reviewId },
    });

    const upvotes = votes.filter(vote => vote.voteType === 'UP').length;
    const downvotes = votes.filter(vote => vote.voteType === 'DOWN').length;

    // Actualizar la reseña con los nuevos conteos
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        upvotes,
        downvotes,
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error al votar:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
