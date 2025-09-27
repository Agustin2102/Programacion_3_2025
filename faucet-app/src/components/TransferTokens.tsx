import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { CONTRACT_CONFIG } from '../config/web3'
import { parseUnits, isAddress } from 'viem'

export function TransferTokens() {
  const { address, isConnected } = useAccount()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Leer balance del usuario
  const { data: balance } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { writeContract } = useWriteContract()

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !recipient || !amount) return

    // Validaciones
    if (!isAddress(recipient)) {
      alert('La dirección del destinatario no es válida')
      return
    }

    const transferAmount = parseUnits(amount, 18) // Asumiendo 18 decimales
    if (balance && transferAmount > balance) {
      alert('No tienes suficientes tokens para esta transferencia')
      return
    }

    setIsLoading(true)
    try {
      await writeContract({
        ...CONTRACT_CONFIG,
        functionName: 'transfer',
        args: [recipient, transferAmount],
      })
      
      // Limpiar formulario
      setRecipient('')
      setAmount('')
      alert('Transferencia iniciada correctamente!')
      
    } catch (error) {
      console.error('Error en la transferencia:', error)
      alert('Error al realizar la transferencia')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) return null

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold text-gray-900">Transferir Tokens</h3>
        <p className="text-gray-600 max-w-lg mx-auto">
          Envía tokens a cualquier dirección de Ethereum de forma segura e instantánea
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 text-center">
        <div className="text-sm text-gray-600 mb-2">Tu balance disponible</div>
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {balance ? Number(balance).toLocaleString() : '0'}
        </div>
        <div className="text-purple-600 font-semibold">Tokens</div>
      </div>

      {/* Transfer Form */}
      <form onSubmit={handleTransfer} className="space-y-6">
        {/* Recipient Input */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Dirección del destinatario
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className={`w-full pl-12 pr-4 py-4 bg-white border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm transition-all ${
                recipient && !isAddress(recipient) 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              required
            />
            {recipient && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {isAddress(recipient) ? (
                  <div className="text-green-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="text-red-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            )}
          </div>
          {recipient && !isAddress(recipient) && (
            <p className="text-red-500 text-sm mt-1">⚠️ Dirección no válida</p>
          )}
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Cantidad de tokens
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              min="0"
              step="0.000000000000000001"
              className="w-full pl-12 pr-20 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setAmount(balance ? balance.toString() : '0')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Cantidades rápidas
          </label>
          <div className="grid grid-cols-4 gap-3">
            {['100', '1000', '5000', '10000'].map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount)}
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 border border-gray-200 hover:border-gray-300 rounded-xl text-gray-700 hover:text-gray-900 transition-all duration-200 font-semibold text-sm"
              >
                {Number(quickAmount).toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !recipient || !amount || !isAddress(recipient)}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform ${
            isLoading || !recipient || !amount || !isAddress(recipient)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl hover:scale-105'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Procesando transferencia...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Enviar Tokens</span>
            </div>
          )}
        </button>
      </form>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 mt-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Información importante</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Las transferencias son irreversibles</li>
              <li>• Verifica la dirección del destinatario</li>
              <li>• Las transacciones pueden tardar unos minutos</li>
              <li>• Se requiere ETH para pagar las tarifas de gas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}