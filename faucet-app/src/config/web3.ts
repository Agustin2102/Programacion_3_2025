// Configuración de Web3 - Aquí definimos todo lo necesario para conectarnos a la blockchain
import { defaultWagmiConfig } from '@web3modal/wagmi'
import { createWeb3Modal } from '@web3modal/wagmi'
import { sepolia } from 'viem/chains'

// 1. Tu Project ID de WalletConnect
const projectId = '8aa894a975b4086025cf036f0a001188' // ID para conectar wallets

// 2. Metadatos de tu aplicación (es lo que se mostrará en la wallet al conectar)
const metadata = {
  name: 'Faucet Token App',
  description: 'Aplicación para reclamar tokens gratuitos',
  url: 'https://localhost:5173', // URL de tu app
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 3. Configuración de las redes que queremos usar
const chains = [sepolia] as const // Solo usaremos Sepolia (red de pruebas)

// 4. Configuración de Wagmi
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata
})

// 5. Crear el modal de Web3Modal
export const web3Modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false // Opcional: deshabilitar analytics
})

// 6. Información del contrato inteligente
export const CONTRACT_CONFIG = {
  address: '0x3e2117c19a921507ead57494bbf29032f33c7412' as const,
  abi: [
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
      name: 'decimals',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ type: 'uint8' }]
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
    },
    {
      name: 'approve',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ type: 'bool' }]
    },
    {
      name: 'allowance',
      type: 'function',
      stateMutability: 'view',
      inputs: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' }
      ],
      outputs: [{ type: 'uint256' }]
    }
  ]
} as const