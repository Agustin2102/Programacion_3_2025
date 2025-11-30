/**
 * UTILIDADES: Autenticación
 * 
 * PROPÓSITO:
 * Funciones auxiliares para manejo de autenticación
 * Hash de contraseñas, verificación, JWT, etc.
 * 
 * FUNCIONALIDADES:
 * - Hash de contraseñas con Argon2
 * - Verificación de contraseñas
 * - Generación y verificación de JWT
 * - Validación de tokens
 */

import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import {z} from 'zod';
import { NextRequest } from 'next/server';
import type { Secret, SignOptions } from 'jsonwebtoken';

// CONFIGURACIÓN: Variables de entorno
const RAW_JWT_SECRET = process.env.JWT_SECRET;
if (!RAW_JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en .env.local');
}
const JWT_SECRET: Secret = RAW_JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
// Definir opciones sin tipo estricto para flexibilidad
const SIGN_OPTS = { 
  expiresIn: JWT_EXPIRES_IN 
} as SignOptions;


// CONFIGURACIÓN: Argon2
const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: parseInt(process.env.ARGON2_MEMORY_COST || '65536'),
    timeCost: parseInt(process.env.ARGON2_TIME_COST || '3'),
    parallelism: parseInt(process.env.ARGON2_PARALLELISM || '1'),
  };


/**
 * FUNCIÓN: hashPassword
 * Hashea una contraseña usando Argon2
 * 
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Contraseña hasheada
 */

export async function hashPassword(password: string): Promise<string> {
    try{
        return await argon2.hash(password, ARGON2_OPTIONS);
    } catch(error){
        console.error('Error al hashear contrseña:', error);
        throw new Error('Error al procesar la contraseña');
    }
}


/**
 * FUNCIÓN: verifyPassword
 * Verifica una contraseña contra su hash
 * 
 * @param {string} password - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña hasheada
 * @returns {Promise<boolean>} - true si coincide, false si no
 */

export async function verifyPassword(password:string, hashedPassword:string): Promise<boolean>{
    try{
        return await argon2.verify(hashedPassword, password);
    } catch(error){
        console.error('Error al verificar contraseña:', error);
        return false;
    }
}


/**
 * INTERFAZ: Payload del JWT --Carga util del token (contenido)--
 */
interface JWTPayload {
    userId: string;
    email: string;
    name: string;
    iat?: number; // <-- Cuándo se creó
    exp?: number; // <-- Cuándo expira
}


/**
 * FUNCIÓN: generateToken
 * Genera un JWT con los datos del usuario
 * 
 * @param {Object} user - Datos del usuario
 * @returns {string} - Token JWT
 */

export function generateToken(user: {
    _id: string;
    email: string;
    name: string;
}): string {

    // Carga util del token
    const payload: JWTPayload = {
        userId: user._id,
        email: user.email,
        name: user.name,
        
    };

    // Genera el token (usar opciones tipadas para resolver overload de TS)
    return jwt.sign(payload, JWT_SECRET, SIGN_OPTS);
};


/**
 * FUNCIÓN: verifyToken
 * Verifica y decodifica un JWT
 * 
 * @param {string} token - Token JWT
 * @returns {JWTPayload | null} - Payload decodificado o null si es inválido
 */
export function verifyToken(token: string): JWTPayload | null {
    // Wraper
    const res = verifyTokenResult(token);
    return res.ok ? res.value : null;
}

/**
 * TIPOS: Result y erroes de verificación
 */
export type Result<T,E> = 
    | {ok: true, value: T}
    | {ok: false, error: E};

export type VerifyTokenError = 
    | {kind: 'MissingToken'}
    | {kind: 'SecretMissing'}
    | {kind: 'ExpiredToken'}
    | {kind: 'NotBeforeToken'}
    | {kind: 'InvalidToken'; reason?:string};

/**
 * FUNCIÓN: verifyTokenResult
 * Funciona igual que verifyToken, pero retorna un Result con e tipo de error.
 */
export function verifyTokenResult(token?:string): Result<JWTPayload, VerifyTokenError>{
    if(!token){return {ok: false, error: {kind: 'MissingToken'}}};
    if(!JWT_SECRET){ return {ok: false, error: {kind: 'SecretMissing'}}};

    try{
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

        //validación minima del payload
        if(!decoded || typeof decoded !== 'object' || !decoded.userId || !decoded.userId || !decoded.email || !decoded.name){
            return {ok: false, error: {kind: 'InvalidToken', reason: 'Payload incompleto o invalido'}};
        }

        return {ok: true, value: decoded};
    } catch(e: any){
        if(e instanceof jwt.TokenExpiredError){
            return {ok: false, error: {kind: 'ExpiredToken'}}
        }

        if(e instanceof jwt.NotBeforeError){
            return {ok: false, error: {kind: 'NotBeforeToken'}};
        }

        return {ok: false, error: {kind: 'InvalidToken', reason: e?.message}};
    }
}


/**
 * FUNCIÓN: extractTokenFromHeader
 * Extrae el token JWT del header Authorization
 * 
 * @param {string} authHeader - Header Authorization
 * @returns {string | null} - Token extraído o null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return null;
    }

    return authHeader.substring(7);
}


/**
 * FUNCIÓN: validateToken
 * Valida un token y retorna los datos del usuario
 * 
 * @param {string} token - Token JWT
 * @returns {JWTPayload | null} - Datos del usuario o null si es inválido
 */
export function validateToken(token: string): JWTPayload | null{
    const payload = verifyToken(token);
    if(!payload || !payload.userId || !payload.email || !payload.name){
        return null;
    }
    return payload;
}


/**
 * FUNCIÓN: createErrorResponse
 * Crea una respuesta de error estandarizada
 * 
 * @param {string} message - Mensaje de error
 * @param {number} status - Código de estado HTTP
 * @returns {Response} - Respuesta de error
 */
export function createErrorResponse(message: string, status: number): Response {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message,
        error: message 
      }),
      { 
        status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
}
  
  /**
   * FUNCIÓN: createSuccessResponse
   * Crea una respuesta de éxito estandarizada
   * 
   * @param {any} data - Datos a retornar
   * @param {number} status - Código de estado HTTP
   * @returns {Response} - Respuesta de éxito
   */
export function createSuccessResponse(data: any, status: number = 200): Response {
    return new Response(
      JSON.stringify({ 
        success: true, 
        ...data 
      }),
      { 
        status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
}


/**
 * FUNCIÓN: requireAuth
 * Middleware para proteger rutas que requieren autenticación
 * 
 * @param {Function} handler - Función del handler original
 * @returns {Function} - Handler protegido
 */
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