import {useAccount, useDisconnect} from 'wagmi'

export function WalletButton(){
    const {address, isConnected} = useAccount()
    const {disconnect} = useDisconnect()

    const handleConnect = () => {
        import('../config/web3').then(({ web3Modal }) => {
            web3Modal.open()
        })
    }

    if(isConnected && address) {
        return(
            <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-700">Connected</span>
                </div>
                <button 
                    onClick={() => disconnect()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 font-mono text-sm rounded-lg transition-colors"
                >
                    {address.slice(0, 6)}...{address.slice(-4)}
                </button>
            </div>
        )
    }

    return (
        <button 
            onClick={handleConnect} 
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded-lg transition-colors"
        >
            Connect Wallet
        </button>
    )
}