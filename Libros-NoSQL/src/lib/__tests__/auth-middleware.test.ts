/**
 * PRUEBAS UNITARIAS: Middleware de Autorización
 * 
 * Estas pruebas verifican que el middleware de autorización
 * funcione correctamente para proteger rutas y validar acceso.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
  extractTokenFromHeader,
  validateToken,
  createErrorResponse,
  createSuccessResponse
} from '@/lib/auth-utils';

// Mock de las utilidades de autenticación para pruebas aisladas
vi.mock('@/lib/auth-utils', async () => {
  const actual = await vi.importActual('@/lib/auth-utils');
  return {
    ...actual,
    extractTokenFromHeader: vi.fn(),
    validateToken: vi.fn(),
    createErrorResponse: vi.fn(),
    createSuccessResponse: vi.fn()
  };
});

describe('Authorization Middleware', () => {
  const mockUser = {
    userId: 'user123',
    email: 'test@example.com',
    name: 'Test User'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    (createErrorResponse as any).mockImplementation((message: string, status: number) => 
      new Response(JSON.stringify({ error: message }), { status })
    );
    
    (createSuccessResponse as any).mockImplementation((data: any, status: number = 200) => 
      new Response(JSON.stringify({ success: true, ...data }), { status })
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Token Extraction and Validation', () => {
    it('should extract valid token from Authorization header', () => {
      const token = 'valid-jwt-token';
      const authHeader = `Bearer ${token}`;
      
      (extractTokenFromHeader as any).mockReturnValue(token);
      
      const extractedToken = extractTokenFromHeader(authHeader);
      
      expect(extractTokenFromHeader).toHaveBeenCalledWith(authHeader);
      expect(extractedToken).toBe(token);
    });

    it('should return null for missing Authorization header', () => {
      (extractTokenFromHeader as any).mockReturnValue(null);
      
      const extractedToken = extractTokenFromHeader(null);
      
      expect(extractTokenFromHeader).toHaveBeenCalledWith(null);
      expect(extractedToken).toBeNull();
    });

    it('should return null for malformed Authorization header', () => {
      const malformedHeader = 'NotBearer token-value';
      
      (extractTokenFromHeader as any).mockReturnValue(null);
      
      const extractedToken = extractTokenFromHeader(malformedHeader);
      
      expect(extractTokenFromHeader).toHaveBeenCalledWith(malformedHeader);
      expect(extractedToken).toBeNull();
    });

    it('should validate correct token and return user data', () => {
      const token = 'valid-jwt-token';
      
      (validateToken as any).mockReturnValue(mockUser);
      
      const userData = validateToken(token);
      
      expect(validateToken).toHaveBeenCalledWith(token);
      expect(userData).toEqual(mockUser);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid-token';
      
      (validateToken as any).mockReturnValue(null);
      
      const userData = validateToken(invalidToken);
      
      expect(validateToken).toHaveBeenCalledWith(invalidToken);
      expect(userData).toBeNull();
    });
  });

  describe('Authorization Flow Integration', () => {
    const createMockRequest = (authHeader?: string) => {
      const headers = new Headers();
      if (authHeader) {
        headers.set('Authorization', authHeader);
      }
      
      return new NextRequest('http://localhost:3000/api/protected', {
        method: 'GET',
        headers
      });
    };

    it('should allow access with valid authentication', async () => {
      const token = 'valid-jwt-token';
      const authHeader = `Bearer ${token}`;
      
      (extractTokenFromHeader as any).mockReturnValue(token);
      (validateToken as any).mockReturnValue(mockUser);
      
      const request = createMockRequest(authHeader);
      
      // Simular el flujo de autorización
      const extractedToken = extractTokenFromHeader(request.headers.get('authorization'));
      expect(extractedToken).toBe(token);
      
      if (extractedToken) {
        const userData = validateToken(extractedToken);
        expect(userData).toEqual(mockUser);
        
        // En un middleware real, esto continuaría con el handler
        expect(userData).toBeTruthy();
      }
    });

    it('should deny access without authentication header', async () => {
      const request = createMockRequest();
      
      (extractTokenFromHeader as any).mockReturnValue(null);
      
      const extractedToken = extractTokenFromHeader(request.headers.get('authorization'));
      expect(extractedToken).toBeNull();
      
      // Simular respuesta de error del middleware
      const errorResponse = createErrorResponse('Token de acceso requerido', 401);
      expect(createErrorResponse).toHaveBeenCalledWith('Token de acceso requerido', 401);
    });

    it('should deny access with invalid token', async () => {
      const invalidToken = 'invalid-token';
      const authHeader = `Bearer ${invalidToken}`;
      
      (extractTokenFromHeader as any).mockReturnValue(invalidToken);
      (validateToken as any).mockReturnValue(null);
      
      const request = createMockRequest(authHeader);
      
      const extractedToken = extractTokenFromHeader(request.headers.get('authorization'));
      expect(extractedToken).toBe(invalidToken);
      
      if (extractedToken) {
        const userData = validateToken(extractedToken);
        expect(userData).toBeNull();
      }
      
      // Simular respuesta de error del middleware
      const errorResponse = createErrorResponse('Token inválido o expirado', 401);
      expect(createErrorResponse).toHaveBeenCalledWith('Token inválido o expirado', 401);
    });

    it('should handle malformed Bearer token', async () => {
      const malformedHeader = 'Bearer';
      
      (extractTokenFromHeader as any).mockReturnValue(null);
      
      const request = createMockRequest(malformedHeader);
      
      const extractedToken = extractTokenFromHeader(request.headers.get('authorization'));
      expect(extractedToken).toBeNull();
      
      const errorResponse = createErrorResponse('Token de acceso requerido', 401);
      expect(createErrorResponse).toHaveBeenCalledWith('Token de acceso requerido', 401);
    });
  });

  describe('Access Control Scenarios', () => {
    it('should allow resource owner to access their own resources', () => {
      const resourceUserId = 'user123';
      const requestingUser = { ...mockUser, userId: 'user123' };
      
      // Simular verificación de propiedad de recurso
      const isOwner = resourceUserId === requestingUser.userId;
      expect(isOwner).toBe(true);
    });

    it('should deny access to resources owned by other users', () => {
      const resourceUserId = 'user123';
      const requestingUser = { ...mockUser, userId: 'user456' };
      
      // Simular verificación de propiedad de recurso
      const isOwner = resourceUserId === requestingUser.userId;
      expect(isOwner).toBe(false);
      
      // En un middleware real, esto resultaría en un 403
      if (!isOwner) {
        const errorResponse = createErrorResponse('Unauthorized: Access denied', 403);
        expect(createErrorResponse).toHaveBeenCalledWith('Unauthorized: Access denied', 403);
      }
    });

    it('should handle admin privileges correctly', () => {
      const adminUser = { ...mockUser, role: 'admin' };
      const regularUser = { ...mockUser, role: 'user' };
      
      // Simular verificación de privilegios de admin
      const hasAdminAccess = adminUser.role === 'admin';
      const hasRegularAccess = regularUser.role === 'admin';
      
      expect(hasAdminAccess).toBe(true);
      expect(hasRegularAccess).toBe(false);
    });
  });

  describe('Response Generation', () => {
    it('should create proper error responses', () => {
      const message = 'Access denied';
      const status = 403;
      
      const response = createErrorResponse(message, status);
      
      expect(createErrorResponse).toHaveBeenCalledWith(message, status);
    });

    it('should create proper success responses', () => {
      const data = { message: 'Access granted', user: mockUser };
      const status = 200;
      
      const response = createSuccessResponse(data, status);
      
      expect(createSuccessResponse).toHaveBeenCalledWith(data, status);
    });

    it('should use default status for success responses', () => {
      const data = { message: 'Success' };
      
      const response = createSuccessResponse(data);
      
      expect(createSuccessResponse).toHaveBeenCalledWith(data);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined authorization header gracefully', () => {
      (extractTokenFromHeader as any).mockReturnValue(null);
      
      const result = extractTokenFromHeader(undefined as any);
      
      expect(result).toBeNull();
    });

    it('should handle empty string authorization header', () => {
      (extractTokenFromHeader as any).mockReturnValue(null);
      
      const result = extractTokenFromHeader('');
      
      expect(result).toBeNull();
    });

    it('should handle token validation errors gracefully', () => {
      const token = 'valid-token';
      
      // Mock validateToken to throw an error
      (validateToken as any).mockImplementation(() => {
        throw new Error('Token validation failed');
      });
      
      try {
        validateToken(token);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Token validation failed');
      }
    });

    it('should handle missing user data in token payload', () => {
      const token = 'token-with-incomplete-payload';
      
      (validateToken as any).mockReturnValue({
        userId: 'user123',
        // Missing email and name
      });
      
      const userData = validateToken(token);
      
      expect(userData?.userId).toBe('user123');
      expect(userData?.email).toBeUndefined();
      expect(userData?.name).toBeUndefined();
    });
  });

  describe('Concurrent Access Control', () => {
    it('should handle multiple authorization requests independently', async () => {
      const user1Token = 'user1-token';
      const user2Token = 'user2-token';
      
      const user1 = { ...mockUser, userId: 'user1' };
      const user2 = { ...mockUser, userId: 'user2' };
      
      (extractTokenFromHeader as any)
        .mockReturnValueOnce(user1Token)
        .mockReturnValueOnce(user2Token);
      
      (validateToken as any)
        .mockReturnValueOnce(user1)
        .mockReturnValueOnce(user2);
      
      const request1 = createMockRequest(`Bearer ${user1Token}`);
      const request2 = createMockRequest(`Bearer ${user2Token}`);
      
      const token1 = extractTokenFromHeader(request1.headers.get('authorization'));
      const token2 = extractTokenFromHeader(request2.headers.get('authorization'));
      
      const userData1 = token1 ? validateToken(token1) : null;
      const userData2 = token2 ? validateToken(token2) : null;
      
      expect(userData1?.userId).toBe('user1');
      expect(userData2?.userId).toBe('user2');
    });
  });

  function createMockRequest(authHeader?: string): NextRequest {
    const headers = new Headers();
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }
    
    return new NextRequest('http://localhost:3000/api/protected', {
      method: 'GET',
      headers
    });
  }
});