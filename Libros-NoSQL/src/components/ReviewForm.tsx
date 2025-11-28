/**
 * COMPONENTE: ReviewForm
 * 
 * PROPÓSITO:
 * Formulario interactivo para que los usuarios escriban reseñas de libros.
 * Incluye sistema de calificación con estrellas, validación y envío a la base de datos.
 * 
 * FUNCIONALIDADES:
 * - Sistema de calificación con 5 estrellas interactivas
 * - Campo de texto para la reseña con contador de caracteres
 * - Campo obligatorio para nombre del usuario
 * - Validación de formulario completa
 * - Envío a API backend (/api/reviews)
 * - Estados de carga y manejo de errores
 * - Limpieza automática del formulario tras envío exitoso
 * 
 * PROPS RECIBIDAS:
 * - bookId: ID único del libro para asociar la reseña
 * - bookData: Información del libro para guardar en base de datos
 * - onReviewAdded: Callback para actualizar lista de reseñas
 */

"use client"; // Este componente se ejecuta en el navegador

import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import Link from 'next/link';


// DEFINICIÓN DE TIPOS
// Estas interfaces definen la estructura de datos que recibe el componente

/**
 * Estructura de datos del libro para guardar en base de datos
 */
interface BookData {
  title: string; // Título del libro
  authors?: string[]; // Array de autores (opcional)
  publisher?: string; // Editorial
  publishedDate?: string; // Fecha de publicación
  description?: string; // Descripción del libro
  imageUrl?: string; // URL de la imagen de portada
  pageCount?: number; // Número de páginas
  categories?: string[]; // Categorías o géneros
  language?: string; // Idioma del libro
  previewLink?: string; // Enlace para vista previa
  infoLink?: string; // Enlace de información adicional
}

/**
 * Props que recibe este componente
 */
interface ReviewFormProps {
  bookId: string; // ID único del libro (requerido)
  bookData?: BookData; // Datos del libro para guardar (opcional)
  onReviewAdded?: () => void; // Callback cuando se agrega una reseña (opcional)
}

/**
 * Componente principal del formulario de reseñas
 * 
 * @param {ReviewFormProps} props - Props del componente
 * @returns {JSX.Element} Formulario completo de reseña
 */
const ReviewForm: React.FC<ReviewFormProps> = ({ bookId, bookData, onReviewAdded }) => {
  
  // HOOK DE AUTENTICACIÓN
  const { user, isAuthenticated } = useAuthContext();
  
  // ESTADOS DEL FORMULARIO
  // Estos estados manejan toda la información del formulario
  
  const [rating, setRating] = useState(0); // Calificación seleccionada (1-5)
  const [hoverRating, setHoverRating] = useState(0); // Calificación temporal al hacer hover
  const [reviewText, setReviewText] = useState(''); // Texto de la reseña
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de carga del envío

  /**
   * Maneja el envío del formulario
   * Valida los datos, los envía al backend y maneja la respuesta
   * 
   * @param {React.FormEvent} e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevenir recarga de página
    
    // VERIFICAR AUTENTICACIÓN
    if (!isAuthenticated || !user) {
      alert('Debes iniciar sesión para escribir reseñas');
      return;
    }
    
    // VALIDACIÓN: Verificar que todos los campos estén completos
    if (rating === 0 || reviewText.trim() === '') {
      alert('Por favor completa todos los campos y selecciona una calificación');
      return;
    }

    setIsSubmitting(true); // Iniciar estado de carga

    try {
      const token = localStorage.getItem('token');
      
      // ENVÍO: Hacer petición POST a la API
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Agregar token de autenticación
        },
        body: JSON.stringify({
          bookId, // ID del libro
          rating, // Calificación con estrellas
          reviewText: reviewText.trim(), // Texto de la reseña (sin espacios extra)
          bookData, // Datos del libro para guardar si no existe
          // userName se obtiene automáticamente del token en el backend
        }),
      });

      // MANEJO DE ERRORES: Verificar si la respuesta fue exitosa
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar la reseña');
      }

      const newReview = await response.json(); // Respuesta exitosa del servidor

      // LIMPIEZA: Resetear el formulario después del envío exitoso
      setRating(0);
      setReviewText('');
      
      alert('¡Reseña agregada exitosamente!');
      
      // CALLBACK: Notificar al componente padre que se agregó una reseña
      if (onReviewAdded) {
        onReviewAdded(); // Esto actualiza la lista de reseñas en el componente padre
      }
      
    } catch (error) {
      // MANEJO DE ERRORES: Mostrar mensaje de error al usuario
      console.error('Error al agregar la reseña:', error);
      alert(error instanceof Error ? error.message : 'Error al agregar la reseña. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false); // Finalizar estado de carga
    }
  };

  // RENDERIZADO DEL FORMULARIO
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* TÍTULO DEL FORMULARIO */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Escribir una reseña</h2>
      
      {/* VERIFICACIÓN DE AUTENTICACIÓN */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            Debes <Link href="/login" className="text-blue-600 underline hover:text-blue-700">iniciar sesión</Link> para escribir reseñas.
          </p>
        </div>
      )}

      {isAuthenticated && user && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            Escribiendo como: <span className="font-medium">{user.name}</span>
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* CAMPO: SISTEMA DE CALIFICACIÓN CON ESTRELLAS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calificación
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)} // Establecer calificación al hacer clic
                onMouseEnter={() => setHoverRating(star)} // Mostrar preview al hacer hover
                onMouseLeave={() => setHoverRating(0)} // Quitar preview al salir del hover
                disabled={!isAuthenticated} // Deshabilitar si no está autenticado
                aria-label={`${star} estrella${star > 1 ? 's' : ''}`} // Etiqueta accesible para tests
                className={`text-3xl focus:outline-none transition-colors duration-150 ${
                  !isAuthenticated ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
              >
                <svg
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-current' // Estrella llena (amarilla)
                      : 'text-gray-300' // Estrella vacía (gris)
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </button>
            ))}
          </div>
          {/* INDICADOR: Mostrar calificación actual */}
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {rating} de 5 estrellas
            </p>
          )}
        </div>

        {/* CAMPO: TEXTO DE LA RESEÑA */}
        <div>
          <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">
            Tu reseña
          </label>
          <textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)} // Actualizar texto en tiempo real
            rows={5}
            disabled={!isAuthenticated} // Deshabilitar si no está autenticado
            className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
              !isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            }`}
            placeholder={isAuthenticated ? "Comparte tu opinión sobre este libro..." : "Inicia sesión para escribir reseñas"}
            required
          />
          {/* CONTADOR: Mostrar número de caracteres */}
          <p className="text-sm text-gray-500 mt-1">
            {reviewText.length}/500 caracteres
          </p>
        </div>

        {/* BOTÓN DE ENVÍO */}
        <button
          type="submit"
          // DESHABILITADO: Si está enviando, no autenticado o faltan datos
          disabled={isSubmitting || !isAuthenticated || rating === 0 || reviewText.trim() === ''}
          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
            !isAuthenticated || isSubmitting || rating === 0 || reviewText.trim() === ''
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {/* TEXTO DINÁMICO: Cambiar según estado */}
          {!isAuthenticated 
            ? 'Inicia sesión para reseñar' 
            : isSubmitting 
              ? 'Enviando...' 
              : 'Publicar reseña'
          }
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
