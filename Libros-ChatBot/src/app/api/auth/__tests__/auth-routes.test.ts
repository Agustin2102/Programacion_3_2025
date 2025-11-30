/**
 * PRUEBAS UNITARIAS: Rutas de Autenticación
 * 
 * Estas pruebas verifican que las rutas de registro y login
 * funcionen correctamente con mocking de la base de datos.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock de la conexión a MongoDB
vi.mock('@/lib/mongoose', () => ({
    default: vi.fn().mockResolvedValue(undefined)
}));

// Mock del modelo User
vi.mock('@/models/User', () => ({
    default: {
        findOne: vi.fn(),
        create: vi.fn(),
        save: vi.fn()
    }
}));

// Mock de las utilidades de autenticación
vi.mock('@/lib/auth-utils', () => ({
    hashPassword: vi.fn(),
    verifyPassword: vi.fn(),
    generateToken: vi.fn(),
    createErrorResponse: vi.fn((message: string, status: number) => {
        return new Response(
            JSON.stringify({ success: false, message, error: message }),
            { status, headers: { 'Content-Type': 'application/json' } }
        );
    }),
    createSuccessResponse: vi.fn((data: any, status: number = 200) => {
        return new Response(
            JSON.stringify({ success: true, ...data }),
            { status, headers: { 'Content-Type': 'application/json' } }
        );
    })
}));

// Mock de validaciones de Zod
vi.mock('@/lib/validations', () => ({
    registerSchema: {
        parse: vi.fn((data) => data)
    },
    loginSchema: {
        parse: vi.fn((data) => data)
    }
}));

// Importar las funciones a probar después de los mocks
import { POST as registerPOST } from '@/app/api/auth/register/route';
import { POST as loginPOST } from '@/app/api/auth/login/route';
import User from '@/models/User';
import * as authUtils from '@/lib/auth-utils';
import * as validations from '@/lib/validations';

const mockUser = vi.mocked(User);
const mockAuthUtils = vi.mocked(authUtils);
const mockValidations = vi.mocked(validations);

describe('Authentication API - Register & Login', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('POST /api/auth/register - User Registration', () => {
        const mockUserData = {
            _id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashedPassword123',
            createdAt: new Date(),
            updatedAt: new Date(),
            save: vi.fn()
        };

        it('should register a new user successfully', async () => {
            // Setup mocks
            mockUser.findOne.mockResolvedValue(null); // Usuario no existe
            mockAuthUtils.hashPassword.mockResolvedValue('hashedPassword123');
            mockAuthUtils.generateToken.mockReturnValue('jwt-token-123');

            const savedUser = {
                ...mockUserData,
                save: vi.fn().mockResolvedValue(mockUserData)
            };
            mockUser.create.mockResolvedValue(savedUser as any);

            const requestBody = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'Test1234@'
            };

            const request = new NextRequest('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await registerPOST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.message).toBe('Usuario registrado exitosamente');
            expect(data.token).toBe('jwt-token-123');
            expect(data.user).toBeDefined();
            expect(data.user.email).toBe('test@example.com');
            expect(mockAuthUtils.hashPassword).toHaveBeenCalledWith('Test1234@');
            expect(mockUser.create).toHaveBeenCalled();
        });

        it('should reject registration with existing email', async () => {
            // Usuario ya existe
            mockUser.findOne.mockResolvedValue(mockUserData as any);

            const requestBody = {
                email: 'existing@example.com',
                name: 'Test User',
                password: 'Test1234@'
            };

            const request = new NextRequest('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await registerPOST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.message).toBe('El email ya esta en uso');
            expect(mockUser.create).not.toHaveBeenCalled();
        });

        it('should validate required fields', async () => {
            mockValidations.registerSchema.parse.mockImplementation(() => {
                throw {
                    name: 'ZodError',
                    errors: [{ message: 'El email es requerido' }]
                };
            });

            const requestBody = {
                name: 'Test User',
                password: 'Test1234@'
                // Missing email
            };

            const request = new NextRequest('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await registerPOST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.message).toContain('Datos inválidos');
        });

        it('should handle password hashing correctly', async () => {
            mockUser.findOne.mockResolvedValue(null);
            mockAuthUtils.hashPassword.mockResolvedValue('$argon2id$v=19$m=65536$hashedPassword');
            mockAuthUtils.generateToken.mockReturnValue('jwt-token-123');

            const savedUser = {
                ...mockUserData,
                save: vi.fn().mockResolvedValue(mockUserData)
            };
            mockUser.create.mockResolvedValue(savedUser as any);

            const requestBody = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'MySecurePass123!'
            };

            const request = new NextRequest('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            await registerPOST(request);

            expect(mockAuthUtils.hashPassword).toHaveBeenCalledWith('MySecurePass123!');
            expect(mockUser.create).toHaveBeenCalledWith({
                email: 'test@example.com',
                name: 'Test User',
                password: '$argon2id$v=19$m=65536$hashedPassword'
            });
        });

        it('should handle database errors gracefully', async () => {
            mockUser.findOne.mockResolvedValue(null);
            mockAuthUtils.hashPassword.mockResolvedValue('hashedPassword');
            mockUser.create.mockRejectedValue(new Error('Database connection failed'));

            const requestBody = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'Test1234@'
            };

            const request = new NextRequest('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await registerPOST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.message).toBe('Error interno del servidor');
        });
    });

    describe('POST /api/auth/login - User Login', () => {
        const mockUserWithPassword = {
            _id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashedPassword123',
            comparePassword: vi.fn()
        };

        it('should login user with valid credentials', async () => {
            // Setup mocks
            mockUser.findOne.mockReturnValue({
                select: vi.fn().mockResolvedValue(mockUserWithPassword)
            } as any);
            mockUserWithPassword.comparePassword.mockResolvedValue(true);
            mockAuthUtils.generateToken.mockReturnValue('jwt-token-login-123');

            const requestBody = {
                email: 'test@example.com',
                password: 'Test1234@'
            };

            const request = new NextRequest('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await loginPOST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.message).toBe('Login exitoso');
            expect(data.token).toBe('jwt-token-login-123');
            expect(data.user).toBeDefined();
            expect(data.user.email).toBe('test@example.com');
            expect(mockUserWithPassword.comparePassword).toHaveBeenCalledWith('Test1234@');
        });

        it('should reject login with non-existent email', async () => {
            mockUser.findOne.mockReturnValue({
                select: vi.fn().mockResolvedValue(null)
            } as any);

            const requestBody = {
                email: 'nonexistent@example.com',
                password: 'Test1234@'
            };

            const request = new NextRequest('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await loginPOST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.message).toBe('Credenciales inválidas');
        });

        it('should reject login with incorrect password', async () => {
            mockUser.findOne.mockReturnValue({
                select: vi.fn().mockResolvedValue(mockUserWithPassword)
            } as any);
            mockUserWithPassword.comparePassword.mockResolvedValue(false);

            const requestBody = {
                email: 'test@example.com',
                password: 'WrongPassword123!'
            };

            const request = new NextRequest('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await loginPOST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.message).toBe('Credenciales inválidas');
            expect(mockAuthUtils.generateToken).not.toHaveBeenCalled();
        });

        it('should validate login input data', async () => {
            mockValidations.loginSchema.parse.mockImplementation(() => {
                throw {
                    name: 'ZodError',
                    errors: [{ message: 'El email es requerido' }]
                };
            });

            const requestBody = {
                password: 'Test1234@'
                // Missing email
            };

            const request = new NextRequest('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await loginPOST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.message).toContain('Datos inválidos');
        });

        it('should generate JWT token on successful login', async () => {
            mockUser.findOne.mockReturnValue({
                select: vi.fn().mockResolvedValue(mockUserWithPassword)
            } as any);
            mockUserWithPassword.comparePassword.mockResolvedValue(true);
            mockAuthUtils.generateToken.mockReturnValue('generated-jwt-token');

            const requestBody = {
                email: 'test@example.com',
                password: 'Test1234@'
            };

            const request = new NextRequest('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await loginPOST(request);
            const data = await response.json();

            expect(mockAuthUtils.generateToken).toHaveBeenCalledWith({
                _id: 'user123',
                email: 'test@example.com',
                name: 'Test User'
            });
            expect(data.token).toBe('generated-jwt-token');
        });

        it('should handle database errors during login', async () => {
            mockUser.findOne.mockReturnValue({
                select: vi.fn().mockRejectedValue(new Error('Database error'))
            } as any);

            const requestBody = {
                email: 'test@example.com',
                password: 'Test1234@'
            };

            const request = new NextRequest('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const response = await loginPOST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.message).toBe('Error interno del servidor');
        });

        it('should use select(+password) to include password field', async () => {
            const selectMock = vi.fn().mockResolvedValue(mockUserWithPassword);
            mockUser.findOne.mockReturnValue({ select: selectMock } as any);
            mockUserWithPassword.comparePassword.mockResolvedValue(true);
            mockAuthUtils.generateToken.mockReturnValue('token');

            const requestBody = {
                email: 'test@example.com',
                password: 'Test1234@'
            };

            const request = new NextRequest('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            await loginPOST(request);

            expect(mockUser.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(selectMock).toHaveBeenCalledWith('+password');
        });
    });

    describe('Security and Edge Cases', () => {
        it('should not expose password in register response', async () => {
            const mockCreatedUser = {
                _id: 'user123',
                email: 'test@example.com',
                name: 'Test User',
                password: 'hashedPassword',
                save: vi.fn().mockResolvedValue({
                    _id: 'user123',
                    email: 'test@example.com',
                    name: 'Test User'
                })
            };

            mockUser.findOne.mockResolvedValue(null);
            mockAuthUtils.hashPassword.mockResolvedValue('hashedPassword');
            mockUser.create.mockResolvedValue(mockCreatedUser as any);
            mockAuthUtils.generateToken.mockReturnValue('token');

            const request = new NextRequest('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    name: 'Test User',
                    password: 'Test1234@'
                })
            });

            const response = await registerPOST(request);
            const data = await response.json();

            expect(data.user).toBeDefined();
            expect(data.user.password).toBeUndefined();
        });

        it('should not expose password in login response', async () => {
            const mockUserWithPassword = {
                _id: 'user123',
                email: 'test@example.com',
                name: 'Test User',
                password: 'hashedPassword',
                comparePassword: vi.fn().mockResolvedValue(true)
            };

            mockUser.findOne.mockReturnValue({
                select: vi.fn().mockResolvedValue(mockUserWithPassword)
            } as any);
            mockAuthUtils.generateToken.mockReturnValue('token');

            const request = new NextRequest('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'Test1234@'
                })
            });

            const response = await loginPOST(request);
            const data = await response.json();

            expect(data.user).toBeDefined();
            expect(data.user.password).toBeUndefined();
        });
    });
});
