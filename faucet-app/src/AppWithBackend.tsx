import { useState, useEffect } from 'react'
import { WalletButton } from './components/WalletButton'
import { UsersList } from './components/UsersList'
import { TransferTokens } from './components/TransferTokens'
import { AuthButton } from './components/AuthButton'
import { ClaimWithBackend } from './components/ClaimWithBackend'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_CONFIG } from './config/web3'
import { formatUnits } from 'viem'
import { getFaucetStatus } from './services/api'

function AppWithBackend() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'faucet' | 'transfer' | 'users'>('faucet')
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<any>(null)

  // Leer datos básicos del contrato
  const { data: balance, refetch: refetchBalance } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: decimals } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'decimals',
  })

  // Verificar token guardado al cargar
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    const savedAddress = localStorage.getItem('auth_address')
    
    if (savedToken && savedAddress === address) {
      setAuthToken(savedToken)
    } else {
      // Limpiar si cambió de wallet
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_address')
      setAuthToken(null)
    }
  }, [address])

  // Obtener status del backend cuando está autenticado
  useEffect(() => {
    const loadBackendStatus = async () => {
      if (authToken && address) {
        try {
          const status = await getFaucetStatus(address, authToken)
          setBackendStatus(status)
        } catch (error) {
          console.error('Error loading backend status:', error)
        }
      }
    }
    loadBackendStatus()
  }, [authToken, address])

  const handleAuthenticated = (token: string) => {
    setAuthToken(token)
  }

  const handleClaimSuccess = () => {
    refetchBalance()
    // Recargar status del backend
    if (authToken && address) {
      getFaucetStatus(address, authToken).then(setBackendStatus)
    }
  }

  const formatBalance = (value: bigint | undefined) => {
    if (!value || !decimals) return '0'
    const formatted = formatUnits(value, decimals)
    return Number(formatted).toLocaleString('en-US', { 
      maximumFractionDigits: 2,
      minimumFractionDigits: 0 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <p className="text-xs text-gray-500">Sepolia + Backend (SIWE)</p>
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
                  Connect your wallet to authenticate with Sign-In with Ethereum (SIWE) and claim tokens
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Autenticación SIWE */}
        {isConnected && (
          <AuthButton 
            onAuthenticated={handleAuthenticated}
            isAuthenticated={!!authToken}
          />
        )}

        {/* Balance principal */}
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
              {backendStatus && (
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Faucet Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {Number(backendStatus.faucetAmount).toLocaleString()} FT
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Claim Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${backendStatus.hasClaimed ? 'bg-gray-400' : 'bg-green-500'}`}></div>
                      <p className="text-lg font-semibold text-gray-900">
                        {backendStatus.hasClaimed ? 'Claimed' : 'Available'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Claim con backend */}
              {authToken && backendStatus && !backendStatus.hasClaimed && (
                <div className="mt-6">
                  <ClaimWithBackend 
                    authToken={authToken}
                    onClaimSuccess={handleClaimSuccess}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation tabs */}
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
                This faucet uses <strong>Sign-In with Ethereum (SIWE)</strong> for authentication. 
                The backend handles the claim transaction, so you don't pay gas fees!
              </p>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">How it works</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Connect Wallet</p>
                      <p className="text-xs text-gray-500">Connect your MetaMask or compatible wallet</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Authenticate with SIWE</p>
                      <p className="text-xs text-gray-500">Sign a message to prove you own the wallet</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Claim Tokens</p>
                      <p className="text-xs text-gray-500">Backend processes the transaction for you</p>
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

export default AppWithBackend
