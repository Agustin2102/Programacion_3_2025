import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import faucetRoutes from './routes/faucet.js'

// Configurar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/faucet', faucetRoutes)

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString()
  })
})

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint no encontrado' 
  })
})

// Manejo global de errores
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no manejado:', error)
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor' 
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend ejecutándose en http://localhost:${PORT}`)
  console.log(`📊 Ambiente: ${process.env.NODE_ENV}`)
  console.log(`🔗 Frontend permitido: ${process.env.FRONTEND_URL}`)
})

// Manejo de señales de terminación
process.on('SIGINT', () => {
  console.log('👋 Cerrando servidor...')
  process.exit(0)
})

export default app