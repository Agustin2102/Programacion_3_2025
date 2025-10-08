# 🔍 Quick Verification Script

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  FAUCET APP - VERIFICATION" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar estructura de archivos
Write-Host "1. Verificando estructura de archivos..." -ForegroundColor Yellow

$criticalFiles = @(
    "src/AppWithBackend.tsx",
    "src/components/AuthButton.tsx",
    "src/components/ClaimWithBackend.tsx",
    "src/services/api.ts",
    "backend/src/server.ts",
    "backend/src/routes/auth.ts",
    "backend/src/routes/faucet.ts",
    "backend/.env",
    "BACKEND_SETUP.md",
    "TESTING_GUIDE.md"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (FALTA)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host ""
    Write-Host "✓ Todos los archivos críticos existen" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Faltan algunos archivos" -ForegroundColor Red
}

Write-Host ""

# 2. Verificar node_modules
Write-Host "2. Verificando dependencias..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "  ✓ Frontend node_modules instalado" -ForegroundColor Green
} else {
    Write-Host "  ✗ Frontend node_modules falta (ejecuta: npm install)" -ForegroundColor Red
}

if (Test-Path "backend/node_modules") {
    Write-Host "  ✓ Backend node_modules instalado" -ForegroundColor Green
} else {
    Write-Host "  ✗ Backend node_modules falta (ejecuta: cd backend && npm install)" -ForegroundColor Red
}

Write-Host ""

# 3. Verificar procesos corriendo
Write-Host "3. Verificando procesos..." -ForegroundColor Yellow

$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "  ✓ Procesos Node.js detectados: $($nodeProcesses.Count)" -ForegroundColor Green
    
    # Verificar puertos
    $port3001 = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
    $port5173 = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
    
    if ($port3001) {
        Write-Host "  ✓ Backend corriendo en puerto 3001" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Puerto 3001 no está en uso (ejecuta: cd backend && npm run dev)" -ForegroundColor Yellow
    }
    
    if ($port5173) {
        Write-Host "  ✓ Frontend corriendo en puerto 5173" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Puerto 5173 no está en uso (ejecuta: npm run dev)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ No se detectaron procesos Node.js" -ForegroundColor Yellow
}

Write-Host ""

# 4. Verificar .env
Write-Host "4. Verificando configuración..." -ForegroundColor Yellow

if (Test-Path "backend/.env") {
    $envContent = Get-Content "backend/.env" -Raw
    
    if ($envContent -match "PRIVATE_KEY=") {
        Write-Host "  ✓ PRIVATE_KEY configurado" -ForegroundColor Green
    } else {
        Write-Host "  ✗ PRIVATE_KEY no configurado" -ForegroundColor Red
    }
    
    if ($envContent -match "JWT_SECRET=") {
        Write-Host "  ✓ JWT_SECRET configurado" -ForegroundColor Green
    } else {
        Write-Host "  ✗ JWT_SECRET no configurado" -ForegroundColor Red
    }
    
    if ($envContent -match "CONTRACT_ADDRESS=") {
        Write-Host "  ✓ CONTRACT_ADDRESS configurado" -ForegroundColor Green
    } else {
        Write-Host "  ✗ CONTRACT_ADDRESS no configurado" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ backend/.env no existe" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  RESUMEN" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar el proyecto completo:" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Luego abre: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Documentación:" -ForegroundColor Yellow
Write-Host "  - README.md (descripción general)" -ForegroundColor White
Write-Host "  - BACKEND_SETUP.md (setup del backend)" -ForegroundColor White
Write-Host "  - TESTING_GUIDE.md (guía de testing)" -ForegroundColor White
Write-Host ""
