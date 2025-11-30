/**
 * VALIDACIONES: Esquemas de Zod
 * 
 * PROPÓSITO:
 * Definir esquemas de validación para todas las operaciones
 * de autenticación y autorización
 * 
 * FUNCIONALIDADES:
 * - Validación de datos de entrada
 * - Mensajes de error personalizados
 * - Transformaciones de datos
 * - Validaciones complejas
 */

import {z} from 'zod';

// ESQUEMA: Registro de usuario
export const registerSchema = z.object({
    email: z
        .string()
        .min(1, {message: 'El email es requerido'})
        .email({message: 'Formato de email inválido'})
        .toLowerCase()
        .trim(),

    name: z
        .string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(20, 'El nombre debe tener menos de 20 caracteres')
        .trim(),
    
    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(20, 'La contraseña debe tener menos de 20 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
            'La contraseña debe tener al menos una letra mayúscula, una letra minúscula, un número y un caracter especial')

});

// ESQUEMA: Login de usuario
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, {message: 'El email es requerido'})
        .email({message: 'Formato de email inválido'})
        .toLowerCase()
        .trim(),
    
    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
});

// ESQUEMA: Actualización de perfil
export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(20, 'El nombre debe tener menos de 20 caracteres')
        .trim()
        .optional(),

    email: z
        .string()
        .min(1, {message: 'El email es requerido'})
        .email({message: 'Formato de email inválido'})
        .toLowerCase()
        .trim()
        .optional(),

});

// ESQUEMA: Cambio de contraseña
export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(1, 'La contraseña actual es requerida'),
    
    newPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(20, 'La contraseña debe tener menos de 20 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
        'La contraseña debe tener al menos una letra mayúscula, una letra minúscula, un número y un caracter especial')

});

// ESQUEMA: Reseña
export const reviewSchema = z.object({
    bookId: z
        .string()
        .min(1, 'El ID del libro es requerido'),
    
    rating: z
        .number()
        .int('La calificación debe ser un número entero')
        .min(1, 'La calificación mínima es 1')
        .max(5, 'La calificación máxima es 5'),
    
    reviewText: z
        .string()
        .min(10, 'La reseña debe tener al menos 10 caracteres')
        .max(1000, 'La reseña no puede exceder 1000 caracteres')
        .trim(),
});

// ESQUEMA: Voto
export const voteSchema = z.object({
    reviewId: z
      .string()
      .min(1, 'El ID de la reseña es requerido'),

    voteType: z
      .enum(['UP', 'DOWN'], {
        message: 'El tipo de voto debe ser UP o DOWN'
      }),
});

// ESQUEMA: Lista de lectura
export const readingListSchema = z.object({
    name: z
      .string()
      .min(1, 'El nombre de la lista es requerido')
      .max(50, 'El nombre no puede exceder 50 caracteres')
      .trim(),

    description: z
      .string()
      .max(200, 'La descripción no puede exceder 200 caracteres')
      .trim()
      .optional(),

    isPublic: z
      .boolean()
      .default(false),
  });


// TIPOS: Exportar tipos TypeScript inferidos
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type ReadingListInput = z.infer<typeof readingListSchema>;