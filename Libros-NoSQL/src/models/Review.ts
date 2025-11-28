import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  bookId: string; // ID del libro desde Google Books API
  userName: string;
  userId?: string; // ID del usuario que escribió la reseña (opcional para compatibilidad)
  rating: number; // 1-5 estrellas
  reviewText: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  bookId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  userId: { type: String, required: false, index: true }, // ID del usuario autenticado
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  reviewText: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
}, {
  timestamps: true, // Crea createdAt y updatedAt automáticamente
});

// Índice compuesto para búsquedas eficientes
ReviewSchema.index({ bookId: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

/**
 * Este archivo define el modelo de "Review" (Reseña) para MongoDB usando Mongoose.
 * 
 * ¿Qué es un modelo? Es una estructura que le dice a la base de datos cómo debe lucir y qué datos debe tener cada reseña.
 * 
 * 1. Importamos Mongoose y algunos tipos de ayuda para TypeScript.
 * 2. Definimos la interfaz IReview, que describe cómo es una reseña:
 *    - Incluye el ID del libro al que pertenece la reseña (bookId), el nombre del usuario, la calificación (rating), el texto de la reseña, votos positivos y negativos, y las fechas de creación y actualización.
 * 3. Creamos el esquema (ReviewSchema), que es como un "molde" para las reseñas en la base de datos:
 *    - Especificamos el tipo de cada campo y si es obligatorio o no.
 *    - El campo "rating" está restringido a valores entre 1 y 5.
 *    - Los campos "upvotes" y "downvotes" tienen un valor por defecto de 0.
 *    - Usamos "timestamps" para que Mongoose agregue automáticamente las fechas de creación y actualización.
 * 4. Añadimos un índice compuesto ({ bookId: 1, createdAt: -1 }) para optimizar las búsquedas de reseñas por libro y ordenarlas por fecha de creación.
 * 5. Finalmente, exportamos el modelo Review:
 *    - Si ya existe el modelo (por recarga en desarrollo), lo reutilizamos.
 *    - Si no, lo creamos usando el esquema definido.
 * 
 * En resumen: este archivo le dice a la base de datos cómo debe guardar la información de las reseñas de los libros y qué datos debe tener cada una.
 */