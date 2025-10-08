import { useState } from 'react'
import { useAccount } from 'wagmi'
import { claimTokens } from '../services/api'

interface ClaimWithBackendProps {
  authToken: string | null
  onClaimSuccess: () => void
}

export function ClaimWithBackend({ authToken, onClaimSuccess }: ClaimWithBackendProps) {
  const { isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const handleClaim = async () => {
    if (!authToken) {
      setError('Debes autenticarte primero')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setTxHash(null)

    try {
      console.log('🚀 Enviando solicitud de claim al backend...')
      const hash = await claimTokens(authToken)
      
      setTxHash(hash)
      setSuccess('¡Tokens reclamados exitosamente! El backend procesó tu transacción.')
      console.log('✅ Claim exitoso:', hash)
      
      // Esperar un poco y refrescar
      setTimeout(() => {
        onClaimSuccess()
      }, 3000)

    } catch (err: any) {
      console.error('❌ Error en claim:', err)
      setError(err.message || 'Error reclamando tokens')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected || !authToken) {
    return null
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 mb-2">{success}</p>
              {txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-700 hover:text-green-800 underline"
                >
                  Ver transacción en Etherscan →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleClaim}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando en el backend...
          </span>
        ) : (
          'Reclamar Tokens (vía Backend)'
        )}
      </button>

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>Backend maneja el claim:</strong> El servidor firma y envía la transacción por ti. 
          No necesitas aprobar nada en MetaMask para este paso.
        </p>
      </div>
    </div>
  )
}
