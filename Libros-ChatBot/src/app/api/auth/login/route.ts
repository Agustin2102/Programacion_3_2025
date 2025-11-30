/**
 * API: Login de Usuario
 */

import { NextRequest } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { loginSchema, LoginInput } from '../../../../lib/validations';
import { verifyPassword, generateToken, createErrorResponse, createSuccessResponse } from '../../../../lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: LoginInput = await request.json();
    const validatedData = loginSchema.parse(body);

    // Buscar usuario incluyendo la contraseña
    const user = await User.findOne({ email: validatedData.email }).select('+password');
    if (!user) {
      return createErrorResponse('Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      return createErrorResponse('Credenciales inválidas', 401);
    }

    // Generar token JWT
    const token = generateToken({
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    return createSuccessResponse({
      message: 'Login exitoso',
      user: {
        id: user._id,
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