import React from 'react'
import ReactDOM from 'react-dom/client'
import AppWithBackend from './AppWithBackend.tsx'
import './index.css'

// Imports para Web3
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/web3.ts'

// Crear cliente para manejar las consultas
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppWithBackend />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)