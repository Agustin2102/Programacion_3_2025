# 🪙 Token Faucet App - Web3 DApp

Una aplicación descentralizada (DApp) de Faucet de tokens ERC-20 construida con React, TypeScript, Wagmi, y Express. Implementa dos modos de operación: interacción directa con el contrato (Parte 1) y autenticación con backend usando SIWE (Parte 2).

## 📋 Características

### Parte 1: Interacción Directa
- ✅ Conexión de wallet con Web3Modal
- ✅ Reclamar 1,000,000 FT tokens (una vez por wallet)
- ✅ Ver balance de tokens en tiempo real
- ✅ Transferir tokens a otras direcciones
- ✅ Ver lista de usuarios que han reclamado
- ✅ Verificación de estado (ya reclamó o no)

### Parte 2: Backend con SIWE
- ✅ Autenticación con Sign-In with Ethereum (SIWE)
- ✅ JWT tokens para sesiones seguras
- ✅ Reclamar tokens sin pagar gas (el backend ejecuta la transacción)
- ✅ API RESTful con endpoints protegidos
- ✅ Middleware de autenticación

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.1.1** - Framework UI
- **TypeScript 5.6.3** - Type safety
- **Vite 7.1.7** - Build tool
- **Wagmi 2.17.5** - React Hooks para Ethereum
- **Viem 2.37.8** - Librería Ethereum TypeScript
- **Web3Modal 5.1.11** - Conexión de wallets
- **SIWE 2.3.2** - Sign-In with Ethereum
- **Tailwind CSS 4.1.13** - Styling

### Backend
- **Express 4.21.2** - Web server
- **ethers 6.15.0** - Interacción con blockchain
- **jsonwebtoken 9.0.2** - JWT authentication
- **SIWE 2.3.2** - Verificación de firmas
- **TypeScript 5.6.3** - Type safety
- **tsx 4.20.6** - TypeScript execution

### Blockchain
- **Network:** Sepolia Testnet (Chain ID: 11155111)
- **Contract:** `0x3e2117c19a921507ead57494bbf29032f33c7412`
- **Token:** FaucetToken (FT)
- **Faucet Amount:** 1,000,000 FT por claim

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd faucet-app
```

### 2. Instalar dependencias del frontend
```bash
npm install
```

### 3. Instalar dependencias del backend
```bash
cd backend
npm install
cd ..
```

### 4. Configurar variables de entorno

#### Backend (.env)
Crea un archivo `backend/.env`:
```env
PORT=3001
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=0x3e2117c19a921507ead57494bbf29032f33c7412
PRIVATE_KEY=tu_private_key_aqui
JWT_SECRET=tu_jwt_secret_super_seguro
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

⚠️ **IMPORTANTE:** Nunca subas tu `.env` a Git. Asegúrate de que esté en `.gitignore`.

## 🎮 Uso

### Modo 1: Solo Frontend (Parte 1)

Este modo permite interacción directa con el contrato. El usuario paga el gas.

```bash
npm run dev
```

Abre `http://localhost:5173/` y:
1. Conecta tu wallet (MetaMask recomendado)
2. Asegúrate de estar en Sepolia Testnet
3. Ten Sepolia ETH para gas
4. Clic en "Claim Tokens"

### Modo 2: Con Backend (Parte 2)

Este modo usa SIWE para autenticación. El backend ejecuta las transacciones.

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Verifica que veas: `🚀 Backend ejecutándose en http://localhost:3001`

#### Terminal 2 - Frontend
```bash
npm run dev
```

Abre `http://localhost:5173/` y:
1. Conecta tu wallet
2. Clic en "Authenticate with SIWE"
3. Firma el mensaje en tu wallet (NO es una transacción)
4. Clic en "Claim Tokens"
5. El backend ejecuta la transacción por ti (sin gas para el usuario)

## 📚 Documentación

- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Configuración detallada del backend
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Guía completa de testing

## 🔌 API Endpoints

### Autenticación

#### POST `/api/auth/message`
Obtiene un mensaje SIWE para firmar.

**Request:**
```json
{
  "address": "0x..."
}
```

**Response:**
```json
{
  "message": "localhost:5173 wants you to sign in..."
}
```

#### POST `/api/auth/signin`
Verifica la firma y retorna JWT.

**Request:**
```json
{
  "message": "mensaje SIWE completo",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "address": "0x..."
}
```

### Faucet (requieren JWT)

#### POST `/api/faucet/claim`
Reclama tokens desde el backend.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "amount": "1000000000000000000000000"
}
```

#### GET `/api/faucet/status/:address`
Obtiene estado del faucet para una dirección.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "hasClaimed": false,
  "balance": "0",
  "faucetAmount": "1000000",
  "users": 5
}
```

#### GET `/api/faucet/users`
Lista de usuarios (público).

**Response:**
```json
{
  "users": ["0x...", "0x..."]
}
```

## 🏗️ Estructura del Proyecto

```
faucet-app/
├── src/                      # Frontend
│   ├── components/           # Componentes React
│   │   ├── WalletButton.tsx
│   │   ├── AuthButton.tsx    # SIWE authentication
│   │   ├── ClaimWithBackend.tsx
│   │   ├── UsersList.tsx
│   │   └── TransferTokens.tsx
│   ├── services/
│   │   └── api.ts            # API client
│   ├── config/
│   │   └── web3.ts           # Wagmi configuration
│   ├── App.tsx               # Versión directa (Parte 1)
│   ├── AppWithBackend.tsx    # Versión con backend (Parte 2)
│   └── main.tsx
│
├── backend/                  # Backend
│   └── src/
│       ├── server.ts         # Express server
│       ├── routes/
│       │   ├── auth.ts       # SIWE routes
│       │   └── faucet.ts     # Faucet routes
│       ├── middleware/
│       │   └── auth.ts       # JWT middleware
│       ├── config/
│       │   └── web3.ts       # ethers configuration
│       └── types/
│           └── index.ts      # TypeScript types
│
├── BACKEND_SETUP.md
├── TESTING_GUIDE.md
└── README.md (este archivo)
```

## 🔐 Seguridad

### Desarrollo
- ✅ CORS configurado para localhost
- ✅ JWT con expiración de 24h
- ✅ `.env` en `.gitignore`
- ✅ Validación de firmas SIWE

### Producción (TODO)
- ⚠️ Cambiar CORS a dominios específicos
- ⚠️ Usar variables de entorno del servidor
- ⚠️ Implementar rate limiting
- ⚠️ Agregar HTTPS
- ⚠️ Monitoreo y logging

## 🧪 Testing

Ver [TESTING_GUIDE.md](./TESTING_GUIDE.md) para guía completa de testing.

### Quick Test
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev

# Abre http://localhost:5173
```

## 🐛 Troubleshooting

### "Backend not responding"
- Verifica que el backend esté corriendo en puerto 3001
- Revisa que `FRONTEND_URL` en `.env` sea `http://localhost:5173`

### "Invalid signature"
- Asegúrate de firmar con la misma wallet que solicitó el mensaje
- Los mensajes SIWE expiran después de 10 minutos

### "Insufficient funds for gas"
- El backend wallet necesita Sepolia ETH
- Obtén ETH en: https://cloud.google.com/application/web3/faucet/ethereum/sepolia

### "Already claimed"
- Cada wallet solo puede reclamar una vez
- Esta es la funcionalidad esperada del faucet

## 📦 Scripts Disponibles

### Frontend
```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Ejecutar ESLint
```

### Backend
```bash
cd backend
npm run dev          # Desarrollo con hot reload (tsx watch)
npm run build        # Compilar TypeScript
npm start            # Ejecutar build de producción
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es para fines educativos (Programación 3 - Universidad).

## 🙏 Agradecimientos

- [Wagmi](https://wagmi.sh/) - React Hooks for Ethereum
- [Viem](https://viem.sh/) - TypeScript Ethereum library
- [Web3Modal](https://web3modal.com/) - Wallet connection
- [SIWE](https://login.xyz/) - Sign-In with Ethereum
- [ethers.js](https://docs.ethers.org/) - Ethereum library

---

**Desarrollado con ❤️ para Programación 3**

