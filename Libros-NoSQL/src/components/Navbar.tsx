/**
 * COMPONENTE: Navbar
 * Barra de navegación con autenticación
 */

"use client";

import React from 'react';
import Link from 'next/link';
import { useAuthContext } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuthContext();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Título */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">📚</span>
            <h1 className="text-xl font-bold text-gray-900">
              Reseñas de Libros
            </h1>
          </Link>

          {/* Menú de navegación */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              // Estado de carga
              <div className="animate-pulse">
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
              </div>
            ) : isAuthenticated && user ? (
              // Usuario autenticado
              <div className="flex items-center space-x-4">
                {/* Links de navegación */}
                <Link
                  href="/favorites"
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                  title="Mis Favoritos"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden md:inline">Favoritos</span>
                </Link>

                <Link
                  href="/reading-lists"
                  className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors"
                  title="Mis Listas"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="hidden md:inline">Listas</span>
                </Link>

                <span className="text-gray-700">
                  Hola, <span className="font-medium">{user.name}</span>
                </span>
                <Link
                  href="/profile"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              // Usuario no autenticado
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;