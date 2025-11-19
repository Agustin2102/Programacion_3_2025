export interface BookDetails {
    id: string;
    title: string;
    authors: string[];
    description: string;
    thumbnail?: string;
    pageCount?: number;
    publishedDate?: string;
    publisher?: string;
    categories: string[];
    language?: string;
    isbn?: string;
    averageRating?: number;
    ratingsCount?: number;
    previewLink?: string;
    infoLink?: string;
}

export interface GoogleBooksItem {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    description?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    pageCount?: number;
    publishedDate?: string;
    publisher?: string;
    categories?: string[];
    language?: string;
    industryIdentifiers?: { type?: string; identifier?: string }[];
    averageRating?: number;
    ratingsCount?: number;
    previewLink?: string;
    infoLink?: string;
  };
}

export interface GoogleBooksResponse {
  kind?: string;
  totalItems?: number;
  items?: GoogleBooksItem[];
}

export interface ReadingListItem {
    id: string;
    bookId: string;
    priority?: string;
    notes?: string;
    addedAt: Date;
}

export interface ReadBook {
    id: string;
    bookId: string;
    rating?: number;
    review?: string;
    dateFinished: Date;
}

export interface ReadingStats {
    totalBooksRead: number;
    totalPagesRead: number;
    averageRating: number;
    topGenres: { genre: string; count: number }[];
    topAuthors: { author: string; count: number }[];
    booksThisMonth: number;
    readingStreak: number;
}