import mongoose, { Document, Schema } from 'mongoose';


export interface IVote extends Document {
  reviewId: mongoose.Types.ObjectId;
  userIP: string; // IP del usuario para evitar votos duplicados
  voteType: 'UP' | 'DOWN';
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>({
  reviewId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Review', 
    required: true 
  },
  userIP: { type: String, required: true },
  voteType: { 
    type: String, 
    enum: ['UP', 'DOWN'], 
    required: true 
  },
}, {
  timestamps: { createdAt: true, updatedAt: false }, // Solo createdAt
});

// Índice único para evitar votos duplicados del mismo usuario en la misma reseña
VoteSchema.index({ reviewId: 1, userIP: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);

/**
 * Este archivo define el modelo de "Vote" (Voto) para MongoDB usando Mongoose.
 * 
 * ¿Qué es un modelo? Es una estructura que le dice a la base de datos cómo debe lucir y qué datos debe tener cada voto.
 * 
 * 1. Importamos Mongoose y algunos tipos de ayuda para TypeScript.
 * 2. Definimos la interfaz IVote, que describe cómo es un voto:
 *    - Incluye el ID de la reseña a la que pertenece el voto (reviewId), la IP del usuario (userIP) para evitar votos duplicados,
 *      el tipo de voto (voteType: 'UP' o 'DOWN'), y la fecha de creación (createdAt).
 * 3. Creamos el esquema (VoteSchema), que es como un "molde" para los votos en la base de datos:
 *    - Especificamos el tipo de cada campo y si es obligatorio o no.
 *    - El campo "reviewId" es una referencia al modelo "Review".
 *    - El campo "voteType" solo puede ser 'UP' o 'DOWN'.
 *    - Usamos "timestamps" para que Mongoose agregue automáticamente la fecha de creación.
 * 4. Añadimos un índice único compuesto ({ reviewId: 1, userIP: 1 }) para evitar que un mismo usuario (por IP)
 *    pueda votar más de una vez en la misma reseña.
 * 5. Finalmente, exportamos el modelo Vote:
 *    - Si ya existe el modelo (por recarga en desarrollo), lo reutilizamos.
 *    - Si no, lo creamos usando el esquema definido.
 * 
 * En resumen: este archivo le dice a la base de datos cómo debe guardar la información de los votos sobre las reseñas,
 * asegurando que cada usuario solo pueda votar una vez por reseña y registrando si fue un voto positivo o negativo.
 */
