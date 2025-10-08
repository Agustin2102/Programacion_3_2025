import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { getAuthMessage, signIn } from '../services/api'

interface AuthButtonProps {
  onAuthenticated: (token: string) => void
  isAuthenticated: boolean
}

export function AuthButton({ onAuthenticated, isAuthenticated }: AuthButtonProps) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async () => {
    if (!address || !isConnected) {
      setError('Por favor, conecta tu wallet primero')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. Obtener mensaje del backend
      console.log('📝 Obteniendo mensaje de autenticación...')
      const message = await getAuthMessage(address)

      // 2. Firmar mensaje con MetaMask
      console.log('✍️ Esperando firma del usuario...')
      const signature = await signMessageAsync({ message })

      // 3. Enviar firma al backend y obtener JWT
      console.log('🔐 Verificando firma y obteniendo token...')
      const { token } = await signIn(message, signature)

      // 4. Guardar token
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_address', address)

      console.log('✅ Autenticación exitosa')
      onAuthenticated(token)

    } catch (err: any) {
      console.error('❌ Error en autenticación:', err)
      if (err.message?.includes('User rejected')) {
        setError('Firma rechazada. Por favor, acepta la firma en MetaMask.')
      } else {
        setError(err.message || 'Error en autenticación')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_address')
    onAuthenticated('')
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="mb-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!isAuthenticated ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Autenticación Requerida</h3>
              <p className="text-sm text-gray-600 mb-4">
                Para reclamar tokens, necesitas firmar un mensaje de autenticación. 
                Esto verifica que controlas esta wallet.
              </p>
              <button
                onClick={handleAuth}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Autenticando...
                  </span>
                ) : (
                  'Firmar para Autenticar'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">Autenticado</p>
                <p className="text-xs text-green-700">Sesión válida por 24 horas</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-white hover:bg-gray-50 border border-green-200 text-green-700 font-medium rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
