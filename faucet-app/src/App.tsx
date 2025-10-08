import { useState, useEffect } from 'react'
import { WalletButton } from './components/WalletButton'
import { UsersList } from './components/UsersList'
import { TransferTokens } from './components/TransferTokens'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi'
import { CONTRACT_CONFIG } from './config/web3'
import { formatUnits } from 'viem'

function App() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'faucet' | 'transfer' | 'users'>('faucet')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Lecturas desde el contrato
  const { data: hasClaimed, refetch: refetchHasClaimed } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'hasAddressClaimed',
    args: address ? [address] : undefined,
  })

  const { data: balance, refetch: refetchBalance } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: faucetAmount } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getFaucetAmount',
  })

  const { data: decimals } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'decimals',
  })

  // Verificar balance de ETH para gas
  const { data: ethBalance } = useBalance({
    address: address,
  })

  // Escrituras (claim)
  const { data: hash, writeContract, isPending: isWritePending, error: writeError } = useWriteContract()

  // Esperar confirmación de la transacción
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const isLoading = isWritePending || isConfirming

  // Efecto para manejar éxito de transacción
  useEffect(() => {
    if (isConfirmed) {
      setSuccessMessage('¡Tokens reclamados exitosamente! 🎉')
      setErrorMessage(null)
      // Refrescar datos
      refetchHasClaimed()
      refetchBalance()
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000)
    }
  }, [isConfirmed, refetchHasClaimed, refetchBalance])

  // Efecto para manejar errores
  useEffect(() => {
    if (writeError) {
      console.error('Error al reclamar tokens:', writeError)
      
      // Mensajes de error específicos
      const errorMsg = writeError.message.toLowerCase()
      if (errorMsg.includes('insufficient funds') || errorMsg.includes('insufficient balance')) {
        setErrorMessage('⚠️ No tienes suficiente ETH para pagar el gas. Obtén ETH de Sepolia en: https://sepoliafaucet.com/')
      } else if (errorMsg.includes('user rejected') || errorMsg.includes('user denied')) {
        setErrorMessage('❌ Transacción rechazada. Intenta nuevamente.')
      } else if (errorMsg.includes('already claimed')) {
        setErrorMessage('⚠️ Ya has reclamado tokens anteriormente.')
      } else {
        setErrorMessage(`❌ Error: ${writeError.message.slice(0, 100)}...`)
      }
      
      // Limpiar mensaje después de 8 segundos
      setTimeout(() => setErrorMessage(null), 8000)
    }
  }, [writeError])

  const handleClaimTokens = async () => {
    if (!isConnected) {
      setErrorMessage('⚠️ Por favor, conecta tu wallet primero.')
      return
    }

    // Validar ETH para gas
    if (ethBalance && ethBalance.value === 0n) {
      setErrorMessage('⚠️ No tienes ETH para pagar el gas. Obtén ETH de Sepolia en: https://sepoliafaucet.com/')
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      writeContract({
        ...CONTRACT_CONFIG,
        functionName: 'claimTokens',
      })
    } catch (error) {
      console.error('Error al iniciar claim:', error)
    }
  }

  const formatBalance = (value: bigint | undefined) => {
    if (!value || !decimals) return '0'
    // Convertir de wei (unidad pequeña) a tokens (unidad normal)
    const formatted = formatUnits(value, decimals)
    // Formatear con separadores de miles
    return Number(formatted).toLocaleString('en-US', { 
      maximumFractionDigits: 2,
      minimumFractionDigits: 0 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header minimalista y limpio */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Token Faucet</h1>
                <p className="text-xs text-gray-500">Sepolia Testnet</p>
              </div>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Estado de conexión */}
        {!isConnected && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Connect your wallet</h3>
                <p className="text-sm text-gray-600">
                  Connect your wallet to claim free tokens and start transferring
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de error global */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800 flex-1">{errorMessage}</p>
              <button onClick={() => setErrorMessage(null)} className="text-red-600 hover:text-red-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Mensaje de éxito global */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-800 flex-1">{successMessage}</p>
              <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Alerta de bajo ETH */}
        {isConnected && ethBalance && ethBalance.value < 100000000000000n && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 mb-1">ETH bajo para gas fees</p>
                <p className="text-xs text-yellow-700">
                  Tu balance: {ethBalance ? formatUnits(ethBalance.value, 18).slice(0, 8) : '0'} ETH. 
                  Necesitas ETH de Sepolia para pagar transacciones.{' '}
                  <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                    Obtener ETH aquí
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Balance principal - diseño minimalista */}
        {isConnected && (
          <div className="mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 mb-2">Your Balance</p>
                <h2 className="text-5xl font-bold text-gray-900 mb-1">
                  {formatBalance(balance)}
                </h2>
                <p className="text-sm text-gray-500">FT Tokens</p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Faucet Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatBalance(faucetAmount)} FT
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Claim Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${hasClaimed ? 'bg-gray-400' : 'bg-green-500'}`}></div>
                    <p className="text-lg font-semibold text-gray-900">
                      {hasClaimed ? 'Claimed' : 'Available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Claim button */}
              {!hasClaimed && (
                <div className="space-y-3">
                  <button
                    onClick={handleClaimTokens}
                    disabled={isLoading || (ethBalance && ethBalance.value === 0n)}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isWritePending ? 'Esperando confirmación...' : 'Procesando transacción...'}
                      </span>
                    ) : (
                      'Claim Free Tokens'
                    )}
                  </button>
                  
                  {/* Info sobre hash de transacción */}
                  {hash && (
                    <div className="text-center">
                      <a
                        href={`https://sepolia.etherscan.io/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        Ver transacción en Etherscan →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation tabs - diseño sobrio */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setActiveTab('faucet')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'faucet'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Faucet
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'transfer'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Transfer
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'users'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Users
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="bg-white border border-gray-200 rounded-xl">
          {activeTab === 'faucet' && (
            <div className="p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About the Faucet</h3>
              <p className="text-gray-600 mb-6">
                Claim free testnet tokens to experiment with transfers and blockchain interactions.
                Each address can claim once.
              </p>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">One-time claim</p>
                      <p className="text-xs text-gray-500">Once per address</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Instant delivery</p>
                      <p className="text-xs text-gray-500">Tokens sent directly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Secure</p>
                      <p className="text-xs text-gray-500">Verified smart contract</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transfer' && <TransferTokens />}
          {activeTab === 'users' && <UsersList />}
        </div>
      </main>
    </div>
  )
}

export default App