/**
 * PRUEBAS UNITARIAS: Sistema de Favoritos
 * 
 * Estas pruebas verifican que el sistema de favoritos
 * funcione correctamente, incluyendo agregar, eliminar y
 * obtener favoritos de usuarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock de la conexión a MongoDB
vi.mock('@/lib/mongoose', () => ({
    default: vi.fn().mockResolvedValue(undefined)
}));

// Mock del modelo Favorite
vi.mock('@/models/Favorite', () => ({
    default: {
        find: vi.fn(),
        findOne: vi.fn(),
        findByIdAndDelete: vi.fn(),
        create: vi.fn()
    }
}));

// Importar las funciones a probar después de los mocks
import { GET, POST } from '@/app/api/favorites/route';
import Favorite from '@/models/Favorite';

const mockFavorite = vi.mocked(Favorite);

describe('Favorites API - GET & POST /api/favorites', () => {

    const mockFavoriteData = {
        _id: 'favorite123',
        userId: 'user123',
        bookId: 'book123',
        createdAt: new Date('2024-01-15T10:00:00.000Z')
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('GET /api/favorites - Retrieve User Favorites', () => {
        it('should get all favorites for a user', async () => {
            const favorites = [
                mockFavoriteData,
                { ...mockFavoriteData, _id: 'favorite456', bookId: 'book456' }
            ];

            const mockChain = {
                sort: vi.fn().mockReturnThis(),
                lean: vi.fn().mockResolvedValue(favorites)
            };
            mockFavorite.find.mockReturnValue(mockChain as any);

            const url = new URL('http://localhost:3000/api/favorites?userId=user123');
            const request = new NextRequest(url);

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(mockFavorite.find).toHaveBeenCalledWith({ userId: 'user123' });
            expect(mockChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(mockChain.lean).toHaveBeenCalled();
            expect(data).toEqual(favorites);
            expect(data).toHaveLength(2);
        });

        it('should return empty array when user has no favorites', async () => {
            const mockChain = {
                sort: vi.fn().mockReturnThis(),
                lean: vi.fn().mockResolvedValue([])
            };
            mockFavorite.find.mockReturnValue(mockChain as any);

            const url = new URL('http://localhost:3000/api/favorites?userId=user123');
            const request = new NextRequest(url);

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual([]);
            expect(data).toHaveLength(0);
        });

        it('should return 400 when userId is missing', async () => {
            const url = new URL('http://localhost:3000/api/favorites');
            const request = new NextRequest(url);

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('userId es requerido');
            expect(mockFavorite.find).not.toHaveBeenCalled();
        });

        it('should handle database errors gracefully', async () => {
            const mockChain = {
                sort: vi.fn().mockReturnThis(),
                lean: vi.fn().mockRejectedValue(new Error('Database error'))
            };
            mockFavorite.find.mockReturnValue(mockChain as any);

            const url = new URL('http://localhost:3000/api/favorites?userId=user123');
            const request = new NextRequest(url);

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Error del servidor');
        });

        it('should sort favorites by creation date (newest first)', async () => {
            const favorites = [
                { ...mockFavoriteData, createdAt: new Date('2024-01-20') },
                { ...mockFavoriteData, _id: 'favorite456', createdAt: new Date('2024-01-15') }
            ];

            const mockChain = {
                sort: vi.fn().mockReturnThis(),
                lean: vi.fn().mockResolvedValue(favorites)
            };
            mockFavorite.find.mockReturnValue(mockChain as any);

            const url = new URL('http://localhost:3000/api/favorites?userId=user123');
            const request = new NextRequest(url);

            await GET(request);

            expect(mockChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
        });
    });

    describe('POST /api/favorites - Add Favorite', () => {
        it('should add a book to favorites successfully', async () => {
            mockFavorite.findOne.mockResolvedValue(null); // No existe
            mockFavorite.create.mockResolvedValue(mockFavoriteData as any);

            const requestBody = {
                userId: 'user123',
                bookId: 'book123',
                action: 'add'
            };

            const request = new NextRequest('http://localhost:3000/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(mockFavorite.findOne).toHaveBeenCalledWith({
                userId: 'user123',
                bookId: 'book123'
            });
            expect(mockFavorite.create).toHaveBeenCalledWith({
                userId: 'user123',
                bookId: 'book123'
            });
            expect(data).toEqual(mockFavoriteData);
        });

        it('should reject duplicate favorite', async () => {
            mockFavorite.findOne.mockResolvedValue(mockFavoriteData as any);

            const requestBody = {
                userId: 'user123',
                bookId: 'book123',
                action: 'add'
            };

            const request = new NextRequest('http://localhost:3000/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('El libro ya esta en favoritos');
            expect(mockFavorite.create).not.toHaveBeenCalled();
        });

        it('should validate required fields for add action', async () => {
            const requestBody = {
                userId: 'user123',
                action: 'add'
                // Missing bookId
            };

            const request = new NextRequest('http://localhost:3000/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Todos los campos son requeridos');
        });

        it('should handle database errors when adding favorite', async () => {
            mockFavorite.findOne.mockResolvedValue(null);
            mockFavorite.create.mockRejectedValue(new Error('Database error'));

            const requestBody = {
                userId: 'user123',
                bookId: 'book123',
                action: 'add'
            };

            const request = new NextRequest('http://localhost:3000/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Error del servidor');
        });
    });

    describe('POST /api/favorites - Remove Favorite', () => {
        it('should remove a book from favorites successfully', async () => {
            mockFavorite.findOne.mockResolvedValue(mockFavoriteData as any);
            mockFavorite.findByIdAndDelete.mockResolvedValue(mockFavoriteData as any);

            const requestBody = {
                userId: 'user123',
                bookId: 'book123',
                action: 'remove'
            };

            const request = new NextRequest('http://localhost:3000/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(mockFavorite.findOne).toHaveBeenCalledWith({
                userId: 'user123',
                bookId: 'book123'
            });
            expect(mockFavorite.findByIdAndDelete).toHaveBeenCalledWith('favorite123');
            expect(data.message).toBe('Libro eliminado de favoritos');
        });

        it('should return 400 when trying to remove non-existent favorite', async () => {
            mockFavorite.findOne.mockResolvedValue(null);

            const requestBody = {
                userId: 'user123',
                bookId: 'book123',
                action: 'remove'
            };

            const request = new NextRequest('http://localhost:3000/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('El libro no esta en favoritos');
            expect(mockFavorite.findByIdAndDelete).not.toHaveBeenCalled();
        });

        it('should validate required fields for remove action', async () => {
            const requestBody = {
                bookId: 'book123',
                action: 'remove'
                // Missing userId
            };

            const request = new NextRequest('http://localhost:3000/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Todos los campos son requeridos');
        });

        it('should handle database errors when removing favorite', async () => {
            mockFavorite.findOne.mockResolvedValue(mockFavoriteData as any);
            mockFavorite.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

            const requestBody = {
                userId: 'user123',
                bookId: 'book123',
                action: 'remove'
            };

            const request = new NextRequest('http://localhost:3000/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Error del servidor');
        });
    });

    describe('Action Validation', () => {
        it('should reject invalid action type', async () => {
            const requestBody = {
                userId: 'user123',
                bookId: 'book123',
                action: 'invalid'
            };

            const request = new NextRequest('http://localhost:3000/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('action debe ser add o remove');
        });

        it('should validate action field is present', async () => {
            const requestBody = {
                userId: 'user123',
                bookId: 'book123'
                // Missing action
            };

            const request = new NextRequest('http://localhost:3000/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Todos los campos son requeridos');
        });

        it('should accept only "add" or "remove" as valid actions', async () => {
            const invalidActions = ['delete', 'update', 'create', 'ADD', 'REMOVE'];

            for (const action of invalidActions) {
                const requestBody = {
                    userId: 'user123',
                    bookId: 'book123',
                    action
                };

                const request = new NextRequest('http://localhost:3000/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                const response = await POST(request);
                const data = await response.json();

                expect(response.status).toBe(400);
                expect(data.error).toBe('action debe ser add o remove');
            }
        });
    });

    describe('Edge Cases', () => {
        it('should handle adding favorite with special characters in IDs', async () => {
            mockFavorite.findOne.mockResolvedValue(null);
            const specialFavorite = {
                ...mockFavoriteData,
                userId: 'user-123_abc',
                bookId: 'book:456/def'
            };
            mockFavorite.create.mockResolvedValue(specialFavorite as any);

            const requestBody = {
                userId: 'user-123_abc',
                bookId: 'book:456/def',
                action: 'add'
            };

            const request = new NextRequest('http://localhost:3000/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);

            expect(response.status).toBe(201);
            expect(mockFavorite.create).toHaveBeenCalledWith({
                userId: 'user-123_abc',
                bookId: 'book:456/def'
            });
        });

        it('should return favorites in correct order (newest first)', async () => {
            const favorites = [
                { ...mockFavoriteData, createdAt: new Date('2024-01-20'), bookId: 'book3' },
                { ...mockFavoriteData, createdAt: new Date('2024-01-18'), bookId: 'book2' },
                { ...mockFavoriteData, createdAt: new Date('2024-01-15'), bookId: 'book1' }
            ];

            const mockChain = {
                sort: vi.fn().mockReturnThis(),
                lean: vi.fn().mockResolvedValue(favorites)
            };
            mockFavorite.find.mockReturnValue(mockChain as any);

            const url = new URL('http://localhost:3000/api/favorites?userId=user123');
            const request = new NextRequest(url);

            const response = await GET(request);
            const data = await response.json();

            expect(data[0].bookId).toBe('book3');
            expect(data[1].bookId).toBe('book2');
            expect(data[2].bookId).toBe('book1');
        });

        it('should handle empty string userId in GET request', async () => {
            const url = new URL('http://localhost:3000/api/favorites?userId=');
            const request = new NextRequest(url);

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('userId es requerido');
        });
    });
});
