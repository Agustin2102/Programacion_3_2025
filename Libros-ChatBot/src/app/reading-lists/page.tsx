"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CustomReadingList {
  _id: string;
  name: string;
  description: string | null;
  books: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BookInfo {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
}

const ReadingListsPage: React.FC = () => {
  const router = useRouter();
  const [lists, setLists] = useState<CustomReadingList[]>([]);
  const [booksInfo, setBooksInfo] = useState<Map<string, BookInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/reading-lists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: CustomReadingList[] = await response.json();
        setLists(data);
        
        // Obtener información de todos los libros
        const allBookIds = new Set<string>();
        data.forEach(list => {
          list.books.forEach(bookId => allBookIds.add(bookId));
        });

        await loadBooksInfo(Array.from(allBookIds));
      } else if (response.status === 401) {
        router.push('/login');
      } else {
        setError('Error al cargar las listas');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar las listas');
    } finally {
      setLoading(false);
    }
  };

  const loadBooksInfo = async (bookIds: string[]) => {
    const newBooksInfo = new Map<string, BookInfo>();
    
    await Promise.all(
      bookIds.map(async (bookId) => {
        try {
          const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${bookId}`
          );
          
          if (response.ok) {
            const data = await response.json();
            newBooksInfo.set(bookId, {
              id: data.id,
              title: data.volumeInfo?.title || 'Sin título',
              authors: data.volumeInfo?.authors || [],
              thumbnail: data.volumeInfo?.imageLinks?.thumbnail || 
                         data.volumeInfo?.imageLinks?.smallThumbnail || ''
            });
          }
        } catch (error) {
          console.error(`Error loading book ${bookId}:`, error);
        }
      })
    );

    setBooksInfo(newBooksInfo);
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newListName.trim()) {
      alert('El nombre de la lista es requerido');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/reading-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newListName,
          description: newListDescription
        })
      });

      if (response.ok) {
        setNewListName('');
        setNewListDescription('');
        setShowCreateForm(false);
        await loadLists();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al crear la lista');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear la lista');
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta lista?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/reading-lists/${listId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadLists();
      } else {
        alert('Error al eliminar la lista');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la lista');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando listas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-red-600 text-center">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-xl font-semibold">Error</h2>
            <p className="mt-2">{error}</p>
            <button
              onClick={loadLists}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Listas de Lectura</h1>
              <p className="text-gray-600 mt-2">Organiza tus libros en listas personalizadas</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/chat"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Volver al Chat
              </Link>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                {showCreateForm ? 'Cancelar' : '+ Nueva Lista'}
              </button>
            </div>
          </div>

          {/* Formulario de crear lista */}
          {showCreateForm && (
            <form onSubmit={handleCreateList} className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la lista *
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: Quiero leer, Favoritos, Para el verano..."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe el propósito de esta lista..."
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Crear Lista
              </button>
            </form>
          )}
        </div>

        {/* Listas */}
        {lists.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">No tienes listas todavía</h2>
            <p className="mt-2 text-gray-600">Crea tu primera lista para organizar tus libros</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Crear Primera Lista
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div key={list._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{list.name}</h3>
                      {list.description && (
                        <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteList(list._id)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar lista"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {list.books.length} {list.books.length === 1 ? 'libro' : 'libros'}
                  </div>

                  {list.books.length > 0 && (
                    <div className="space-y-3">
                      {list.books.slice(0, 3).map((bookId) => {
                        const book = booksInfo.get(bookId);
                        if (!book) return null;

                        return (
                          <Link
                            key={bookId}
                            href={`/book/${bookId}`}
                            className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition"
                          >
                            {book.thumbnail && (
                              <img
                                src={book.thumbnail}
                                alt={book.title}
                                className="w-12 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {book.title}
                              </p>
                              {book.authors && book.authors.length > 0 && (
                                <p className="text-xs text-gray-600 truncate">
                                  {book.authors.join(', ')}
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                      {list.books.length > 3 && (
                        <Link
                          href={`/reading-lists/${list._id}`}
                          className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Ver {list.books.length - 3} más...
                        </Link>
                      )}
                    </div>
                  )}

                  {list.books.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Lista vacía. Agrega libros desde el chat.
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-3">
                  <Link
                    href={`/reading-lists/${list._id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Ver detalles →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingListsPage;
