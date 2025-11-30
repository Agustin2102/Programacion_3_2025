/**
 * PÁGINA: Perfil de Usuario
 * Página con información del usuario y sus reseñas
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

interface UserReview {
  _id: string;
  bookId: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { user, token, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Cargar reseñas del usuario
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!token) {
        setIsLoadingReviews(false);
        return;
      }

      if (!isAuthenticated) {
        setIsLoadingReviews(false);
        return;
      }

      try {
        setIsLoadingReviews(true);
        
        const response = await fetch('/api/user/reviews', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
          console.error('API Error Response:', errorData);
          throw new Error(errorData.error || 'Error al cargar las reseñas');
        }

        const data = await response.json();
        setUserReviews(data.reviews || []);
      } catch (error) {
        console.error('Error cargando reseñas:', error);
        // En lugar de mostrar el error en la consola, vamos a manejarlo silenciosamente por ahora
        setUserReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    // Solo hacer fetch si el usuario está completamente autenticado
    if (isAuthenticated && token && user) {
      fetchUserReviews();
    } else {
      setIsLoadingReviews(false);
    }
  }, [token, isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Se redirecciona en useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                Miembro desde: {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userReviews.length}</div>
              <div className="text-sm text-gray-600">Reseñas escritas</div>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-700 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </Link>
        </div>

        {/* Reseñas del usuario */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Mis Reseñas</h2>
          </div>

          {isLoadingReviews ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando reseñas...</p>
            </div>
          ) : userReviews.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-lg font-medium mb-2">Aún no has escrito ninguna reseña</p>
              <p className="mb-4">Explora libros y comparte tus opiniones con la comunidad</p>
              <Link 
                href="/" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Explorar libros
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {userReviews.map((review) => (
                <div key={review._id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">Libro ID: {review.bookId}</h3>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{review.reviewText}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
