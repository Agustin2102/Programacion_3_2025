/**
 * COMPONENTE: ReviewList
 * 
 * PROPÓSITO:
 * Muestra y gestiona todas las reseñas de un libro específico.
 * Incluye funcionalidades de ordenamiento, votación y carga dinámica.
 * 
 * FUNCIONALIDADES:
 * - Carga automática de reseñas desde la base de datos
 * - Sistema de ordenamiento (recientes, antiguas, calificación, utilidad)
 * - Sistema de votación positiva/negativa para cada reseña
 * - Estados de carga, error y sin datos
 * - Formato de fechas legible
 * - Cálculo de puntuación de utilidad
 * - Recarga automática tras votar
 * 
 * PROPS RECIBIDAS:
 * - bookId: ID único del libro para filtrar reseñas
 */

"use client"; // Este componente se ejecuta en el navegador

import React, { useState, useEffect } from 'react';

// DEFINICIÓN DE TIPOS
// Estas interfaces definen la estructura de datos de las reseñas

/**
 * Estructura de una reseña individual
 * Basada en el modelo de base de datos Prisma
 */
interface Review {
  id: string; // ID único de la reseña
  bookId: string; // ID del libro asociado
  userName: string; // Nombre del usuario que escribió la reseña
  rating: number; // Calificación con estrellas (1-5)
  reviewText: string; // Texto completo de la reseña
  createdAt: string; // Fecha de creación (ISO string)
  updatedAt: string; // Fecha de última actualización (ISO string)
  upvotes: number; // Número de votos positivos
  downvotes: number; // Número de votos negativos
}

/**
 * Props que recibe este componente
 */
interface ReviewListProps {
  bookId: string; // ID único del libro para filtrar reseñas
}

/**
 * Componente principal que renderiza la lista de reseñas
 * 
 * @param {ReviewListProps} props - Props del componente
 * @returns {JSX.Element} Lista completa de reseñas con funcionalidades
 */
const ReviewList: React.FC<ReviewListProps> = ({ bookId }) => {
  
  // ESTADOS DEL COMPONENTE
  // Estos estados manejan toda la lógica del componente
  
  const [reviews, setReviews] = useState<Review[]>([]); // Array de reseñas
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'helpful'>('newest'); // Criterio de ordenamiento
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado de error

  /**
   * Carga las reseñas desde la API del backend
   * Se ejecuta automáticamente al montar el componente y al cambiar bookId
   */
  const loadReviews = async () => {
    try {
      setLoading(true); // Activar indicador de carga
      setError(null); // Limpiar errores previos
      
      // PETICIÓN: Obtener reseñas filtradas por bookId
      const response = await fetch(`/api/reviews?bookId=${encodeURIComponent(bookId)}`);
      
      // VALIDACIÓN: Verificar que la respuesta sea exitosa
      if (!response.ok) {
        throw new Error('Error al cargar las reseñas');
      }
      
      const data = await response.json();
      setReviews(data); // Actualizar estado con las reseñas obtenidas
    } catch (error) {
      console.error('Error al cargar las reseñas:', error);
      setError('Error al cargar las reseñas');
    } finally {
      setLoading(false); // Desactivar indicador de carga
    }
  };

  // EFECTO: Cargar reseñas cuando cambia el bookId
  useEffect(() => {
    loadReviews();
  }, [bookId]);

  /**
   * Maneja el sistema de votación (upvote/downvote) para las reseñas
   * Envía el voto al backend y recarga las reseñas para obtener datos actualizados
   * 
   * @param {string} reviewId - ID de la reseña a votar
   * @param {'up' | 'down'} voteType - Tipo de voto (positivo o negativo)
   */
  const handleVote = async (reviewId: string, voteType: 'up' | 'down') => {
    try {
      // PETICIÓN: Enviar voto al backend
      const response = await fetch('/api/reviews/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          voteType: voteType.toUpperCase(), // Convertir a mayúsculas para el backend
        }),
      });

      // VALIDACIÓN: Verificar que el voto fue exitoso
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al votar');
      }

      // ACTUALIZACIÓN: Recargar las reseñas para obtener los votos actualizados
      loadReviews();
    } catch (error) {
      console.error('Error al votar:', error);
      alert(error instanceof Error ? error.message : 'Error al votar. Inténtalo de nuevo.');
    }
  };

  /**
   * Ordena las reseñas según el criterio seleccionado
   * 
   * @returns {Review[]} Array de reseñas ordenadas
   */
  const getSortedReviews = () => {
    const sortedReviews = [...reviews]; // Crear copia para no mutar el estado original
    
    switch (sortBy) {
      case 'newest':
        // Ordenar por fecha de creación (más recientes primero)
        return sortedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        // Ordenar por fecha de creación (más antiguas primero)
        return sortedReviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'rating':
        // Ordenar por calificación (mayor calificación primero)
        return sortedReviews.sort((a, b) => b.rating - a.rating);
      case 'helpful':
        // Ordenar por utilidad (diferencia entre upvotes y downvotes)
        return sortedReviews.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      default:
        return sortedReviews;
    }
  };

  /**
   * Formatea una fecha ISO string a formato legible en español
   * 
   * @param {string} dateString - Fecha en formato ISO
   * @returns {string} Fecha formateada en español
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ORDENAMIENTO: Obtener reseñas ordenadas según criterio seleccionado
  const sortedReviews = getSortedReviews();

  // RENDERIZADO PRINCIPAL
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* HEADER CON TÍTULO Y SELECTOR DE ORDENAMIENTO */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Reseñas ({reviews.length})
        </h2>
        
        {/* SELECTOR: Solo mostrar si hay reseñas */}
        {reviews.length > 0 && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguas</option>
            <option value="rating">Mejor calificadas</option>
            <option value="helpful">Más útiles</option>
          </select>
        )}
      </div>

      {/* ESTADOS CONDICIONALES */}
      
      {/* ESTADO: Cargando */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando reseñas...</p>
        </div>
      
      /* ESTADO: Error */
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={loadReviews}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      
      /* ESTADO: Sin reseñas */
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l1.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
          <p className="text-gray-500 text-lg">Aún no hay reseñas</p>
          <p className="text-gray-400 text-sm mt-2">¡Sé el primero en escribir una reseña!</p>
        </div>
      
      /* ESTADO: Lista de reseñas */
      ) : (
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              
              {/* HEADER DE LA RESEÑA */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  {/* NOMBRE DEL USUARIO */}
                  <h4 className="font-semibold text-lg text-gray-900">{review.userName}</h4>
                  {/* FECHA FORMATEADA */}
                  <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                </div>
                
                {/* SISTEMA DE ESTRELLAS */}
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </div>

              {/* TEXTO DE LA RESEÑA */}
              <p className="text-gray-700 leading-relaxed mb-4">{review.reviewText}</p>

              {/* SISTEMA DE VOTACIÓN */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  
                  {/* BOTÓN UPVOTE */}
                  <button
                    onClick={() => handleVote(review.id, 'up')}
                    className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>{review.upvotes}</span>
                  </button>
                  
                  {/* BOTÓN DOWNVOTE */}
                  <button
                    onClick={() => handleVote(review.id, 'down')}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.737 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2M17 4h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    <span>{review.downvotes}</span>
                  </button>
                </div>

                {/* PUNTUACIÓN NETA DE UTILIDAD */}
                <span className="text-sm text-gray-500">
                  {review.upvotes - review.downvotes > 0 ? '+' : ''}{review.upvotes - review.downvotes} útil
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;

  