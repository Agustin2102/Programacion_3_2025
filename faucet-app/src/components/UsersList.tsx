import { useReadContract } from 'wagmi'
import { CONTRACT_CONFIG } from '../config/web3'

export function UsersList() {
  // Leer lista de usuarios que interactuaron con el faucet
  const { data: users, isLoading } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getFaucetUsers',
  })

  // Leer cantidad de tokens por reclamo
  const { data: faucetAmount } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getFaucetAmount',
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-xl flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">Cargando Comunidad...</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold text-gray-900">Nuestra Comunidad</h3>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Conoce a todos los miembros que han reclamado tokens del faucet y forman parte de nuestra creciente comunidad Web3
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="text-5xl font-bold text-green-600 mb-2">
            {users ? users.length : '0'}
          </div>
          <div className="text-green-700 font-semibold text-lg">Miembros Activos</div>
          <div className="text-green-600 text-sm mt-1">Han reclamado tokens</div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8 text-center">
          <div className="text-5xl font-bold text-purple-600 mb-2">
            {faucetAmount ? Number(faucetAmount).toLocaleString() : '0'}
          </div>
          <div className="text-purple-700 font-semibold text-lg">Tokens / Usuario</div>
          <div className="text-purple-600 text-sm mt-1">Reclamo gratuito</div>
        </div>
      </div>
      
      {users && users.length > 0 ? (
        <div className="space-y-6">
          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user, index) => (
              <div key={user} className="group bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl transform hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    #{index + 1}
                  </div>
                  <div className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
                    ✅ Verificado
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-lg font-bold text-gray-900 font-mono">
                    {user.slice(0, 8)}...{user.slice(-6)}
                  </div>
                  <div className="text-xs text-gray-500 font-mono break-all">
                    {user}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user)
                      // Mostrar feedback visual
                      const button = document.activeElement as HTMLElement
                      const originalText = button.innerText
                      button.innerText = '¡Copiado!'
                      setTimeout(() => {
                        button.innerText = originalText
                      }, 1000)
                    }}
                    className="w-full bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 py-2 px-4 rounded-xl transition-all duration-200 text-sm font-medium"
                  >
                    📋 Copiar Dirección
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">
                Mostrando todos los {users.length} miembros que han reclamado tokens
              </span>
            </div>
            <p className="text-blue-600 text-sm mt-2">
              Cada miembro ha reclamado {faucetAmount ? Number(faucetAmount).toLocaleString() : '1,000,000'} tokens gratuitos
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 space-y-6 max-w-2xl mx-auto">
          <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="space-y-3">
            <h4 className="text-2xl font-bold text-gray-900">¡Sé el Primero!</h4>
            <p className="text-gray-600 text-lg leading-relaxed">
              Aún no hay miembros en la comunidad. Conecta tu wallet y reclama tokens gratuitos para convertirte en el primer miembro.
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
            <div className="text-4xl mb-3">🚀</div>
            <h5 className="font-semibold text-gray-900 mb-2">¿Listo para comenzar?</h5>
            <p className="text-gray-600 text-sm">
              Conecta tu wallet y reclama {faucetAmount ? Number(faucetAmount).toLocaleString() : '1,000,000'} tokens completamente gratis
            </p>
          </div>
        </div>
      )}
    </div>
  )
}