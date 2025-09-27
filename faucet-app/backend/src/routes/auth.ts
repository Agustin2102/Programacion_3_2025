import express, { Request, Response } from 'express'
import { SiweMessage } from 'siwe'
import { generateToken } from '../middleware/auth.js'
import { AuthMessage, AuthSignin, NonceData, ApiResponse, AuthResponse } from '../types/index.js'

const router = express.Router()

// Almacén temporal para nonces (en producción usar Redis o base de datos)
const nonces = new Map<string, NonceData>()

// POST /auth/message - Generar mensaje para firmar
router.post('/message', (req: Request<{}, ApiResponse<{ message: string; nonce: string }>, AuthMessage>, res: Response) => {
  try {
    const { address } = req.body

    if (!address) {
      res.status(400).json({ 
        success: false, 
        message: 'Dirección requerida' 
      })
      return
    }

    // Generar nonce único
    const nonce = Math.random().toString(36).substring(2, 15)
    
    // Crear mensaje SIWE
    const siweMessage = new SiweMessage({
      domain: req.get('host') || 'localhost',
      address: address,
      statement: 'Iniciar sesión en Faucet Token App',
      uri: req.protocol + '://' + req.get('host'),
      version: '1',
      chainId: 11155111, // Sepolia
      nonce: nonce,
      issuedAt: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutos
    })

    // Guardar nonce para validación posterior
    nonces.set(nonce, {
      address: address.toLowerCase(),
      timestamp: Date.now()
    })

    res.json({
      success: true,
      data: {
        message: siweMessage.prepareMessage(),
        nonce: nonce
      }
    })

  } catch (error) {
    console.error('Error generating SIWE message:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    })
  }
})

// POST /auth/signin - Verificar firma y generar JWT
router.post('/signin', async (req: Request<{}, ApiResponse<AuthResponse>, AuthSignin>, res: Response) => {
  try {
    const { message, signature } = req.body

    if (!message || !signature) {
      res.status(400).json({ 
        success: false, 
        message: 'Mensaje y firma requeridos' 
      })
      return
    }

    // Parsear mensaje SIWE
    const siweMessage = new SiweMessage(message)
    
    // Verificar que el nonce existe y es válido
    const nonceData = nonces.get(siweMessage.nonce)
    if (!nonceData) {
      res.status(400).json({ 
        success: false, 
        message: 'Nonce inválido o expirado' 
      })
      return
    }

    // Verificar que el nonce no haya expirado (10 minutos)
    if (Date.now() - nonceData.timestamp > 10 * 60 * 1000) {
      nonces.delete(siweMessage.nonce)
      res.status(400).json({ 
        success: false, 
        message: 'Nonce expirado' 
      })
      return
    }

    // Verificar la firma
    const fields = await siweMessage.verify({ signature })
    
    if (!fields.success) {
      res.status(400).json({ 
        success: false, 
        message: 'Firma inválida' 
      })
      return
    }

    // Limpiar nonce usado
    nonces.delete(siweMessage.nonce)

    // Generar JWT
    const token = generateToken(siweMessage.address)

    res.json({
      success: true,
      data: {
        token: token,
        address: siweMessage.address.toLowerCase()
      }
    })

  } catch (error) {
    console.error('Error verifying SIWE signature:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    })
  }
})

export default router