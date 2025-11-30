'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';

interface Review {
  _id: string;
  bookId: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  upvotes: number;
  downvotes: number;
  userVotes: { [key: string]: 'up' | 'down' };
  createdAt: string;
}

interface ReviewListProps {
  bookId: string;
}

export default function ReviewList({ bookId }: ReviewListProps) {
  const { user, token } = useAuthContext();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'votes'>('newest');

  // Cargar reseñas
  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?bookId=${bookId}`);
      if (!response.ok) {
        throw new Error('Error al cargar las reseñas');
      }
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [bookId]);

  // Manejar votación
  const handleVote = async (reviewId: string, voteType: 'up' | 'down') => {
    if (!user) {
      alert('Debes iniciar sesión para votar');
      return;
    }

    try {
      const response = await fetch('/api/reviews/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reviewId,
          voteType
        })
      });

      if (!response.ok) {
        throw new Error('Error al procesar el voto');
      }

      const updatedReview = await response.json();
      
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === reviewId ? updatedReview : review
        )
      );
    } catch (error) {
      console.error('Error al votar:', error);
      alert('Error al procesar el voto');
    }
  };

  // Iniciar edición
  const startEdit = (review: Review) => {
    setEditingReview(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingReview(null);
    setEditRating(5);
    setEditComment('');
  };

  // Guardar edición
  const saveEdit = async (reviewId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para editar');
      return;
    }

    if (!editComment.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }

    try {
      const response = await fetch(`/api/reviews`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reviewId,
          rating: editRating,
          comment: editComment.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la reseña');
      }

      const updatedReview = await response.json();
      
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === reviewId ? updatedReview : review
        )
      );

      setEditingReview(null);
      setEditRating(5);
      setEditComment('');
    } catch (error) {
      console.error('Error al editar reseña:', error);
      alert('Error al actualizar la reseña');
    }
  };

  // Eliminar reseña
  const deleteReview = async (reviewId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para eliminar');
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reviewId })
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la reseña');
      }

      setReviews(prevReviews => 
        prevReviews.filter(review => review._id !== reviewId)
      );
    } catch (error) {
      console.error('Error al eliminar reseña:', error);
      alert('Error al eliminar la reseña');
    }
  };

  // Ordenar reseñas
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'votes':
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      default:
        return 0;
    }
  });

  // Renderizar estrellas
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando reseñas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>Error: {error}</p>
        <button 
          onClick={loadReviews}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles de ordenación */}
      <div className="flex items-center gap-4 mb-6">
        <label htmlFor="sort" className="font-medium">
          Ordenar por:
        </label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="rating">Mayor puntuación</option>
          <option value="votes">Más votados</option>
        </select>
      </div>

      {/* Lista de reseñas */}
      {sortedReviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay reseñas para este libro aún.</p>
          <p>¡Sé el primero en escribir una reseña!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <div key={review._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{review.username}</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-gray-600">({review.rating}/5)</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Botones de acción para el propietario */}
                {user && user.id === review.userId && (
                  <div className="flex gap-2">
                    {editingReview === review._id ? (
                      <>
                        <button
                          onClick={() => saveEdit(review._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(review)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteReview(review._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Contenido de la reseña */}
              {editingReview === review._id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Puntuación:
                    </label>
                    <select
                      value={editRating}
                      onChange={(e) => setEditRating(Number(e.target.value))}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num} estrella{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comentario:
                    </label>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Escribe tu reseña..."
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 mb-4">{review.comment}</p>
              )}

              {/* Sistema de votación */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleVote(review._id, 'up')}
                    disabled={!user}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                      user && review.userVotes?.[user.id] === 'up'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    ▲ {review.upvotes}
                  </button>
                  <button
                    onClick={() => handleVote(review._id, 'down')}
                    disabled={!user}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                      user && review.userVotes?.[user.id] === 'down'
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    ▼ {review.downvotes}
                  </button>
                </div>
                
                <div className="text-sm text-gray-500">
                  Puntuación neta: {review.upvotes - review.downvotes}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
