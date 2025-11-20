/**
 * Componente para mostrar un libro individual
 */

interface BookCardProps {
    book: {
        id: string;
        title: string;
        authors?: string[];
        description?: string;
        thumbnail?: string;
        pageCount?: number;
        publishedDate?: string;
        categories?: string[];
        averageRating?: number;
    };
}

export default function BookCard({ book }: BookCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
            {/* Thumbnail */}
            {book.thumbnail && (
                <div className="flex-shrink-0">
                    <img
                        src={book.thumbnail}
                        alt={book.title}
                        className="w-24 h-32 object-cover rounded"
                    />
                </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                    {book.title}
                </h3>

                {book.authors && book.authors.length > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                        por {book.authors.join(', ')}
                    </p>
                )}

                {book.description && (
                    <p className="text-sm text-gray-700 line-clamp-3 mb-2">
                        {book.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {book.pageCount && (
                        <span>📖 {book.pageCount} páginas</span>
                    )}
                    {book.publishedDate && (
                        <span>📅 {book.publishedDate}</span>
                    )}
                    {book.averageRating && (
                        <span>⭐ {book.averageRating}/5</span>
                    )}
                </div>

                {book.categories && book.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {book.categories.slice(0, 3).map((cat, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
