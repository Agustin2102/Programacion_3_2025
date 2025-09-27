import {useAccount, useDisconnect} from 'wagmi'

export function WalletButton(){
    const {address, isConnected} = useAccount()
    const {disconnect} = useDisconnect()

    const handleConnect = () => {
        // Se importa dinámicamente web3Modal
        import('../config/web3').then(({ web3Modal }) => {
            web3Modal.open()
        })
    }

    if(isConnected && address) {
        return(
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="w-16 h-16 bg-green-500 rounded-2xl shadow-lg flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                        </div>
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-green-600 font-semibold text-sm">✅ Conectado</span>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                            <div className="font-mono text-2xl font-bold text-gray-900 mb-1">
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </div>
                            <div className="text-xs text-gray-500 font-mono max-w-xs truncate">
                                {address}
                            </div>
                            <div className="text-sm text-green-600 font-medium mt-1">
                                Sepolia Testnet
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                        <button 
                            onClick={() => navigator.clipboard.writeText(address)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg text-sm"
                        >
                            📋 Copiar Dirección
                        </button>
                        <button 
                            onClick={() => disconnect()}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg text-sm"
                        >
                            🔌 Desconectar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="text-center mb-8">
            <div className="space-y-6">
                <div className="relative">
                    <button 
                        onClick={handleConnect} 
                        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                    >
                        <div className="absolute inset-0 w-full h-full transition duration-300 transform -translate-x-1 -translate-y-1 bg-purple-800 rounded-2xl group-hover:translate-x-0 group-hover:translate-y-0"></div>
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl"></div>
                        <div className="relative flex items-center space-x-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                            <span>Conectar Wallet</span>
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                        <div className="text-2xl mb-2">🦊</div>
                        <div className="font-semibold text-gray-900 text-sm">MetaMask</div>
                        <div className="text-xs text-gray-500">Más popular</div>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                        <div className="text-2xl mb-2">🔗</div>
                        <div className="font-semibold text-gray-900 text-sm">WalletConnect</div>
                        <div className="text-xs text-gray-500">Móvil</div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <div className="text-2xl mb-2">⚡</div>
                        <div className="font-semibold text-gray-900 text-sm">Otros</div>
                        <div className="text-xs text-gray-500">Compatible</div>
                    </div>
                </div>

                <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Conecta tu wallet para acceder a todas las funcionalidades de la plataforma de forma segura
                </p>
            </div>
        </div>
    )

}