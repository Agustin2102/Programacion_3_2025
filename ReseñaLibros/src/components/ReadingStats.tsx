/**
 * Componente para mostrar estadísticas de lectura
 */

interface ReadingStatsProps {
    stats: {
        totalBooksRead: number;
        totalPagesRead: number;
        averageRating: number;
        topGenres?: { genre: string; count: number }[];
        topAuthors?: { author: string; count: number }[];
        booksThisMonth: number;
        readingStreak?: number;
    };
}

export default function ReadingStats({ stats }: ReadingStatsProps) {
    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Tus Estadísticas</h3>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-indigo-600">{stats.totalBooksRead}</div>
                    <div className="text-sm text-gray-600 mt-1">Libros Leídos</div>
                </div>

                <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">{stats.totalPagesRead.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 mt-1">Páginas Leídas</div>
                </div>

                <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-600">⭐ {stats.averageRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-600 mt-1">Rating Promedio</div>
                </div>

                <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.booksThisMonth}</div>
                    <div className="text-sm text-gray-600 mt-1">Este Mes</div>
                </div>
            </div>

            {/* Top Genres */}
            {stats.topGenres && stats.topGenres.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">🎯 Géneros Favoritos</h4>
                    <div className="space-y-2">
                        {stats.topGenres.map((genre, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{genre.genre}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full"
                                            style={{ width: `${(genre.count / stats.totalBooksRead) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                                        {genre.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Authors */}
            {stats.topAuthors && stats.topAuthors.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">✍️ Autores Favoritos</h4>
                    <div className="space-y-2">
                        {stats.topAuthors.map((author, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{author.author}</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {author.count} {author.count === 1 ? 'libro' : 'libros'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reading Streak */}
            {stats.readingStreak !== undefined && stats.readingStreak > 0 && (
                <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="text-lg font-bold text-orange-600">{stats.readingStreak} semanas</div>
                    <div className="text-sm text-gray-600">Racha de lectura</div>
                </div>
            )}
        </div>
    );
}
