import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
  userId: string; // ID del usuario
  bookId: string; // ID del libro (Google Books API)
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>({
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  bookId: { 
    type: String, 
    required: true,
    index: true
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Índice único para evitar favoritos duplicados
FavoriteSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export default mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);