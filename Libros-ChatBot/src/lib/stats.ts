import { prisma } from './prisma';

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
  const averageRating = totalBooksRead > 0 ? ratingsSum / totalBooksRead : 0;

  // Libros este mes y año
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);

  const booksThisMonth = await prisma.readBook.count({
    where: { userId, dateFinished: { gte: thisMonth } }
  });

  const booksThisYear = await prisma.readBook.count({
    where: { userId, dateFinished: { gte: thisYear } }
  });

  return {
    totalBooksRead,
    totalPages: 0, // Se puede calcular si guardamos info del libro
    averageRating: Math.round(averageRating * 10) / 10,
    favoriteGenres: [],
    favoriteAuthors: [],
    booksThisMonth,
    booksThisYear
  };
}