require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const mongoose = require('mongoose');

// Configuración
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/libros';

// Esquemas de Mongoose (definidos directamente en el script)
const BookSchema = new mongoose.Schema({
  _id: { type: String, required: true },
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
  timestamps: true,
  _id: false,
});

const ReviewSchema = new mongoose.Schema({
  bookId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
}, {
  timestamps: true,
});

const VoteSchema = new mongoose.Schema({
  reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true },
  userIP: { type: String, required: true },
  voteType: { type: String, enum: ['UP', 'DOWN'], required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

const Book = mongoose.model('Book', BookSchema);
const Review = mongoose.model('Review', ReviewSchema);
const Vote = mongoose.model('Vote', VoteSchema);

async function migrateData() {
  let prisma;
  try {
    console.log('🔄 Iniciando migración de SQLite a MongoDB...');

    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Conectar a Prisma (SQLite)
    prisma = new PrismaClient();
    console.log('✅ Conectado a SQLite');

    // Migrar libros
    console.log('�� Migrando libros...');
    const books = await prisma.book.findMany();
    
    for (const book of books) {
      try {
        await Book.create({
          _id: book.id,
          title: book.title,
          authors: book.authors.split(', ').filter(a => a.trim()),
          publisher: book.publisher,
          publishedDate: book.publishedDate,
          description: book.description,
          imageUrl: book.imageUrl,
          pageCount: book.pageCount,
          categories: book.categories.split(', ').filter(c => c.trim()),
          language: book.language,
          previewLink: book.previewLink,
          infoLink: book.infoLink,
          createdAt: book.createdAt,
          updatedAt: book.updatedAt,
        });
        console.log(`  ✅ Libro migrado: ${book.title}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`  ⚠️  Libro ya existe: ${book.title}`);
        } else {
          console.error(`  ❌ Error migrando libro ${book.title}:`, error.message);
        }
      }
    }

    // Migrar reseñas
    console.log('📝 Migrando reseñas...');
    const reviews = await prisma.review.findMany();
    
    for (const review of reviews) {
      try {
        await Review.create({
          bookId: review.bookId,
          userName: review.userName,
          rating: review.rating,
          reviewText: review.reviewText,
          upvotes: review.upvotes,
          downvotes: review.downvotes,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        });
        console.log(`  ✅ Reseña migrada: ${review.userName} - ${review.rating}⭐`);
      } catch (error) {
        console.error(`  ❌ Error migrando reseña:`, error.message);
      }
    }

    // Migrar votos
    console.log('🗳️  Migrando votos...');
    const votes = await prisma.vote.findMany({
      include: {
        review: true
      }
    });
    
    for (const vote of votes) {
      try {
        // Buscar la reseña correspondiente en MongoDB
        const mongoReview = await Review.findOne({ 
          bookId: vote.review.bookId,
          userName: vote.review.userName,
          rating: vote.review.rating,
          reviewText: vote.review.reviewText
        });

        if (mongoReview) {
          await Vote.create({
            reviewId: mongoReview._id,
            userIP: vote.userIP,
            voteType: vote.voteType,
            createdAt: vote.createdAt,
          });
          console.log(`  ✅ Voto migrado: ${vote.voteType}`);
        } else {
          console.log(`  ⚠️  Reseña no encontrada para voto: ${vote.id}`);
        }
      } catch (error) {
        if (error.code === 11000) {
          console.log(`  ⚠️  Voto ya existe`);
        } else {
          console.error(`  ❌ Error migrando voto:`, error.message);
        }
      }
    }

    console.log('🎉 Migración completada exitosamente!');
    console.log(`📊 Estadísticas:`);
    console.log(`  - Libros: ${books.length}`);
    console.log(`  - Reseñas: ${reviews.length}`);
    console.log(`  - Votos: ${votes.length}`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await mongoose.disconnect();
    if (prisma) {
      await prisma.$disconnect();
    }
    process.exit(0);
  }
}

// Ejecutar migración
migrateData();