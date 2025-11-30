/**
 * COMPONENTE: FavoriteButton
 * 
 * PROPÓSITO:
 * Botón interactivo para agregar/quitar libros de favoritos.
 * Muestra el estado actual (favorito o no) y permite alternar.
 * 
 * FUNCIONALIDADES:
 * - Verificar si un libro está en favoritos
 * - Agregar/quitar de favoritos con animación
 * - Estados de carga y error
 * - Persistencia en base de datos
 * 
 * PROPS RECIBIDAS:
 * - bookId: ID del libro (Google Books API)
 * - userId: ID del usuario (temporal, hasta implementar auth)
 * - className?: Clases CSS adicionales (opcional)
 */

"use client"; // Este componente se ejecuta en el navegador

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

// DEFINICIÓN DE TIPOS
interface FavoriteButtonProps {
  bookId: string; // ID del libro desde Google Books API
  userId: string; // ID del usuario autenticado (mantenido para compatibilidad pero usar token de useAuth)
  className?: string; // Clases CSS adicionales
}

interface FavoriteStatus {
  isFavorite: boolean; // Si el libro está en favoritos
  favoriteId: string | null; // ID del favorito en la base de datos
}

/**
 * Componente principal del botón de favoritos
 * 
 * @param {FavoriteButtonProps} props - Props del componente
 * @returns {JSX.Element} Botón de favoritos interactivo
 */
const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  bookId, 
  userId, 
  className = "" 
}) => {
  
  // OBTENER TOKEN DE AUTENTICACIÓN
  const { token } = useAuth();
  
  // ESTADOS DEL COMPONENTE
  const [isFavorite, setIsFavorite] = useState<boolean>(false); // Estado actual del favorito
  const [loading, setLoading] = useState<boolean>(false); // Estado de carga
  const [checking, setChecking] = useState<boolean>(true); // Estado de verificación inicial

  /**
   * Verifica si el libro está en favoritos del usuario
   * Se ejecuta al montar el componente
   */
  const checkFavoriteStatus = async () => {
    if (!token) {
      setChecking(false);
      return;
    }

    try {
      setChecking(true); // Activar indicador de verificación
      
      // PETICIÓN: Verificar estado del favorito
      const response = await fetch(
        `/api/favorites/check?bookId=${encodeURIComponent(bookId)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data: FavoriteStatus = await response.json();
        setIsFavorite(data.isFavorite); // Actualizar estado local
      } else {
        console.error('Error al verificar favorito:', response.status);
      }
    } catch (error) {
      console.error('Error al verificar favorito:', error);
    } finally {
      setChecking(false); // Desactivar indicador de verificación
    }
  };

  /**
   * Maneja el toggle del favorito (agregar/quitar)
   * Envía la acción al backend y actualiza el estado local
   */
  const handleToggleFavorite = async () => {
    if (!token) {
      alert('Debes iniciar sesión para agregar favoritos');
      return;
    }

    try {
      setLoading(true); // Activar indicador de carga
      
      const action = isFavorite ? 'remove' : 'add'; // Determinar acción
      
      // PETICIÓN: Enviar acción al backend
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId,
          action,
        }),
      });

      if (response.ok) {
        // ACTUALIZACIÓN: Cambiar estado local
        setIsFavorite(!isFavorite);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al actualizar favorito');
      }
    } catch (error) {
      console.error('Error al manejar favorito:', error);
      alert('Error al actualizar favorito. Inténtalo de nuevo.');
    } finally {
      setLoading(false); // Desactivar indicador de carga
    }
  };

  // EFECTO: Verificar estado del favorito al montar el componente
  useEffect(() => {
    if (userId && bookId && token) {
      checkFavoriteStatus();
    }
  }, [userId, bookId, token]);

  // RENDERIZADO CONDICIONAL
  // Mostrar spinner mientras se verifica el estado inicial
  if (checking) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  // RENDERIZADO PRINCIPAL
  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading} // Deshabilitar durante la carga
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
        ${isFavorite 
          ? 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-300' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {/* ICONO: Corazón que cambia según el estado */}
      <svg 
        className={`w-5 h-5 transition-transform duration-200 ${loading ? 'animate-pulse' : ''}`}
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      
      {/* TEXTO: Cambia según el estado */}
      <span className="text-sm font-medium">
        {loading 
          ? (isFavorite ? 'Quitando...' : 'Agregando...') 
          : (isFavorite ? 'En favoritos' : 'Agregar a favoritos')
        }
      </span>
    </button>
  );
};

export default FavoriteButton;