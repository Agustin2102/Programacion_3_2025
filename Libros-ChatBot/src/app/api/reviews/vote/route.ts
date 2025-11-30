import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import Review from '../../../../models/Review';
import Vote from '../../../../models/Vote';

// POST - Votar en una reseña
export async function POST(request: NextRequest) {
  try {
    await connectDB(); // <-- Establece la conexión a la base de datos
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
    const existingVote = await Vote.findOne({
      reviewId,
      userIP,
    });

    if (existingVote) {
      // Si ya votó, actualizar el voto si es diferente
      if (existingVote.voteType !== voteType) {
        await Vote.findByIdAndUpdate(existingVote._id, { voteType });
      } else {
        return NextResponse.json({ error: 'Ya has votado en esta reseña' }, { status: 400 });
      }
    } else {
      // Crear nuevo voto
      await Vote.create({
        reviewId,
        userIP,
        voteType,
      });
    }

    // Recalcular votos de la reseña
    const votes = await Vote.find({ reviewId });

    const upvotes = votes.filter(vote => vote.voteType === 'UP').length;
    const downvotes = votes.filter(vote => vote.voteType === 'DOWN').length;

    // Actualizar la reseña con los nuevos conteos
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { upvotes, downvotes },
      { new: true }
    );

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error al votar:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
