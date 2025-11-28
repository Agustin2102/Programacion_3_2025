/**
 * PRUEBAS UNITARIAS: Sistema de Votaciones
 * 
 * Estas pruebas verifican que el sistema de votaciones en reseñas
 * funcione correctamente, incluyendo prevención de duplicados,
 * cambio de votos y actualización de contadores.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock de la conexión a MongoDB
vi.mock('@/lib/mongoose', () => ({
    default: vi.fn().mockResolvedValue(undefined)
}));

// Mock del modelo Review
vi.mock('@/models/Review', () => ({
    default: {
        find: vi.fn(),
        findById: vi.fn(),
        findByIdAndUpdate: vi.fn()
    }
}));

// Mock del modelo Vote
vi.mock('@/models/Vote', () => ({
    default: {
        findOne: vi.fn(),
        findByIdAndUpdate: vi.fn(),
        create: vi.fn(),
        find: vi.fn()
    }
}));

// Importar las funciones a probar después de los mocks
import { POST } from '@/app/api/reviews/vote/route';
import Review from '@/models/Review';
import Vote from '@/models/Vote';

const mockReview = vi.mocked(Review);
const mockVote = vi.mocked(Vote);

describe('Voting System API - POST /api/reviews/vote', () => {

    const mockReviewData = {
        _id: 'review123',
        bookId: 'book123',
        userName: 'Test User',
        rating: 5,
        reviewText: 'Great book!',
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockVoteData = {
        _id: 'vote123',
        reviewId: 'review123',
        userIP: '192.168.1.1',
        voteType: 'UP' as const,
        createdAt: new Date()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Successful Vote Creation', () => {
        it('should create a new upvote successfully', async () => {
            mockVote.findOne.mockResolvedValue(null); // No voto existente
            mockVote.create.mockResolvedValue(mockVoteData as any);
            mockVote.find.mockResolvedValue([mockVoteData] as any);
            mockReview.findByIdAndUpdate.mockResolvedValue({
                ...mockReviewData,
                upvotes: 1,
                downvotes: 0
            } as any);

            const requestBody = {
                reviewId: 'review123',
                voteType: 'UP'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(mockVote.create).toHaveBeenCalledWith({
                reviewId: 'review123',
                userIP: '192.168.1.1',
                voteType: 'UP'
            });
            expect(data.upvotes).toBe(1);
            expect(data.downvotes).toBe(0);
        });

        it('should create a new downvote successfully', async () => {
            const downvoteData = { ...mockVoteData, voteType: 'DOWN' as const };
            mockVote.findOne.mockResolvedValue(null);
            mockVote.create.mockResolvedValue(downvoteData as any);
            mockVote.find.mockResolvedValue([downvoteData] as any);
            mockReview.findByIdAndUpdate.mockResolvedValue({
                ...mockReviewData,
                upvotes: 0,
                downvotes: 1
            } as any);

            const requestBody = {
                reviewId: 'review123',
                voteType: 'DOWN'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-real-ip': '192.168.1.1'
                },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.downvotes).toBe(1);
            expect(data.upvotes).toBe(0);
        });
    });

    describe('Vote Type Changes', () => {
        it('should change vote from UP to DOWN', async () => {
            const existingUpvote = { ...mockVoteData, voteType: 'UP' as const };
            mockVote.findOne.mockResolvedValue(existingUpvote as any);
            mockVote.findByIdAndUpdate.mockResolvedValue({ ...existingUpvote, voteType: 'DOWN' } as any);
            mockVote.find.mockResolvedValue([
                { ...mockVoteData, voteType: 'DOWN' }
            ] as any);
            mockReview.findByIdAndUpdate.mockResolvedValue({
                ...mockReviewData,
                upvotes: 0,
                downvotes: 1
            } as any);

            const requestBody = {
                reviewId: 'review123',
                voteType: 'DOWN'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(mockVote.findByIdAndUpdate).toHaveBeenCalledWith(
                existingUpvote._id,
                { voteType: 'DOWN' }
            );
            expect(data.downvotes).toBe(1);
            expect(data.upvotes).toBe(0);
        });

        it('should change vote from DOWN to UP', async () => {
            const existingDownvote = { ...mockVoteData, voteType: 'DOWN' as const };
            mockVote.findOne.mockResolvedValue(existingDownvote as any);
            mockVote.findByIdAndUpdate.mockResolvedValue({ ...existingDownvote, voteType: 'UP' } as any);
            mockVote.find.mockResolvedValue([
                { ...mockVoteData, voteType: 'UP' }
            ] as any);
            mockReview.findByIdAndUpdate.mockResolvedValue({
                ...mockReviewData,
                upvotes: 1,
                downvotes: 0
            } as any);

            const requestBody = {
                reviewId: 'review123',
                voteType: 'UP'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);

            expect(response.status).toBe(200);
            expect(mockVote.findByIdAndUpdate).toHaveBeenCalled();
        });
    });

    describe('Duplicate Vote Prevention', () => {
        it('should reject duplicate vote of same type', async () => {
            const existingVote = { ...mockVoteData, voteType: 'UP' as const };
            mockVote.findOne.mockResolvedValue(existingVote as any);

            const requestBody = {
                reviewId: 'review123',
                voteType: 'UP'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Ya has votado en esta reseña');
            expect(mockVote.create).not.toHaveBeenCalled();
            expect(mockVote.findByIdAndUpdate).not.toHaveBeenCalled();
        });
    });

    describe('Vote Counter Updates', () => {
        it('should correctly calculate upvotes and downvotes', async () => {
            mockVote.findOne.mockResolvedValue(null);
            mockVote.create.mockResolvedValue(mockVoteData as any);

            const votes = [
                { voteType: 'UP' },
                { voteType: 'UP' },
                { voteType: 'DOWN' }
            ];
            mockVote.find.mockResolvedValue(votes as any);

            mockReview.findByIdAndUpdate.mockResolvedValue({
                ...mockReviewData,
                upvotes: 2,
                downvotes: 1
            } as any);

            const requestBody = {
                reviewId: 'review123',
                voteType: 'UP'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(mockReview.findByIdAndUpdate).toHaveBeenCalledWith(
                'review123',
                { upvotes: 2, downvotes: 1 },
                { new: true }
            );
            expect(data.upvotes).toBe(2);
            expect(data.downvotes).toBe(1);
        });

        it('should update review with zero votes when no votes exist', async () => {
            mockVote.findOne.mockResolvedValue(null);
            mockVote.create.mockResolvedValue(mockVoteData as any);
            mockVote.find.mockResolvedValue([mockVoteData] as any);
            mockReview.findByIdAndUpdate.mockResolvedValue({
                ...mockReviewData,
                upvotes: 1,
                downvotes: 0
            } as any);

            const requestBody = {
                reviewId: 'review123',
                voteType: 'UP'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: JSON.stringify(requestBody)
            });

            await POST(request);

            expect(mockReview.findByIdAndUpdate).toHaveBeenCalledWith(
                'review123',
                { upvotes: 1, downvotes: 0 },
                { new: true }
            );
        });
    });

    describe('Input Validation', () => {
        it('should reject request without reviewId', async () => {
            const requestBody = {
                voteType: 'UP'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('reviewId y voteType son requeridos');
        });

        it('should reject request without voteType', async () => {
            const requestBody = {
                reviewId: 'review123'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('reviewId y voteType son requeridos');
        });

        it('should reject invalid voteType', async () => {
            const requestBody = {
                reviewId: 'review123',
                voteType: 'INVALID'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('voteType debe ser UP o DOWN');
        });
    });

    describe('IP Address Extraction', () => {
        it('should extract IP from x-forwarded-for header', async () => {
            mockVote.findOne.mockResolvedValue(null);
            mockVote.create.mockResolvedValue(mockVoteData as any);
            mockVote.find.mockResolvedValue([mockVoteData] as any);
            mockReview.findByIdAndUpdate.mockResolvedValue(mockReviewData as any);

            const requestBody = {
                reviewId: 'review123',
                voteType: 'UP'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '10.0.0.1, 192.168.1.1'
                },
                body: JSON.stringify(requestBody)
            });

            await POST(request);

            expect(mockVote.create).toHaveBeenCalledWith({
                reviewId: 'review123',
                userIP: '10.0.0.1', // Debe tomar la primera IP
                voteType: 'UP'
            });
        });

        it('should extract IP from x-real-ip header when x-forwarded-for is not present', async () => {
            mockVote.findOne.mockResolvedValue(null);
            mockVote.create.mockResolvedValue(mockVoteData as any);
            mockVote.find.mockResolvedValue([mockVoteData] as any);
            mockReview.findByIdAndUpdate.mockResolvedValue(mockReviewData as any);

            const requestBody = {
                reviewId: 'review123',
                voteType: 'UP'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-real-ip': '172.16.0.1'
                },
                body: JSON.stringify(requestBody)
            });

            await POST(request);

            expect(mockVote.create).toHaveBeenCalledWith({
                reviewId: 'review123',
                userIP: '172.16.0.1',
                voteType: 'UP'
            });
        });

        it('should use "unknown" when no IP headers are present', async () => {
            mockVote.findOne.mockResolvedValue(null);
            mockVote.create.mockResolvedValue(mockVoteData as any);
            mockVote.find.mockResolvedValue([mockVoteData] as any);
            mockReview.findByIdAndUpdate.mockResolvedValue(mockReviewData as any);

            const requestBody = {
                reviewId: 'review123',
                voteType: 'UP'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            await POST(request);

            expect(mockVote.create).toHaveBeenCalledWith({
                reviewId: 'review123',
                userIP: 'unknown',
                voteType: 'UP'
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle database errors gracefully', async () => {
            mockVote.findOne.mockRejectedValue(new Error('Database connection failed'));

            const requestBody = {
                reviewId: 'review123',
                voteType: 'UP'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Error del servidor');
        });

        it('should handle vote creation errors', async () => {
            mockVote.findOne.mockResolvedValue(null);
            mockVote.create.mockRejectedValue(new Error('Failed to create vote'));

            const requestBody = {
                reviewId: 'review123',
                voteType: 'UP'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Error del servidor');
        });

        it('should handle review update errors', async () => {
            mockVote.findOne.mockResolvedValue(null);
            mockVote.create.mockResolvedValue(mockVoteData as any);
            mockVote.find.mockResolvedValue([mockVoteData] as any);
            mockReview.findByIdAndUpdate.mockRejectedValue(new Error('Failed to update review'));

            const requestBody = {
                reviewId: 'review123',
                voteType: 'UP'
            };

            const request = new NextRequest('http://localhost:3000/api/reviews/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: JSON.stringify(requestBody)
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Error del servidor');
        });
    });
});
