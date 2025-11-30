interface BookInfo {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
  description?: string;
  publishedDate?: string;
  pageCount?: number;
  publisher?: string;
  categories?: string[];
  language?: string;
  previewLink?: string;
  infoLink?: string;
}

const bookCache = new Map<string, BookInfo>();

export async function getBookInfo(bookId: string): Promise<BookInfo | null> {
  // Verificar caché
  if (bookCache.has(bookId)) {
    return bookCache.get(bookId)!;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${bookId}`
    );

    if (!response.ok) {
      console.error(`Error fetching book ${bookId}:`, response.statusText);
      return null;
    }

    const data = await response.json();
    
    const bookInfo: BookInfo = {
      id: data.id,
      title: data.volumeInfo?.title || 'Sin título',
      authors: data.volumeInfo?.authors || [],
      thumbnail: data.volumeInfo?.imageLinks?.thumbnail || 
                 data.volumeInfo?.imageLinks?.smallThumbnail || '',
      description: data.volumeInfo?.description || '',
      publishedDate: data.volumeInfo?.publishedDate || '',
      pageCount: data.volumeInfo?.pageCount || 0,
      publisher: data.volumeInfo?.publisher || '',
      categories: data.volumeInfo?.categories || [],
      language: data.volumeInfo?.language || '',
      previewLink: data.volumeInfo?.previewLink || '',
      infoLink: data.volumeInfo?.infoLink || '',
    };

    // Guardar en caché
    bookCache.set(bookId, bookInfo);

    return bookInfo;
  } catch (error) {
    console.error(`Error fetching book info for ${bookId}:`, error);
    return null;
  }
}

export async function getBooksInfo(bookIds: string[]): Promise<BookInfo[]> {
  const promises = bookIds.map(id => getBookInfo(id));
  const results = await Promise.all(promises);
  return results.filter((book): book is BookInfo => book !== null);
}
