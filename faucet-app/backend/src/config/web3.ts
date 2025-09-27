import { ethers } from 'ethers'
import dotenv from 'dotenv'

dotenv.config()

// Validar variables de entorno
if (!process.env.RPC_URL) {
  throw new Error('RPC_URL no está definida en las variables de entorno')
}

if (!process.env.PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY no está definida en las variables de entorno')
}

if (!process.env.CONTRACT_ADDRESS) {
  throw new Error('CONTRACT_ADDRESS no está definida en las variables de entorno')
}

// Configuración del proveedor RPC
export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)

// Wallet para realizar transacciones (pagar gas)
export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

// ABI del contrato (las mismas funciones que en el frontend)
export const CONTRACT_ABI = [
  // Funciones del Faucet
  {
    name: 'claimTokens',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'hasAddressClaimed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'bool' }]
  },
  {
    name: 'getFaucetUsers',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address[]' }]
  },
  {
    name: 'getFaucetAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  },
  // Funciones ERC20
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }]
  }
] as const

// Instancia del contrato
export const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  CONTRACT_ABI,
  wallet
)