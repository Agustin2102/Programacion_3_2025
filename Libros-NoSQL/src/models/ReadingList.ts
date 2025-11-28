import mongoose, { Document, Schema } from 'mongoose';

export interface IReadingList extends Document {
  userId: string; // ID del usuario
  name: string; // Nombre de la lista (ej: "Para leer", "Leyendo", "Leídos")
  description?: string; // Descripción opcional
  books: string[]; // Array de IDs de libros
  isPublic: boolean; // Si la lista es pública o privada
  createdAt: Date;
  updatedAt: Date;
}

const ReadingListSchema = new Schema<IReadingList>({
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  books: [{ 
    type: String // IDs de libros de Google Books API
  }],
  isPublic: { 
    type: Boolean, 
    default: false
  },
}, {
  timestamps: true,
});

// Índice para búsquedas eficientes
ReadingListSchema.index({ userId: 1, name: 1 });

export default mongoose.models.ReadingList || mongoose.model<IReadingList>('ReadingList', ReadingListSchema);