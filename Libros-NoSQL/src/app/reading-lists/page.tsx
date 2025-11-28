/**
 * PÁGINA: Listas de Lectura
 * 
 * PROPÓSITO:
 * Página principal para gestionar las listas de lectura del usuario.
 * Permite ver, crear, editar y eliminar listas de lectura.
 * 
 * FUNCIONALIDADES:
 * - Mostrar todas las listas del usuario
 * - Crear nuevas listas
 * - Ver libros en cada lista
 * - Navegar a favoritos
 * - Estados de carga y error
 */

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// DEFINICIÓN DE TIPOS
interface ReadingList {
  _id: string;
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
  };
}

const ReadingListsPage: React.FC = () => {
  const router = useRouter();
  
  // ESTADOS DEL COMPONENTE
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>('');
  const [newListDescription, setNewListDescription] = useState<string>('');
  const [creatingList, setCreatingList] = useState<boolean>(false);

  // TEMPORAL: ID de usuario hardcodeado
  const userId = 'user-123';

  /**
   * Carga todas las listas de lectura del usuario
   */
  const loadReadingLists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/reading-lists?userId=${encodeURIComponent(userId)}`);
      
      if (response.ok) {
        const data: ReadingList[] = await response.json();
        setLists(data);
      } else {
        setError('Error al cargar las listas de lectura');
      }
    } catch (error) {
      console.error('Error al cargar listas:', error);
      setError('Error al cargar las listas de lectura');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crea una nueva lista de lectura
   */
  const handleCreateList = async () => {
    if (!newListName.trim()) {
      alert('El nombre de la lista es requerido');
      return;
    }

    try {
      setCreatingList(true);
      
      const response = await fetch('/api/reading-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          name: newListName.trim(),
          description: newListDescription.trim() || undefined,
          isPublic: false,
        }),
      });

      if (response.ok) {
        const newList: ReadingList = await response.json();
        setLists([...lists, newList]);
        setNewListName('');
        setNewListDescription('');
        setShowCreateForm(false);
        alert('Lista creada exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al crear la lista');
      }
    } catch (error) {
      console.error('Error al crear lista:', error);
      alert('Error al crear la lista. Inténtalo de nuevo.');
    } finally {
      setCreatingList(false);
    }
  };

  // EFECTO: Cargar listas al montar el componente
  useEffect(() => {
    loadReadingLists();
  }, []);

  // RENDERIZADO PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                �� Mis Listas de Lectura
              </h1>
              <p className="text-gray-600 mt-2">
                Organiza tus libros en listas personalizadas
              </p>
            </div>
            
            {/* Botones de navegación */}
            <div className="flex space-x-3">
              <Link
                href="/favorites"
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>Favoritos</span>
              </Link>
              
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Inicio</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Botón para crear nueva lista */}
        <div className="mb-8">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Crear Nueva Lista</span>
            </button>
          ) : (
            /* Formulario de creación */
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Crear Nueva Lista de Lectura
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la lista:
                  </label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Ej: Para leer, Leyendo, Leídos..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={creatingList}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional):
                  </label>
                  <textarea
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Describe el propósito de esta lista..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={creatingList}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateList}
                    disabled={creatingList || !newListName.trim()}
                    className={`
                      px-6 py-2 rounded-md font-medium transition-colors
                      ${creatingList || !newListName.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                      }
                    `}
                  >
                    {creatingList ? 'Creando...' : 'Crear Lista'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewListName('');
                      setNewListDescription('');
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    disabled={creatingList}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de listas de lectura */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando listas de lectura...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
            <button 
              onClick={loadReadingLists}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Reintentar
            </button>
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes listas de lectura
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primera lista para organizar tus libros
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Crear Primera Lista
            </button>
          </div>
        ) : (
          /* Grid de listas */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div key={list._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {list.name}
                    </h3>
                    {list.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {list.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {list.books.length} libro{list.books.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${list.isPublic 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {list.isPublic ? 'Pública' : 'Privada'}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/reading-lists/${list._id}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Ver Libros
                  </Link>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Creada: {new Date(list.createdAt).toLocaleDateString('es-ES')}
                  </p>
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