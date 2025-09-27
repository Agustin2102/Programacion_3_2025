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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow">
              <span className="text-xl">�</span>
            </div>
            <div>
              <h1 className="text-lg font-extrabold">Token Faucet</h1>
              <p className="text-xs text-gray-500">Sepolia Testnet — tokens gratuitos</p>
            </div>
          </div>

          <nav aria-label="Main navigation" className="flex items-center gap-4">
            <div className="hidden sm:flex sm:gap-2 bg-gray-100 p-1 rounded-lg" role="tablist" aria-label="Sections">
              <button
                role="tab"
                aria-selected={activeTab === 'faucet'}
                onClick={() => setActiveTab('faucet')}
                className={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                  activeTab === 'faucet' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Reclamar
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'transfer'}
                onClick={() => setActiveTab('transfer')}
                className={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                  activeTab === 'transfer' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Transferir
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'users'}
                onClick={() => setActiveTab('users')}
                className={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                  activeTab === 'users' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Comunidad
              </button>
            </div>

            <div>
              <WalletButton />
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Hero + Claim */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl">💧</div>
                <div>
                  <h2 className="text-2xl font-bold">Consigue tokens para test</h2>
                  <p className="text-sm text-gray-500">Reclama tokens gratuitos para probar tus dApps en Sepolia.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Tu balance</div>
                  <div className="text-xl font-semibold mt-2">{balance ? Number(balance).toLocaleString() : '0'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Por reclamo</div>
                  <div className="text-xl font-semibold mt-2">{faucetAmount ? Number(faucetAmount).toLocaleString() : '—'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Estado</div>
                  <div className="text-xl font-semibold mt-2">{hasClaimed ? 'Reclamado' : 'Disponible'}</div>
                </div>
              </div>

              <div className="pt-2">
                <div className="rounded-lg border border-dashed border-gray-200 p-6 bg-gradient-to-b from-white to-gray-50">
                  <h3 className="text-lg font-semibold">Reclamar tokens</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-4">Recibirás los tokens directamente en tu wallet conectada.</p>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <button
                      onClick={handleClaimTokens}
                      disabled={!isConnected || isLoading || !!hasClaimed}
                      className={`inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition ${
                        !isConnected
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                          : isLoading
                          ? 'bg-indigo-300 text-white cursor-wait'
                          : hasClaimed
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow'
                      }`}
                    >
                      {isLoading ? 'Procesando...' : hasClaimed ? 'Ya reclamado' : 'Reclamar ahora'}
                    </button>

                    <div className="mt-3 sm:mt-0 sm:ml-2 text-sm text-gray-500">
                      <strong>{faucetAmount ? Number(faucetAmount).toLocaleString() : '—'}</strong> tokens por reclamo
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabbed content area */}
            <div className="mt-6">
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('faucet')}
                      aria-pressed={activeTab === 'faucet'}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        activeTab === 'faucet' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Reclamar
                    </button>
                    <button
                      onClick={() => setActiveTab('transfer')}
                      aria-pressed={activeTab === 'transfer'}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        activeTab === 'transfer' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Transferir
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      aria-pressed={activeTab === 'users'}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        activeTab === 'users' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Comunidad
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  {activeTab === 'faucet' && (
                    <div className="text-sm text-gray-700">
                      <p className="mb-3">Puedes reclamar tokens una vez por dirección. Si necesitas más tokens para pruebas, usar la función de transferencia o contactar al admin.</p>
                    </div>
                  )}

                  {activeTab === 'transfer' && <TransferTokens />}
                  {activeTab === 'users' && <UsersList />}
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Quick info */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-4 text-sm text-gray-700">
              <h4 className="font-semibold">Consejos rápidos</h4>
              <ul className="mt-2 space-y-2 list-disc list-inside text-gray-600">
                <li>Conecta tu wallet para poder reclamar.</li>
                <li>Verifica la red: Sepolia.</li>
                <li>Las transacciones requieren gas (ETH de prueba).</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow p-4 text-sm text-gray-700">
              <h4 className="font-semibold">Atajo</h4>
              <p className="mt-2">Usa la pestaña Transferir para enviar tokens a faucets locales o a otros desarrolladores.</p>
            </div>
          </aside>
        </section>
      </main>

      <footer className="mt-12 py-8 border-t bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          <div>Desarrollado con ❤️ para la comunidad Web3 — React · TypeScript · Wagmi</div>
        </div>
      </footer>
    </div>
  )
}

export default App
