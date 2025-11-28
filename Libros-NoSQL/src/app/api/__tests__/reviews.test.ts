/**
 * PRUEBAS UNITARIAS: Operaciones CRUD de Reviews
 * 
 * Estas pruebas verifican que las operaciones CRUD de reviews
 * funcionen correctamente con mocking de la base de datos.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock de la conexión a MongoDB
vi.mock('@/lib/mongoose', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}));

// Mock de las utilidades de autenticación - definir directamente en el mock
vi.mock('@/lib/auth-utils', () => ({
  extractTokenFromHeader: vi.fn(),
  validateToken: vi.fn(),
  requireAuth: vi.fn((handler) => handler) // Mock requireAuth para que devuelva el handler tal como está
}));

// Mock del modelo Review - definir las funciones aquí para evitar hoisting issues
vi.mock('@/models/Review', () => ({
  default: {
    find: vi.fn(() => ({
      sort: vi.fn(() => ({
        lean: vi.fn()
      }))
    })),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    updateOne: vi.fn()
  }
}));

// Mock del modelo Book
vi.mock('@/models/Book', () => ({
  default: {
    findById: vi.fn(),
    create: vi.fn()
  }
}));

// Importar las funciones a probar después de los mocks
import { GET, POST } from '@/app/api/reviews/route';
import { PUT, DELETE } from '@/app/api/reviews/[id]/route';
import Review from '@/models/Review';
import Book from '@/models/Book';
import * as authUtils from '@/lib/auth-utils';

// Obtener referencia al mock para usarlo en las pruebas
const mockReview = vi.mocked(Review);
const mockBook = vi.mocked(Book);
const mockAuthUtils = vi.mocked(authUtils);

describe('Reviews API - CRUD Operations', () => {
  const mockUser = {
    userId: 'user123',
    email: 'test@example.com',
    name: 'Test User'
  };

  const mockReviewData = {
    _id: 'review123',
    bookId: 'book123',
    userName: 'Test User',
    userId: 'user123',
    rating: 5,
    reviewText: 'Great book!',
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/reviews - Read Reviews', () => {
    it('should get reviews for a specific book', async () => {
      const mockReviews = [mockReviewData];
      const mockChain = {
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockReviews)
      };
      mockReview.find.mockReturnValue(mockChain);

      const url = new URL('http://localhost:3000/api/reviews?bookId=book123');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockReview.find).toHaveBeenCalledWith({ bookId: 'book123' });
      expect(mockChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockChain.lean).toHaveBeenCalled();
      expect(data).toEqual(mockReviews);
    });

    it('should return empty array when no reviews found', async () => {
      const mockChain = {
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([])
      };
      mockReview.find.mockReturnValue(mockChain);

      const url = new URL('http://localhost:3000/api/reviews?bookId=nonexistent');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should handle database errors', async () => {
      const mockChain = {
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockRejectedValue(new Error('Database error'))
      };
      mockReview.find.mockReturnValue(mockChain);

      const url = new URL('http://localhost:3000/api/reviews?bookId=book123');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error del servidor');
    });

    it('should return 400 for missing bookId parameter', async () => {
      const url = new URL('http://localhost:3000/api/reviews');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('bookId es requerido');
    });
  });

  describe('POST /api/reviews - Create Review', () => {
    const createMockRequest = (body: any, token?: string) => {
      const headers = new Headers({ 'Content-Type': 'application/json' });
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      const request = new NextRequest('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      // Simular que requireAuth agrega el usuario al request
      if (token && token === 'valid-token') {
        (request as any).user = mockUser;
      }

      return request;
    };

    it('should create a new review successfully', async () => {
      mockAuthUtils.extractTokenFromHeader.mockReturnValue('valid-token');
      mockAuthUtils.validateToken.mockReturnValue(mockUser);
      mockBook.findById.mockResolvedValue({ _id: 'book123', title: 'Test Book' }); // Libro existe
      (mockReview.create as any).mockResolvedValue(mockReviewData);

      const requestBody = {
        bookId: 'book123',
        rating: 5,
        reviewText: 'Excellent book!'
      };

      const request = createMockRequest(requestBody, 'valid-token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(mockReview.create).toHaveBeenCalledWith({
        bookId: 'book123',
        userName: 'Test User',
        userId: 'user123',
        rating: 5,
        reviewText: 'Excellent book!'
      });
    });

    it('should validate required fields', async () => {
      mockBook.findById.mockResolvedValue({ _id: 'book123', title: 'Test Book' });

      const requestBody = {
        bookId: 'book123',
        // Missing rating and reviewText
      };

      const request = createMockRequest(requestBody, 'valid-token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Todos los campos son requeridos');
    });

    it('should validate rating range', async () => {
      mockBook.findById.mockResolvedValue({ _id: 'book123', title: 'Test Book' });

      const requestBody = {
        bookId: 'book123',
        rating: 6, // Invalid rating
        reviewText: 'Great book!'
      };

      const request = createMockRequest(requestBody, 'valid-token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('La calificación debe estar entre 1 y 5');
    });
  });

  describe('PUT /api/reviews/[id] - Update Review', () => {
    const createMockRequest = (body: any, token?: string) => {
      const headers = new Headers({ 'Content-Type': 'application/json' });
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return new NextRequest('http://localhost:3000/api/reviews/review123', {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      });
    };

    it('should update own review successfully', async () => {
      mockAuthUtils.extractTokenFromHeader.mockReturnValue('valid-token');
      mockAuthUtils.validateToken.mockReturnValue(mockUser);
      mockReview.findById.mockResolvedValue(mockReviewData);
      mockReview.findByIdAndUpdate.mockResolvedValue({
        ...mockReviewData,
        rating: 4,
        reviewText: 'Updated review text'
      });

      const requestBody = {
        rating: 4,
        reviewText: 'Updated review text'
      };

      const request = createMockRequest(requestBody, 'valid-token');
      const response = await PUT(request, { params: { id: 'review123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Review updated successfully');
    });

    it('should return 404 for non-existent review', async () => {
      mockAuthUtils.extractTokenFromHeader.mockReturnValue('valid-token');
      mockAuthUtils.validateToken.mockReturnValue(mockUser);
      mockReview.findById.mockResolvedValue(null);

      const requestBody = {
        rating: 4,
        reviewText: 'Updated review text'
      };

      const request = createMockRequest(requestBody, 'valid-token');
      const response = await PUT(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Review not found');
    });

    it('should return 403 for unauthorized update attempt', async () => {
      const otherUser = { ...mockUser, userId: 'otheruser123' };
      mockAuthUtils.extractTokenFromHeader.mockReturnValue('valid-token');
      mockAuthUtils.validateToken.mockReturnValue(otherUser);
      mockReview.findById.mockResolvedValue(mockReviewData);

      const requestBody = {
        rating: 4,
        reviewText: 'Updated review text'
      };

      const request = createMockRequest(requestBody, 'valid-token');
      const response = await PUT(request, { params: { id: 'review123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Unauthorized: You can only edit your own reviews');
    });
  });

  describe('DELETE /api/reviews/[id] - Delete Review', () => {
    const createMockRequest = (token?: string) => {
      const headers = new Headers();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return new NextRequest('http://localhost:3000/api/reviews/review123', {
        method: 'DELETE',
        headers
      });
    };

    it('should delete own review successfully', async () => {
      mockAuthUtils.extractTokenFromHeader.mockReturnValue('valid-token');
      mockAuthUtils.validateToken.mockReturnValue(mockUser);
      mockReview.findById.mockResolvedValue(mockReviewData);
      mockReview.findByIdAndDelete.mockResolvedValue(mockReviewData);

      const request = createMockRequest('valid-token');
      const response = await DELETE(request, { params: { id: 'review123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Review deleted successfully');
      expect(mockReview.findByIdAndDelete).toHaveBeenCalledWith('review123');
    });

    it('should return 404 for non-existent review', async () => {
      mockAuthUtils.extractTokenFromHeader.mockReturnValue('valid-token');
      mockAuthUtils.validateToken.mockReturnValue(mockUser);
      mockReview.findById.mockResolvedValue(null);

      const request = createMockRequest('valid-token');
      const response = await DELETE(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Review not found');
    });

    it('should return 403 for unauthorized delete attempt', async () => {
      const otherUser = { ...mockUser, userId: 'otheruser123' };
      mockAuthUtils.extractTokenFromHeader.mockReturnValue('valid-token');
      mockAuthUtils.validateToken.mockReturnValue(otherUser);
      mockReview.findById.mockResolvedValue(mockReviewData);

      const request = createMockRequest('valid-token');
      const response = await DELETE(request, { params: { id: 'review123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Unauthorized: You can only delete your own reviews');
    });

    it('should return 401 for missing authentication', async () => {
      mockAuthUtils.extractTokenFromHeader.mockReturnValue(null);

      const request = createMockRequest();
      const response = await DELETE(request, { params: { id: 'review123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Token de acceso requerido');
    });
  });

  describe('Database Error Handling', () => {
    it('should handle database connection errors in POST', async () => {
      mockBook.findById.mockResolvedValue({ _id: 'book123', title: 'Test Book' });
      mockReview.create.mockRejectedValue(new Error('Database connection failed'));

      const headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Bearer valid-token' });
      const request = new NextRequest('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          bookId: 'book123',
          rating: 5,
          reviewText: 'Great book!'
        })
      });

      // Simular que requireAuth agrega el usuario al request
      (request as any).user = mockUser;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error del servidor');
    });

    it('should handle database errors in PUT', async () => {
      mockAuthUtils.extractTokenFromHeader.mockReturnValue('valid-token');
      mockAuthUtils.validateToken.mockReturnValue(mockUser);
      mockReview.findById.mockResolvedValue(mockReviewData);
      mockReview.findByIdAndUpdate.mockRejectedValue(new Error('Database update failed'));

      const headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Bearer valid-token' });
      const request = new NextRequest('http://localhost:3000/api/reviews/review123', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          rating: 4,
          reviewText: 'Updated text'
        })
      });

      const response = await PUT(request, { params: { id: 'review123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});