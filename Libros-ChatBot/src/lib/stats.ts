import { prisma } from './prisma';
import { getBookDetails } from './google-books';

interface ReadingStats {
  totalBooksRead: number;
  totalPages: number;
  averageRating: number;
  favoriteGenres: { genre: string; count: number }[];
  favoriteAuthors: { author: string; count: number }[];
  booksThisMonth: number;
  booksThisYear: number;
}

export async function calculateReadingStats(
  userId: string,
  period: 'all-time' | 'year' | 'month' | 'week' = 'all-time'
): Promise<ReadingStats> {
  const now = new Date();
  let dateFilter: Date | undefined;

  switch (period) {
    case 'week':
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      dateFilter = new Date(now.getFullYear(), 0, 1);
      break;
  }

  const whereClause = dateFilter
    ? { userId, dateFinished: { gte: dateFilter } }
    : { userId };

  const readBooks = await prisma.readBook.findMany({
    where: whereClause,
    select: {
      bookId: true,
      rating: true,
      dateFinished: true
    }
  });

  // Calcular estadísticas básicas
  const totalBooksRead = readBooks.length;
  const ratingsSum = readBooks.reduce((sum, book) => sum + (book.rating || 0), 0);
  const ratingsCount = readBooks.filter(b => b.rating).length;
  const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

  // Libros este mes y año
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);

  const booksThisMonth = await prisma.readBook.count({
    where: { userId, dateFinished: { gte: thisMonth } }
  });

  const booksThisYear = await prisma.readBook.count({
    where: { userId, dateFinished: { gte: thisYear } }
  });

  // Obtener detalles de los libros para calcular páginas, géneros y autores
  let totalPages = 0;
  const genresMap = new Map<string, number>();
  const authorsMap = new Map<string, number>();

  await Promise.all(
    readBooks.map(async (book) => {
      try {
        const details = await getBookDetails(book.bookId);
        
        // Sumar páginas
        if (details.pageCount) {
          totalPages += details.pageCount;
        }

        // Contar géneros
        if (details.categories) {
          details.categories.forEach((category: string) => {
            const count = genresMap.get(category) || 0;
            genresMap.set(category, count + 1);
          });
        }

        // Contar autores
        if (details.authors) {
          details.authors.forEach((author: string) => {
            const count = authorsMap.get(author) || 0;
            authorsMap.set(author, count + 1);
          });
        }
      } catch (error) {
        console.error(`Error obteniendo detalles de libro ${book.bookId}:`, error);
      }
    })
  );

  // Convertir mapas a arrays ordenados por cantidad
  const favoriteGenres = Array.from(genresMap.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 géneros

  const favoriteAuthors = Array.from(authorsMap.entries())
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 autores

  return {
    totalBooksRead,
    totalPages,
    averageRating: Math.round(averageRating * 10) / 10,
    favoriteGenres,
    favoriteAuthors,
    booksThisMonth,
    booksThisYear
  };
}