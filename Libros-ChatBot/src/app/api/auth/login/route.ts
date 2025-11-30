/**
 * API: Login de Usuario
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema, LoginInput } from '@/lib/validations';
import { verifyPassword, generateToken, createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const body: LoginInput = await request.json();
    const validatedData = loginSchema.parse(body);

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      return createErrorResponse('Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const isPasswordValid = await verifyPassword(validatedData.password, user.password);
    if (!isPasswordValid) {
      return createErrorResponse('Credenciales inválidas', 401);
    }

    // Generar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return createSuccessResponse({
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });

  } catch (error: any) {
    console.error('Error en login:', error);

    if (error.name === 'ZodError') {
      return createErrorResponse(
        `Datos inválidos: ${error.errors.map((e: any) => e.message).join(', ')}`,
        400
      );
    }

    return createErrorResponse('Error interno del servidor', 500);
  }
}