/**
 * COMPONENTE: ReadingListSelector
 * 
 * PROPÓSITO:
 * Selector desplegable para agregar libros a listas de lectura existentes
 * o crear nuevas listas. Permite gestión completa de listas de lectura.
 * 
 * FUNCIONALIDADES:
 * - Mostrar listas existentes del usuario
 * - Agregar libro a lista existente
 * - Crear nueva lista de lectura
 * - Estados de carga y error
 * - Validaciones de entrada
 * 
 * PROPS RECIBIDAS:
 * - bookId: ID del libro a agregar
 * - userId: ID del usuario
 * - onSuccess?: Callback cuando se agrega exitosamente
 */

"use client";

import React, { useState, useEffect } from 'react';

// DEFINICIÓN DE TIPOS
interface ReadingList {
  _id: string; // ID de la lista en MongoDB
  name: string; // Nombre de la lista
  description?: string; // Descripción opcional
  books: string[]; // Array de IDs de libros
  isPublic: boolean; // Si es pública o privada
  createdAt: string; // Fecha de creación
  updatedAt: string; // Fecha de actualización
}

interface ReadingListSelectorProps {
  bookId: string; // ID del libro a agregar
  userId: string; // ID del usuario
  onSuccess?: () => void; // Callback de éxito (opcional)
}

/**
 * Componente principal del selector de listas
 * 
 * @param {ReadingListSelectorProps} props - Props del componente
 * @returns {JSX.Element} Selector de listas de lectura
 */
const ReadingListSelector: React.FC<ReadingListSelectorProps> = ({ 
  bookId, 
  userId, 
  onSuccess 
}) => {
  
  // ESTADOS DEL COMPONENTE
  const [lists, setLists] = useState<ReadingList[]>([]); // Listas del usuario
  const [selectedListId, setSelectedListId] = useState<string>(''); // Lista seleccionada
  const [loading, setLoading] = useState<boolean>(false); // Estado de carga
  const [loadingLists, setLoadingLists] = useState<boolean>(true); // Carga de listas
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false); // Mostrar formulario de creación
  const [newListName, setNewListName] = useState<string>(''); // Nombre de nueva lista
  const [newListDescription, setNewListDescription] = useState<string>(''); // Descripción de nueva lista
  const [creatingList, setCreatingList] = useState<boolean>(false); // Estado de creación

  /**
   * Carga las listas de lectura del usuario
   * Se ejecuta al montar el componente
   */
  const loadReadingLists = async () => {
    try {
      setLoadingLists(true); // Activar indicador de carga
      
      // PETICIÓN: Obtener listas del usuario
      const response = await fetch(`/api/reading-lists?userId=${encodeURIComponent(userId)}`);
      
      if (response.ok) {
        const data: ReadingList[] = await response.json();
        setLists(data); // Actualizar estado con las listas
      } else {
        console.error('Error al cargar listas de lectura');
      }
    } catch (error) {
      console.error('Error al cargar listas:', error);
    } finally {
      setLoadingLists(false); // Desactivar indicador de carga
    }
  };

  /**
   * Crea una nueva lista de lectura
   * Valida el nombre y crea la lista en el backend
   */
  const handleCreateList = async () => {
    if (!newListName.trim()) {
      alert('El nombre de la lista es requerido');
      return;
    }

    try {
      setCreatingList(true); // Activar indicador de creación
      
      // PETICIÓN: Crear nueva lista
      const response = await fetch('/api/reading-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          name: newListName.trim(),
          description: newListDescription.trim() || undefined,
          isPublic: false, // Por defecto privada
        }),
      });

      if (response.ok) {
        const newList: ReadingList = await response.json();
        setLists([...lists, newList]); // Agregar nueva lista al estado
        setSelectedListId(newList._id); // Seleccionar la nueva lista
        setNewListName(''); // Limpiar formulario
        setNewListDescription('');
        setShowCreateForm(false); // Ocultar formulario
        alert('Lista creada exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al crear la lista');
      }
    } catch (error) {
      console.error('Error al crear lista:', error);
      alert('Error al crear la lista. Inténtalo de nuevo.');
    } finally {
      setCreatingList(false); // Desactivar indicador de creación
    }
  };

  /**
   * Agrega el libro a la lista seleccionada
   * Envía la petición al backend y actualiza la UI
   */
  const handleAddToList = async () => {
    if (!selectedListId) {
      alert('Selecciona una lista');
      return;
    }

    try {
      setLoading(true); // Activar indicador de carga
      
      // PETICIÓN: Agregar libro a la lista
      const response = await fetch(`/api/reading-lists/${selectedListId}/books`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          action: 'add',
        }),
      });

      if (response.ok) {
        alert('Libro agregado a la lista exitosamente');
        setSelectedListId(''); // Limpiar selección
        onSuccess?.(); // Ejecutar callback de éxito si existe
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al agregar el libro');
      }
    } catch (error) {
      console.error('Error al agregar libro:', error);
      alert('Error al agregar el libro. Inténtalo de nuevo.');
    } finally {
      setLoading(false); // Desactivar indicador de carga
    }
  };

  // EFECTO: Cargar listas al montar el componente
  useEffect(() => {
    if (userId) {
      loadReadingLists();
    }
  }, [userId]);

  // RENDERIZADO PRINCIPAL
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Agregar a Lista de Lectura
      </h3>

      {/* SELECTOR DE LISTAS EXISTENTES */}
      <div className="space-y-4">
        {/* SELECTOR: Lista desplegable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar lista existente:
          </label>
          
          {loadingLists ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">Cargando listas...</span>
            </div>
          ) : (
            <select
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una lista...</option>
              {lists.map((list) => (
                <option key={list._id} value={list._id}>
                  {list.name} ({list.books.length} libros)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* BOTÓN: Agregar a lista seleccionada */}
        <button
          onClick={handleAddToList}
          disabled={loading || !selectedListId}
          className={`
            w-full px-4 py-2 rounded-md font-medium transition-colors
            ${loading || !selectedListId
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
            }
          `}
        >
          {loading ? 'Agregando...' : 'Agregar a Lista'}
        </button>

        {/* SEPARADOR */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O</span>
          </div>
        </div>

        {/* FORMULARIO: Crear nueva lista */}
        {showCreateForm ? (
          <div className="space-y-3 p-4 bg-gray-50 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la lista:
              </label>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Ej: Para leer, Leyendo, Leídos..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={creatingList}
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleCreateList}
                disabled={creatingList || !newListName.trim()}
                className={`
                  flex-1 px-4 py-2 rounded-md font-medium transition-colors
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
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={creatingList}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          /* BOTÓN: Mostrar formulario de creación */
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Crear Nueva Lista
          </button>
        )}
      </div>
    </div>
  );
};

export default ReadingListSelector;