/**
 * API: Verificación de Token
 * Endpoint para verificar si un token JWT es válido
 */

import { NextRequest } from 'next/server';
import { extractTokenFromHeader, verifyTokenResult, createErrorResponse, createSuccessResponse } from '../../../../lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Extraer token del header Authorization
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return createErrorResponse('Token no proporcionado', 401);
    }

    // Verificar token
    const result = verifyTokenResult(token);
    
    if (!result.ok) {
      let message = 'Token inválido';
      
      switch (result.error.kind) {
        case 'ExpiredToken':
          message = 'Token expirado';
          break;
        case 'InvalidToken':
          message = 'Token inválido';
          break;
        case 'MissingToken':
          message = 'Token no proporcionado';
          break;
        default:
          message = 'Error de autenticación';
      }
      
      return createErrorResponse(message, 401);
    }

    // Token válido, retornar datos del usuario
    return createSuccessResponse({
      message: 'Token válido',
      user: {
        id: result.value.userId,
        email: result.value.email,
        name: result.value.name
      }
    });

  } catch (error) {
    console.error('Error verificando token:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}