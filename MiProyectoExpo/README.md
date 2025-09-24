# 📸 Photo Location App - Aplicación de Fotos con Ubicación

## ⚠️ IMPORTANTE: Configuración de Conexión

### 🔧 Problema de Conectividad - Solución Tunnel Mode

**Si tienes problemas para conectarte con Expo Go desde tu dispositivo móvil:**

```bash
# ⭐ USA SIEMPRE EL MODO TUNNEL (MÁS CONFIABLE)
npx expo start --tunnel
```

**¿Por qué usar tunnel mode?**
- ✅ **Evita problemas de firewall** de Windows
- ✅ **Funciona con cualquier red** (universidad, hogar, datos móviles)
- ✅ **No depende de la IP local** de tu computadora
- ✅ **Soluciona errores** como "Failed to download remote update"

> **💡 Tip**: El modo tunnel es especialmente importante cuando trabajas en redes restrictivas (como universidades) o cuando compartes datos móviles con tu computadora.

### 🚨 Si encuentras el error "Java.io.IOException: Failed to download remote update"

1. **Configura el firewall de Windows:**
   - Abre `Windows + R`, escribe `wf.msc`
   - Crea nueva regla para `C:\Program Files\nodejs\node.exe`
   - Permite conexiones entrantes

2. **Usa modo tunnel:**
   ```bash
   npx expo start --tunnel  # ← ESTO RESUELVE LA MAYORÍA DE PROBLEMAS
   ```

3. **Asegúrate de tener Expo CLI instalado:**
   ```bash
   npm install -g @expo/cli
   ```

---

## 📋 Descripción del Proyecto

**Photo Location App** es una aplicación móvil desarrollada con React Native y Expo que permite capturar fotos con información de ubicación GPS y visualizar todas las fotos en un mapa interactivo. La app combina la funcionalidad de cámara dual (trasera y frontal) con geolocalización para crear un diario visual de lugares visitados.

### 🎯 Concepto Principal

La aplicación se enfoca en **capturar memorias con contexto geográfico**:
- Captura fotos con la cámara trasera y frontal simultáneamente
- Guarda automáticamente la ubicación GPS de cada foto
- Muestra todas las fotos en una galería con vista de mapa
- Permite explorar fotos por ubicación geográfica
- Mantiene un registro visual de lugares visitados

## ✨ Funcionalidades Principales

### 📷 Captura Dual de Cámara con GPS
- **Cámara trasera**: Foto principal del entorno
- **Cámara frontal**: Selfie en la esquina para contexto personal
- **Geolocalización automática**: Captura coordenadas GPS con cada foto
- **Control manual**: El usuario decide cuándo tomar cada foto (trasera → frontal)

### 🗺️ Mapa Interactivo
- **Vista de mapa** con marcadores de todas las fotos
- **Navegación por ubicación**: Toca un marcador para ver la foto
- **Zoom y exploración** del mapa para descubrir fotos por área
- **Información de ubicación** (coordenadas, dirección aproximada)

### 🖼️ Galería Inteligente
- **Vista de cuadrícula** estilo Pinterest con diseño moderno
- **Metadata visible**: Fecha, hora y ubicación en cada foto
- **Eliminación selectiva** de fotos individuales
- **Navegación fluida** entre galería y mapa

### � Gestión de Ubicación
- **Solicitud de permisos** de ubicación al usuario
- **Captura automática** de coordenadas GPS
- **Almacenamiento seguro** de datos de ubicación
- **Privacidad local**: Todos los datos se guardan en el dispositivo

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React Native** - Framework principal para desarrollo móvil
- **Expo** - Plataforma de desarrollo y herramientas
- **JavaScript/ES6+** - Lenguaje de programación

### Librerías Principales
- **expo-camera** - Acceso a cámaras del dispositivo
- **expo-location** - Captura de coordenadas GPS
- **react-native-maps** - Componente de mapa interactivo
- **expo-file-system** - Gestión de archivos del sistema
- **@react-native-async-storage/async-storage** - Almacenamiento local
- **expo-media-library** - Acceso a la galería del dispositivo

### Herramientas de Desarrollo
- **Expo CLI** - Herramientas de línea de comandos
- **Metro Bundler** - Bundler de JavaScript
- **Expo Go** - App para testing en dispositivos reales

## 📱 Plataformas Soportadas

- **Android** (API 21+)
- **iOS** (iOS 11+)
- **Web** (para desarrollo y testing)

## 🔧 Configuración del Proyecto

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- Expo CLI (`npm install -g @expo/cli`)
- Dispositivo móvil con Expo Go instalado

### Instalación
```bash
# Clonar el repositorio
git clone [url-del-repositorio]

# Navegar al directorio
cd MiProyectoExpo

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo (RECOMENDADO: usar tunnel mode)
npx expo start --tunnel

# Alternativa (solo si tunnel no funciona):
# npx expo start
```

> **⚠️ IMPORTANTE**: Se recomienda usar `--tunnel` para evitar problemas de conectividad, especialmente en redes restrictivas o con firewall.

### Permisos Necesarios
La aplicación requiere los siguientes permisos:
- **Cámara**: Para tomar fotos
- **Ubicación**: Para capturar coordenadas GPS
- **Almacenamiento**: Para guardar fotos en el dispositivo

### Estructura del Proyecto
```
MiProyectoExpo/
├── App.tsx                         # Componente principal
├── components/                     # Componentes reutilizables
│   ├── DualCamera.tsx             # Componente de cámara dual
│   ├── TimerComponent.tsx         # Temporizador de captura
│   ├── MapView.tsx                # Componente de mapa
│   └── PhotoMarker.tsx            # Marcadores de fotos en mapa
├── services/                      # Servicios de la aplicación
│   ├── LocationService.ts         # Servicio de geolocalización
│   ├── StorageService.ts          # Almacenamiento local
│   └── PhotoService.ts            # Gestión de fotos
├── utils/                         # Utilidades y constantes
│   └── constants.ts               # Configuraciones globales
├── screens/                       # Pantallas de la aplicación
│   ├── HomeScreen.tsx             # Pantalla principal
│   ├── CameraScreen.tsx           # Pantalla de cámara
│   ├── GalleryScreen.tsx          # Pantalla de galería
│   └── MapScreen.tsx              # Pantalla de mapa
├── assets/                        # Recursos estáticos
├── app.json                       # Configuración de Expo
└── package.json                   # Dependencias del proyecto
```

## ⚙️ Configuración de Permisos

### Android (app.json)
```json
{
  "android": {
    "permissions": [
      "android.permission.CAMERA",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.READ_EXTERNAL_STORAGE"
    ]
  }
}
```

### iOS (app.json)
```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "Esta app necesita acceso a la cámara para tomar fotos",
      "NSLocationWhenInUseUsageDescription": "Esta app necesita acceso a la ubicación para geoetiquetar fotos",
      "NSPhotoLibraryUsageDescription": "Esta app necesita acceso a la galería para guardar fotos"
    }
  }
}
```

## 🚀 Funcionalidades Técnicas

### Sistema de Geolocalización
- **Solicitud de permisos** de ubicación al iniciar la app
- **Captura automática** de coordenadas GPS al tomar fotos
- **Almacenamiento seguro** de datos de ubicación con cada imagen
- **Precisión configurable** para balance entre exactitud y batería

### Captura de Fotos con Metadata
- **Captura dual controlada** por el usuario (trasera → frontal)
- **Geolocalización integrada** en cada foto
- **Optimización de calidad** (0.8 de calidad para balance)
- **Manejo de errores** robusto para GPS y cámara

### Almacenamiento Inteligente
- **AsyncStorage** para metadatos (ubicación, fecha, hora)
- **FileSystem** para archivos de imagen
- **Estructura de datos** optimizada para búsquedas por ubicación
- **Eliminación segura** de fotos y su metadata asociado

### Mapa Interactivo
- **Marcadores dinámicos** para cada foto en el mapa
- **Navegación fluida** entre mapa y galería
- **Zoom y pan** para explorar diferentes áreas
- **Información contextual** al tocar marcadores

## 📊 Flujo de la Aplicación

1. **Inicio**: La app solicita permisos de cámara y ubicación
2. **Captura**: Usuario puede tomar fotos en cualquier momento
3. **Geolocalización**: Se capturan automáticamente las coordenadas GPS
4. **Procesamiento**: Guardado de foto con metadata de ubicación
5. **Galería**: Visualización en cuadrícula con información de ubicación
6. **Mapa**: Exploración de fotos por ubicación geográfica
7. **Gestión**: Posibilidad de eliminar fotos individuales

## 🎨 Diseño de Interfaz

### Pantalla Principal
- **Botón de cámara** prominente para tomar fotos
- **Acceso rápido** a galería y mapa
- **Estado de permisos** de ubicación y cámara

### Pantalla de Cámara
- **Vista previa** de cámara trasera en pantalla completa
- **Control manual** de captura (trasera → frontal)
- **Indicador de GPS** cuando se captura ubicación
- **Progreso visual** del proceso de captura dual

### Pantalla de Galería
- **Cuadrícula estilo Pinterest** con diseño moderno
- **Metadata visible** (fecha, hora, ubicación)
- **Botón de eliminar** en cada foto
- **Navegación** a vista de mapa

### Pantalla de Mapa
- **Mapa interactivo** con marcadores de fotos
- **Zoom y navegación** libre
- **Preview de fotos** al tocar marcadores
- **Regreso fluido** a la galería

## 🔒 Consideraciones de Privacidad

- **Almacenamiento local**: Las fotos se guardan solo en el dispositivo
- **Sin servidores externos**: No se envían datos a servidores
- **Permisos mínimos**: Solo los necesarios para funcionalidad
- **Control del usuario**: Acceso completo a sus datos

## 🧪 Testing

### Dispositivos de Prueba
- **Android**: Dispositivos físicos con Expo Go
- **iOS**: Dispositivos físicos con Expo Go
- **Web**: Navegador para desarrollo rápido

### Casos de Prueba
- [ ] Permisos de cámara y notificaciones
- [ ] Captura dual de fotos
- [ ] Temporizador de 30 segundos
- [ ] Almacenamiento y recuperación de fotos
- [ ] Programación de notificaciones
- [ ] Interfaz de galería

## 🚀 Deployment

### Desarrollo
```bash
# RECOMENDADO: Usar tunnel mode
npx expo start --tunnel

# Alternativa para redes locales estables:
# npx expo start

# Escanear QR con Expo Go desde tu dispositivo móvil
```

> **💡 Consejo**: Si tienes problemas de conexión, siempre usa `--tunnel` primero.

### Producción
```bash
# Android
expo build:android

# iOS
expo build:ios
```

## 📈 Futuras Mejoras

### Funcionalidades Adicionales
- **Notificaciones push reales** con servidor backend
- **Sincronización en la nube** con Firebase
- **Funcionalidades sociales** (compartir, comentarios)
- **Filtros y efectos** para las fotos
- **Estadísticas** de uso de la aplicación

### Optimizaciones
- **Compresión inteligente** de imágenes
- **Caché optimizado** para mejor rendimiento
- **Modo offline** mejorado
- **Animaciones** más fluidas

## 👥 Contribución

Este es un proyecto personal de aprendizaje. Si deseas contribuir:

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la [Licencia MIT](LICENSE).

## 📞 Contacto

- **Desarrollador**: [Tu Nombre]
- **Email**: [tu-email@ejemplo.com]
- **GitHub**: [tu-usuario-github]

---

## 🎯 Objetivos del Proyecto

Este proyecto tiene como objetivo:

1. **Aprender React Native** y Expo en un proyecto real
2. **Implementar funcionalidades complejas** como notificaciones y cámara
3. **Crear una aplicación funcional** que replique una app popular
4. **Entender el flujo completo** de desarrollo móvil
5. **Practicar buenas prácticas** de programación y arquitectura

---

*Desarrollado con ❤️ usando React Native y Expo*
