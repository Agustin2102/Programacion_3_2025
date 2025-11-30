import mongoose, { Document, Schema } from 'mongoose';


export interface IBook extends Document {
  _id: string; // ID del libro desde Google Books API
  title: string;
  authors: string[]; // Array de autores
  publisher?: string;
  publishedDate?: string;
  description?: string;
  imageUrl?: string;
  pageCount?: number;
  categories: string[]; // Array de categorías
  language?: string;
  previewLink?: string;
  infoLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>({
  _id: { type: String, required: true }, // Usamos el ID de Google Books como _id
  title: { type: String, required: true },
  authors: [{ type: String, required: true }],
  publisher: { type: String },
  publishedDate: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  pageCount: { type: Number },
  categories: [{ type: String, required: true }],
  language: { type: String },
  previewLink: { type: String },
  infoLink: { type: String },
}, {
  timestamps: true, // Crea createdAt y updatedAt automáticamente
  _id: false, // Deshabilitamos el _id automático de MongoDB
});

export default mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);

/**
 * Este archivo define el modelo de "Book" (Libro) para MongoDB usando Mongoose.
 * 
 * ¿Qué es un modelo? Es una forma de decirle a la base de datos cómo debe lucir y qué datos debe tener cada libro.
 * 
 * 1. Importamos Mongoose y algunos tipos de ayuda para TypeScript.
 * 2. Definimos la interfaz IBook, que describe cómo es un libro:
 *    - Tiene campos como título, autores, editorial, fecha de publicación, descripción, imagen, etc.
 *    - Algunos campos son obligatorios (por ejemplo, el título y los autores), otros son opcionales.
 *    - El campo "_id" es el identificador único del libro, que en este caso viene de la API de Google Books.
 * 3. Creamos el esquema (BookSchema), que es como un "molde" para los libros en la base de datos:
 *    - Especificamos el tipo de cada campo y si es obligatorio o no.
 *    - Usamos "timestamps" para que Mongoose agregue automáticamente las fechas de creación y actualización.
 *    - Desactivamos el "_id" automático de MongoDB porque usamos el de Google Books.
 * 4. Finalmente, exportamos el modelo Book:
 *    - Si ya existe el modelo (por recarga en desarrollo), lo reutilizamos.
 *    - Si no, lo creamos usando el esquema definido.
 * 
 * En resumen: este archivo le dice a la base de datos cómo debe guardar la información de los libros y qué datos debe tener cada uno.
 */