import express, { Response } from 'express'
import { contract } from '../config/web3.js'
import { authenticateToken } from '../middleware/auth.js'
import { AuthenticatedRequest, ApiResponse, FaucetStatus, FaucetUsersResponse } from '../types/index.js'

const router = express.Router()

// POST /faucet/claim - Reclamar tokens (protegido)
router.post('/claim', authenticateToken, async (req: AuthenticatedRequest, res: Response<ApiResponse<{ txHash: string }>>) => {
  try {
    const userAddress = req.user?.address

    if (!userAddress) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      })
      return
    }

    // Verificar si el usuario ya reclamó tokens
    const hasClaimed = await contract.hasAddressClaimed(userAddress)
    
    if (hasClaimed) {
      res.status(400).json({
        success: false,
        message: 'Esta dirección ya reclamó tokens'
      })
      return
    }

    // Ejecutar la transacción de reclamo
    const tx = await contract.claimTokens()
    await tx.wait() // Esperar confirmación

    res.json({
      success: true,
      message: 'Tokens reclamados exitosamente',
      data: { txHash: tx.hash }
    })

  } catch (error: any) {
    console.error('Error claiming tokens:', error)
    
    // Manejar diferentes tipos de errores
    if (error.code === 'CALL_EXCEPTION') {
      res.status(400).json({
        success: false,
        message: 'Error en el contrato: ' + error.reason
      })
      return
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /faucet/status/:address - Obtener estado del faucet (protegido)
router.get('/status/:address', authenticateToken, async (req: AuthenticatedRequest, res: Response<ApiResponse<FaucetStatus>>) => {
  try {
    const { address } = req.params
    const userAddress = req.user?.address

    if (!userAddress) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      })
      return
    }

    // Verificar que el usuario solo puede consultar su propia dirección
    if (address.toLowerCase() !== userAddress) {
      res.status(403).json({
        success: false,
        message: 'Solo puedes consultar tu propia dirección'
      })
      return
    }

    // Obtener información del contrato
    const [hasClaimed, balance, users, faucetAmount] = await Promise.all([
      contract.hasAddressClaimed(address),
      contract.balanceOf(address),
      contract.getFaucetUsers(),
      contract.getFaucetAmount()
    ])

    res.json({
      success: true,
      data: {
        address: address.toLowerCase(),
        hasClaimed: hasClaimed,
        balance: balance.toString(),
        faucetAmount: faucetAmount.toString(),
        totalUsers: users.length,
        users: users.map((addr: string) => addr.toLowerCase())
      }
    })

  } catch (error) {
    console.error('Error getting faucet status:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /faucet/users - Obtener lista completa de usuarios (protegido)
router.get('/users', authenticateToken, async (req: AuthenticatedRequest, res: Response<ApiResponse<FaucetUsersResponse>>) => {
  try {
    const users = await contract.getFaucetUsers()
    const faucetAmount = await contract.getFaucetAmount()

    // Obtener balances de todos los usuarios (opcional, puede ser lento)
    const usersWithBalances = await Promise.all(
      users.map(async (userAddress: string) => {
        try {
          const balance = await contract.balanceOf(userAddress)
          return {
            address: userAddress.toLowerCase(),
            balance: balance.toString()
          }
        } catch (error) {
          return {
            address: userAddress.toLowerCase(),
            balance: '0'
          }
        }
      })
    )

    res.json({
      success: true,
      data: {
        totalUsers: users.length,
        faucetAmount: faucetAmount.toString(),
        users: usersWithBalances
      }
    })

  } catch (error) {
    console.error('Error getting users:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

export default router