# 🧪 Guía de Testing - Faucet App con SIWE

## ✅ Estado del Proyecto

### Parte 1 - Frontend Directo
- ✅ Conexión de wallet (Web3Modal)
- ✅ Verificación de estado (hasAddressClaimed)
- ✅ Reclamar tokens (claimTokens)
- ✅ Lista de usuarios (getFaucetUsers)
- ✅ Transferir tokens

### Parte 2 - Backend con SIWE
- ✅ Backend Express configurado y corriendo
- ✅ SIWE (Sign-In with Ethereum) implementado
- ✅ JWT tokens para autenticación
- ✅ Endpoints API:
  - `POST /api/auth/message` - Obtener mensaje SIWE
  - `POST /api/auth/signin` - Firmar y obtener JWT
  - `POST /api/faucet/claim` - Reclamar tokens vía backend
  - `GET /api/faucet/status/:address` - Estado del faucet
  - `GET /api/faucet/users` - Lista de usuarios
- ✅ Frontend integrado con AuthButton y ClaimWithBackend

---

## 🚀 Cómo Ejecutar el Proyecto

### 1. Iniciar el Backend

```bash
cd backend
npm run dev
```

**Verificar:** Deberías ver en consola:
```
🚀 Backend ejecutándose en http://localhost:3001
```

### 2. Iniciar el Frontend

En otra terminal:
```bash
npm run dev
```

**Verificar:** Deberías ver en consola:
```
  VITE v7.1.7  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

---

## 🧪 Flujo de Testing Completo

### Escenario 1: Usuario Nuevo (Primera Vez)

#### Paso 1: Conectar Wallet
1. Abre `http://localhost:5173/`
2. Clic en **"Connect Wallet"**
3. Selecciona **MetaMask**
4. Aprueba la conexión en MetaMask
5. ✅ **Verificar:** El botón cambia a mostrar tu dirección

#### Paso 2: Autenticar con SIWE
1. Clic en **"Authenticate with SIWE"**
2. Se abre MetaMask pidiendo **firmar un mensaje** (NO es una transacción)
3. Clic en **"Sign"** en MetaMask
4. ✅ **Verificar:** 
   - Mensaje de éxito: "✅ Authenticated successfully!"
   - El botón cambia a "Authenticated ✓"
   - Aparece botón **"Claim Tokens"**

#### Paso 3: Reclamar Tokens
1. Clic en **"Claim Tokens"**
2. Espera mientras el backend procesa la transacción
3. ✅ **Verificar:**
   - Mensaje de éxito con enlace a Etherscan
   - Tu balance aumenta en 1,000,000 FT
   - El botón "Claim Tokens" desaparece (ya reclamaste)

#### Paso 4: Ver Usuarios
1. Clic en la pestaña **"Users"**
2. ✅ **Verificar:** Tu dirección aparece en la lista

---

### Escenario 2: Usuario que Ya Reclamó

#### Paso 1: Conectar y Autenticar
1. Conecta tu wallet
2. Autentica con SIWE

#### Paso 2: Verificar Estado
3. ✅ **Verificar:**
   - No aparece botón "Claim Tokens"
   - Se muestra "Claim Status: Claimed"
   - Tu balance muestra 1,000,000 FT (o más si transferiste)

---

### Escenario 3: Transferir Tokens

#### Paso 1: Ir a Transfer
1. Clic en la pestaña **"Transfer"**

#### Paso 2: Transferir
1. Ingresa una dirección válida de Ethereum
2. Ingresa cantidad de tokens (ej: 100)
3. Clic en **"Transfer"**
4. Aprueba la transacción en MetaMask
5. ✅ **Verificar:**
   - Mensaje de éxito
   - Tu balance disminuye
   - La dirección destino puede verificar su balance

---

## 🔍 Testing de Endpoints API (Opcional)

### Test Manual con cURL o Postman

#### 1. Obtener Mensaje SIWE
```bash
curl -X POST http://localhost:3001/api/auth/message \
  -H "Content-Type: application/json" \
  -d '{"address": "0xTU_ADDRESS"}'
```

**Respuesta esperada:**
```json
{
  "message": "localhost:5173 wants you to sign in with your Ethereum account:\n0xTU_ADDRESS\n\n..."
}
```

#### 2. Firmar y Obtener JWT
(Necesitas firmar el mensaje con tu wallet primero)

```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "message": "MENSAJE_SIWE_COMPLETO",
    "signature": "0xFIRMA"
  }'
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "address": "0xTU_ADDRESS"
}
```

#### 3. Reclamar Tokens (con JWT)
```bash
curl -X POST http://localhost:3001/api/faucet/claim \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_JWT_TOKEN"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "transactionHash": "0x123abc...",
  "amount": "1000000000000000000000000"
}
```

#### 4. Ver Estado del Faucet
```bash
curl http://localhost:3001/api/faucet/status/0xTU_ADDRESS \
  -H "Authorization: Bearer TU_JWT_TOKEN"
```

**Respuesta esperada:**
```json
{
  "hasClaimed": false,
  "balance": "0",
  "faucetAmount": "1000000",
  "users": 5
}
```

#### 5. Ver Lista de Usuarios (público)
```bash
curl http://localhost:3001/api/faucet/users
```

**Respuesta esperada:**
```json
{
  "users": [
    "0xa0377F058C8bc43EF8AA0e55687562b79c9F44B7",
    "0x..."
  ]
}
```

---

## ❌ Errores Comunes y Soluciones

### Error: "Backend not responding"
**Causa:** Backend no está corriendo  
**Solución:**
```bash
cd backend
npm run dev
```

### Error: "Invalid signature"
**Causa:** Firma no válida o mensaje expirado  
**Solución:** Vuelve a firmar el mensaje (los mensajes SIWE expiran)

### Error: "JWT expired"
**Causa:** Token JWT expiró (válido por 24 horas)  
**Solución:** 
1. Desconecta wallet
2. Vuelve a conectar
3. Autentica de nuevo con SIWE

### Error: "Already claimed"
**Causa:** La dirección ya reclamó tokens  
**Solución:** Esta es la funcionalidad esperada. No se puede reclamar dos veces.

### Error: "MetaMask not installed"
**Causa:** No tienes MetaMask instalado  
**Solución:** Instala la extensión de MetaMask para Chrome/Brave/Firefox

### Error: "insufficient funds for gas"
**Causa:** El backend wallet no tiene ETH en Sepolia  
**Solución:** Envía Sepolia ETH a la dirección configurada en `backend/.env` (PRIVATE_KEY)

---

## 🔐 Seguridad

### ⚠️ IMPORTANTE para Producción

1. **No expongas la PRIVATE_KEY:**
   - Nunca subas el archivo `.env` a Git
   - `.gitignore` debe incluir `.env`

2. **JWT_SECRET:**
   - Usa un secret fuerte y aleatorio
   - En producción, usa variables de entorno del servidor

3. **CORS:**
   - En producción, configura solo los orígenes permitidos
   - No uses `origin: '*'` en producción

4. **Rate Limiting:**
   - Considera agregar rate limiting para prevenir spam
   - Ejemplo: máximo 1 claim por wallet

---

## 📊 Datos de Test

### Sepolia Testnet
- **Chain ID:** 11155111
- **RPC URL:** https://sepolia.infura.io/v3/YOUR_KEY
- **Block Explorer:** https://sepolia.etherscan.io

### Contrato Faucet
- **Address:** `0x3e2117c19a921507ead57494bbf29032f33c7412`
- **Faucet Amount:** 1,000,000 FT
- **Decimals:** 18

### Obtener Sepolia ETH
- Google Cloud Faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- Alchemy Faucet: https://sepoliafaucet.com/

---

## ✅ Checklist de Funcionalidades

### Frontend
- [ ] Conectar wallet (Web3Modal)
- [ ] Autenticar con SIWE (firmar mensaje)
- [ ] Ver balance de tokens
- [ ] Reclamar tokens vía backend
- [ ] Ver estado (Claimed/Available)
- [ ] Transferir tokens
- [ ] Ver lista de usuarios
- [ ] Manejo de errores

### Backend
- [ ] Endpoint: POST /api/auth/message
- [ ] Endpoint: POST /api/auth/signin
- [ ] Endpoint: POST /api/faucet/claim
- [ ] Endpoint: GET /api/faucet/status/:address
- [ ] Endpoint: GET /api/faucet/users
- [ ] Middleware JWT
- [ ] Conexión blockchain con ethers
- [ ] CORS configurado
- [ ] Logging de requests

### Seguridad
- [ ] SIWE implementado correctamente
- [ ] JWT con expiración (24h)
- [ ] .env no versionado
- [ ] Private key segura
- [ ] Validación de firma SIWE

---

## 🎓 Entregables del Proyecto

1. ✅ **Código fuente completo**
   - Frontend (React + Wagmi + SIWE)
   - Backend (Express + ethers + JWT)

2. ✅ **Documentación**
   - README.md (descripción general)
   - BACKEND_SETUP.md (setup del backend)
   - TESTING_GUIDE.md (este archivo)

3. ✅ **Funcionalidades implementadas**
   - Parte 1: Interacción directa con contrato
   - Parte 2: Backend con SIWE y JWT

4. 🎥 **Demo funcional** (recomendado)
   - Graba un video mostrando:
     * Conectar wallet
     * Autenticar con SIWE
     * Reclamar tokens
     * Ver usuarios
     * Transferir tokens

---

## 🤝 Soporte

Si encuentras algún problema:

1. Verifica que el backend esté corriendo en puerto 3001
2. Verifica que el frontend esté corriendo en puerto 5173
3. Revisa la consola del navegador para errores
4. Revisa la consola del backend para logs
5. Verifica que tengas Sepolia ETH en la wallet del backend

---

**¡Éxito con tu proyecto! 🚀**
