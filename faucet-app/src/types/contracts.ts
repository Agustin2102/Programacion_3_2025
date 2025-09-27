// Tipos para las funciones del contrato
export interface FaucetUser {
  address: string
  claimedAt?: Date
}

export interface ContractRead {
  hasClaimed: boolean
  balance: bigint
  faucetAmount: bigint
  users: string[]
}

export interface TransferParams {
  to: string
  amount: bigint
}

export interface ApprovalParams {
  spender: string
  amount: bigint
}

// Estados de la aplicación
export type AppTab = 'faucet' | 'transfer' | 'users'

export interface TransactionStatus {
  isLoading: boolean
  isSuccess: boolean
  error: string | null
}