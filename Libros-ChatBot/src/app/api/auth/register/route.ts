/**
 * API: Registro de Usuario
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema, RegisterInput } from '@/lib/validations';
import { hashPassword, generateToken, createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterInput = await request.json();
    const validateData = registerSchema.parse(body);

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validateData.email }
    });

    if (existingUser) {
      return createErrorResponse('El email ya está en uso', 400);
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(validateData.password);

    // Crear el nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        email: validateData.email,
        name: validateData.name,
        password: hashedPassword,
      }
    });

    // Generar token JWT
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    return createSuccessResponse({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      token,
    }, 201);

  } catch (error: any) {
    console.error('Error en registro:', error);

    if (error.name === 'ZodError') {
      return createErrorResponse(
        `Datos inválidos: ${error.errors.map((e: any) => e.message).join(', ')}`,
        400
      );
    }

    // Prisma error code for unique constraint violation
    if (error.code === 'P2002') {
      return createErrorResponse('El email ya está registrado', 400);
    }

    return createErrorResponse('Error interno del servidor', 500);
  }
}