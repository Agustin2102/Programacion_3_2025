import { Request } from 'express'

// Extender Request para incluir información del usuario autenticado
export interface AuthenticatedRequest extends Request {
  user?: {
    address: string
  }
}

// Tipos para las respuestas de la API
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
}

// Tipos para autenticación
export interface AuthMessage {
  address: string
}

export interface AuthSignin {
  message: string
  signature: string
}

export interface AuthResponse {
  token: string
  address: string
}

// Tipos para el faucet
export interface FaucetStatus {
  address: string
  hasClaimed: boolean
  balance: string
  faucetAmount: string
  totalUsers: number
  users: string[]
}

export interface UserWithBalance {
  address: string
  balance: string
}

export interface FaucetUsersResponse {
  totalUsers: number
  faucetAmount: string
  users: UserWithBalance[]
}

// Tipos para nonces (almacén temporal)
export interface NonceData {
  address: string
  timestamp: number
}