/**
 * API: Registro de Usuario
 */

import { NextRequest } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { registerSchema, RegisterInput } from '../../../../lib/validations';
import { hashPassword, generateToken, createErrorResponse, createSuccessResponse } from '../../../../lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: RegisterInput = await request.json();
    const validateData = registerSchema.parse(body);

    const existinUser = await User.findOne({ email: validateData.email });
    if (existinUser) {
      return createErrorResponse('El email ya esta en uso', 400);
    }

    const hashedPassword = await hashPassword(validateData.password);

    const newUser = await User.create({
      email: validateData.email,
      name: validateData.name,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const token = generateToken({
      _id: savedUser._id.toString(),
      email: savedUser.email,
      name: savedUser.name,
    });

    return createSuccessResponse({
      message: 'Usuario registrado exitosamente',
      user: {
        id: savedUser._id,
        email: savedUser.email,
        name: savedUser.name,
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

    if (error.code === 11000) {
      return createErrorResponse('El email ya está registrado', 400);
    }

    return createErrorResponse('Error interno del servidor', 500);
  }
}