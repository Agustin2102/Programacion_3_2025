/**
 * PÁGINA: Detalle de Lista de Lectura
 * 
 * Muestra los libros de una lista específica
 * Permite agregar y quitar libros de la lista
 */

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

// TIPOS
interface ReadingList {
    _id: string;
    userId: string;
    name: string;
    description?: string;
    books: string[];
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Book {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        imageLinks?: {
            thumbnail?: string;
        };
        publishedDate?: string;
        description?: string;
    };
}

const ReadingListDetailPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const listId = params.listId as string;

    const [list, setList] = useState<ReadingList | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [removing, setRemoving] = useState<string | null>(null);

    // Cargar lista
    const loadList = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`/api/reading-lists/${listId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data: ReadingList = await response.json();
                setList(data);
                if (data.books && data.books.length > 0) {
                    await loadBooks(data.books);
                }
            } else if (response.status === 401) {
                router.push('/login');
            } else {
                setError('Lista no encontrada');
            }
        } catch (error) {
            console.error('Error al cargar lista:', error);
            setError('Error al cargar la lista');
        } finally {
            setLoading(false);
        }
    };

    // Cargar detalles de los libros
    const loadBooks = async (bookIds: string[]) => {
        try {
            const bookPromises = bookIds.map(async (bookId) => {
                try {
                    const response = await fetch(
                        `https://www.googleapis.com/books/v1/volumes/${bookId}`
                    );
                    if (response.ok) {
                        return await response.json();
                    }
                    return null;
                } catch (error) {
                    console.error(`Error al cargar libro ${bookId}:`, error);
                    return null;
                }
            });

            const bookResults = await Promise.all(bookPromises);
            const validBooks = bookResults.filter((book) => book !== null);
            setBooks(validBooks);
        } catch (error) {
            console.error('Error al cargar libros:', error);
        }
    };

    // Quitar libro de la lista
    const handleRemoveBook = async (bookId: string) => {
        if (!list) return;

        try {
            setRemoving(bookId);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/reading-lists/${listId}/books?bookId=${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Actualizar estado local
                setBooks(books.filter((book) => book.id !== bookId));
                setList({
                    ...list,
                    books: list.books.filter((id) => id !== bookId),
                });
                alert('Libro quitado de la lista');
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Error al quitar libro');
            }
        } catch (error) {
            console.error('Error al quitar libro:', error);
            alert('Error al quitar libro. Inténtalo de nuevo.');
        } finally {
            setRemoving(null);
        }
    };

    // Cargar al montar
    useEffect(() => {
        if (listId) {
            loadList();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listId]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link
                                href="/reading-lists"
                                className="text-blue-600 hover:text-blue-700 mb-2 inline-flex items-center"
                            >
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Volver a Listas
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900 mt-2">
                                📚 {list?.name || 'Cargando...'}
                            </h1>
                            {list?.description && (
                                <p className="text-gray-600 mt-2">{list.description}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-2">
                                {list ? `${list.books.length} libro${list.books.length !== 1 ? 's' : ''}` : ''}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando lista...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 text-lg">{error}</p>
                        <Link
                            href="/reading-lists"
                            className="mt-4 inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Volver a Listas
                        </Link>
                    </div>
                ) : books.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Esta lista está vacía
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Agrega libros a esta lista desde la página de detalles de cualquier libro
                        </p>
                        <Link
                            href="/"
                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                            Buscar Libros
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {books.map((book) => (
                            <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                {/* Imagen del libro */}
                                <div className="h-48 bg-gray-200 flex items-center justify-center">
                                    {book.volumeInfo.imageLinks?.thumbnail ? (
                                        <img
                                            src={book.volumeInfo.imageLinks.thumbnail}
                                            alt={book.volumeInfo.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-gray-400 text-center">
                                            <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                            </svg>
                                            <p className="text-sm">Sin imagen</p>
                                        </div>
                                    )}
                                </div>

                                {/* Información del libro */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {book.volumeInfo.title}
                                    </h3>

                                    {book.volumeInfo.authors && (
                                        <p className="text-sm text-gray-600 mb-2">
                                            {book.volumeInfo.authors.join(', ')}
                                        </p>
                                    )}

                                    {book.volumeInfo.publishedDate && (
                                        <p className="text-xs text-gray-500 mb-3">
                                            {book.volumeInfo.publishedDate}
                                        </p>
                                    )}

                                    {/* Botones de acción */}
                                    <div className="flex space-x-2">
                                        <Link
                                            href={`/book/${book.id}`}
                                            className="flex-1 text-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                        >
                                            Ver Detalles
                                        </Link>

                                        <button
                                            onClick={() => handleRemoveBook(book.id)}
                                            disabled={removing === book.id}
                                            className={`
                        px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${removing === book.id
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-red-500 text-white hover:bg-red-600'
                                                }
                      `}
                                        >
                                            {removing === book.id ? '...' : 'Quitar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReadingListDetailPage;
