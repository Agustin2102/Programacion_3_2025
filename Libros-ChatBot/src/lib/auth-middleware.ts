/**
 * MIDDLEWARE: Autenticación
 * 
 * PROPÓSITO:
 * Middleware para proteger rutas que requieren autenticación
 */

import { NextRequest } from 'next/server';
import { extractTokenFromHeader, validateToken, createErrorResponse } from './auth-utils';

export function requireAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // Extraer token del header
      const authHeader = request.headers.get('authorization');
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return createErrorResponse('Token de acceso requerido', 401);
      }

      // Validar token
      const userData = validateToken(token);
      if (!userData) {
        return createErrorResponse('Token inválido o expirado', 401);
      }

      // Agregar datos del usuario al request
      (request as any).user = userData;

      // Continuar con el handler original
      return await handler(request, ...args);

    } catch (error) {
      console.error('Error en middleware de autenticación:', error);
      return createErrorResponse('Error de autenticación', 401);
    }
  };
}