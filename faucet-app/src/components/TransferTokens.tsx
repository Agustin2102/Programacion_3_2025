import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { CONTRACT_CONFIG } from '../config/web3'
import { parseUnits, isAddress, formatUnits } from 'viem'

export function TransferTokens() {
  const { address, isConnected } = useAccount()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Leer balance del usuario
  const { data: balance } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Leer decimales
  const { data: decimals } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'decimals',
  })

  const { writeContract } = useWriteContract()

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !recipient || !amount || !decimals) return

    // Validaciones
    if (!isAddress(recipient)) {
      alert('Invalid recipient address')
      return
    }

    const transferAmount = parseUnits(amount, decimals)
    if (balance && transferAmount > balance) {
      alert('Insufficient token balance')
      return
    }

    setIsLoading(true)
    setSuccess(false)
    try {
      await writeContract({
        ...CONTRACT_CONFIG,
        functionName: 'transfer',
        args: [recipient, transferAmount],
      })
      
      setRecipient('')
      setAmount('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
    } catch (error) {
      console.error('Transfer error:', error)
      alert('Transfer failed. Please try again.')
    } finally {
      setIsLoading(false)
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

  const handleMaxClick = () => {
    if (balance && decimals) {
      const formatted = formatUnits(balance, decimals)
      setAmount(formatted)
    }
  }

  if (!isConnected) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-gray-600">Connect your wallet to transfer tokens</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Transfer Tokens</h3>
        <p className="text-sm text-gray-600">
          Send tokens to any Ethereum address
        </p>
      </div>

      {/* Balance display */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-lg">
        <p className="text-xs font-medium text-gray-500 mb-1">Available Balance</p>
        <p className="text-2xl font-bold text-gray-900">{formatBalance(balance)} FT</p>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-green-800">Transfer initiated successfully!</p>
          </div>
        </div>
      )}

      {/* Transfer form */}
      <form onSubmit={handleTransfer} className="space-y-6">
        {/* Recipient */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className={`w-full px-4 py-3 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 transition-all ${
              recipient && !isAddress(recipient)
                ? 'border-red-300 bg-red-50 focus:ring-red-200'
                : 'border-gray-200 bg-white focus:ring-blue-200 focus:border-blue-400'
            }`}
            required
          />
          {recipient && !isAddress(recipient) && (
            <p className="mt-1 text-xs text-red-600">Invalid Ethereum address</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <button
              type="button"
              onClick={handleMaxClick}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Use Max
            </button>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            min="0"
            step="0.000000000000000001"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            required
          />
        </div>

        {/* Quick amounts */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Amount</p>
          <div className="grid grid-cols-4 gap-2">
            {['100', '1000', '10000', '100000'].map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount)}
                className="py-2 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                {Number(quickAmount) >= 1000 
                  ? `${Number(quickAmount) / 1000}k` 
                  : quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || !recipient || !amount || !isAddress(recipient)}
          className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Send Tokens'
          )}
        </button>
      </form>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Important</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Transfers are irreversible</li>
              <li>• Verify the recipient address carefully</li>
              <li>• ETH required for gas fees</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}