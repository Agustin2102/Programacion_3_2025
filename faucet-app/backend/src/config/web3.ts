import { ethers } from 'ethers'
import dotenv from 'dotenv'

dotenv.config()

export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com')

let walletInstance: ethers.Wallet | null = null

if (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== 'your_private_key_here') {
  try {
    walletInstance = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  } catch (error) {
    console.error('Error wallet:', error)
  }
}

export const wallet = walletInstance

const CONTRACT_ABI = [
  { name: 'claimTokens', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'hasAddressClaimed', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'bool' }] },
  { name: 'getFaucetUsers', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address[]' }] },
  { name: 'getFaucetAmount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] }
] as const

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x3e2117c19a921507ead57494bbf29032f33c7412'

export const contract = wallet ? new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet) : new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
