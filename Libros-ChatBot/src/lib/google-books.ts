interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    language?: string;
    previewLink?: string;
    infoLink?: string;
  };
}

interface SearchBooksParams {
  query: string;
  maxResults?: number;
  orderBy?: 'relevance' | 'newest';
}

interface SearchBooksResult {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string;
  description?: string;
}

export async function searchBooks({
  query,
  maxResults = 10,
  orderBy = 'relevance'
}: SearchBooksParams): Promise<SearchBooksResult[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY || '';
  const params = new URLSearchParams({
    q: query,
    maxResults: maxResults.toString(),
    orderBy,
    ...(apiKey && { key: apiKey })
  });

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?${params}`
  );

  if (!response.ok) {
    throw new Error(`Google Books API error: ${response.statusText}`);
  }

  const data = await response.json();
  const items: GoogleBook[] = data.items || [];

  return items.map(book => ({
    id: book.id,
    title: book.volumeInfo.title,
    authors: book.volumeInfo.authors || [],
    thumbnail: book.volumeInfo.imageLinks?.thumbnail,
    description: book.volumeInfo.description
  }));
}

export async function getBookDetails(bookId: string) {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY || '';
  const params = new URLSearchParams(apiKey ? { key: apiKey } : {});
  
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${bookId}?${params}`
  );

  if (!response.ok) {
    throw new Error(`Book not found: ${bookId}`);
  }

  const book: GoogleBook = await response.json();
  
  return {
    id: book.id,
    title: book.volumeInfo.title,
    authors: book.volumeInfo.authors || [],
    publisher: book.volumeInfo.publisher,
    publishedDate: book.volumeInfo.publishedDate,
    description: book.volumeInfo.description,
    pageCount: book.volumeInfo.pageCount,
    categories: book.volumeInfo.categories || [],
    thumbnail: book.volumeInfo.imageLinks?.thumbnail,
    language: book.volumeInfo.language,
    previewLink: book.volumeInfo.previewLink,
    infoLink: book.volumeInfo.infoLink
  };
}