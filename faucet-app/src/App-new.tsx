import { useState } from 'react'
import { WalletButton } from './components/WalletButton'
import { UsersList } from './components/UsersList'
import { TransferTokens } from './components/TransferTokens'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { CONTRACT_CONFIG } from './config/web3'

function App() {
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'faucet' | 'transfer' | 'users'>('faucet')

  // Lecturas desde el contrato (mantener la lógica existente)
  const { data: hasClaimed } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'hasAddressClaimed',
    args: address ? [address] : undefined,
  })

  const { data: balance } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: faucetAmount } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getFaucetAmount',
  })

  // Escrituras (claim)
  const { writeContract } = useWriteContract()

  const handleClaimTokens = async () => {
    if (!isConnected) return
    setIsLoading(true)
    try {
      await writeContract({
        ...CONTRACT_CONFIG,
        functionName: 'claimTokens',
      })
    } catch (error) {
      console.error('Error al reclamar tokens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header estilo wallet moderno */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm font-bold">W</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Wallet</h1>
              </div>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Balance principal - inspirado en la imagen */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {balance ? `${Number(balance).toLocaleString()} $` : '0 $'}
            </div>
            <div className="text-sm text-gray-500 mb-3">
              ≈ {balance ? (Number(balance) * 0.000001).toFixed(8) : '0.00000000'} BTC
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="flex -space-x-1">
                <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white"></div>
                <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-xs text-gray-500">+4</span>
            </div>
          </div>
        </div>

        {/* Stats cards - como en la imagen */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Por reclamo</div>
            <div className="text-xl font-semibold text-gray-900">
              {faucetAmount ? `${Number(faucetAmount).toLocaleString()} $` : '—'}
            </div>
            <div className="text-xs text-gray-400">
              {faucetAmount ? `${Math.floor(Number(faucetAmount) / 1000)}k tokens` : 'Cargando...'}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Estado</div>
            <div className="text-xl font-semibold text-gray-900">
              {hasClaimed ? 'Reclamado' : 'Disponible'}
            </div>
            <div className="text-xs text-gray-400">
              {hasClaimed ? 'Ya usado' : 'Listo para usar'}
            </div>
          </div>
        </div>

        {/* Banner de reclamo - estilo promocional como en la imagen */}
        {!hasClaimed && isConnected && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold mb-1">¡OBTÉN 1000 TOKENS GRATIS!</div>
                <div className="text-sm text-green-100">Reclama tus tokens ahora</div>
              </div>
              <button
                onClick={handleClaimTokens}
                disabled={isLoading}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
              >
                {isLoading ? 'Procesando...' : 'Reclamar'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation tabs - minimalista */}
        <div className="bg-white rounded-2xl p-1 shadow-sm">
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveTab('faucet')}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'faucet' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Faucet
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'transfer' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Transferir
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'users' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Usuarios
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="bg-white rounded-2xl shadow-sm">
          {activeTab === 'faucet' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reclamar Tokens</h3>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Puedes reclamar tokens gratuitos una vez por dirección. Los tokens se enviarán directamente a tu wallet.
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Cantidad disponible</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {faucetAmount ? Number(faucetAmount).toLocaleString() : '1,000,000'} tokens
                      </div>
                    </div>
                    <button
                      onClick={handleClaimTokens}
                      disabled={!isConnected || isLoading || !!hasClaimed}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        !isConnected
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isLoading
                          ? 'bg-blue-100 text-blue-600 cursor-wait'
                          : hasClaimed
                          ? 'bg-green-100 text-green-600 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isLoading ? 'Procesando...' : hasClaimed ? 'Reclamado' : 'Reclamar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transfer' && <TransferTokens />}
          {activeTab === 'users' && <UsersList />}
        </div>

        {/* Actions bottom bar - como en la imagen de wallet */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <span className="text-xs text-gray-600 font-medium">Recibir</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <span className="text-xs text-gray-600 font-medium">Comprar</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <span className="text-xs text-gray-600 font-medium">Swap</span>
            </button>
            <button 
              onClick={() => setActiveTab('transfer')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <span className="text-xs text-gray-600 font-medium">Enviar</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App