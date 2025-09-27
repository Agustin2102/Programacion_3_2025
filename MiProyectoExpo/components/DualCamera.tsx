import React, { useCallback, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { CameraView } from 'expo-camera';
import { Audio } from 'expo-av';
import { LocationService } from '../services/LocationService';
import { LocationData } from '../utils/constants';

type Props = {
    enabled: boolean;
    onDualCapture: (photos: { back: { uri: string }, front: { uri: string }, location?: LocationData }) => void;
};

export const DualCamera: React.FC<Props> = ({ enabled, onDualCapture }) => {
  const cameraRef = useRef<CameraView | null>(null);
  const [type, setType] = useState<'back' | 'front'>('back');
  const [backPhoto, setBackPhoto] = useState<{ uri: string } | null>(null);
  const [frontPhoto, setFrontPhoto] = useState<{ uri: string } | null>(null);
  const [step, setStep] = useState<'back' | 'front' | 'done'>('back');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Configurar audio sin sonido al montar el componente
  React.useEffect(() => {
    if (enabled) {
      const setupSilentMode = async () => {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            playsInSilentModeIOS: false,
            shouldDuckAndroid: false,
            playThroughEarpieceAndroid: false,
          });
        } catch (error) {
          console.log('Could not set silent mode:', error);
        }
      };
      setupSilentMode();

      // Solicitar permisos de ubicación cuando se activa la cámara
      const requestLocationPermission = async () => {
        await LocationService.requestPermission();
      };
      requestLocationPermission();
    }

    return () => {
      // Restaurar al desmontar
      if (enabled) {
        Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        }).catch(() => {});
      }
    };
  }, [enabled]);

  const handleTakePhoto = useCallback(async () => {
    if (!enabled || !cameraRef.current) return;

    try {
      // Obtener ubicación en la primera foto si no la tenemos
      if (step === 'back' && !location) {
        setIsGettingLocation(true);
        const currentLocation = await LocationService.getCurrentLocation();
        setLocation(currentLocation);
        setIsGettingLocation(false);
      }

      const photo = await cameraRef.current.takePictureAsync({ 
        quality: 0.8,
        skipProcessing: true,
        base64: false,
        exif: false
      });

      if (step === 'back') {
        // Guardar foto trasera y cambiar a frontal
        setBackPhoto({ uri: photo.uri });
        setType('front');
        setStep('front');
      } else if (step === 'front') {
        // Guardar foto frontal y completar captura
        setFrontPhoto({ uri: photo.uri });
        
        // Completar captura dual
        onDualCapture({ 
          back: backPhoto!, 
          front: { uri: photo.uri },
          location: location || undefined
        });
        
        // Reset para próxima captura
        setBackPhoto(null);
        setFrontPhoto(null);
        setLocation(null);
        setType('back');
        setStep('back');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setIsGettingLocation(false);
    }
  }, [enabled, step, backPhoto, location, onDualCapture]);

  const handleSwitchCamera = useCallback(() => {
    setType(current => current === 'back' ? 'front' : 'back');
  }, []);

  if (!enabled) {
    return <View style={styles.inactive} />;
  }

  const getButtonText = () => {
    if (step === 'back') return '📷 Tomar Foto Trasera';
    if (step === 'front') return '🤳 Tomar Selfie';
    return '✅ Completado';
  };

  const getStepText = () => {
    if (isGettingLocation) return '📍 Obteniendo ubicación...';
    if (step === 'back') return 'Paso 1: Toma una foto con la cámara trasera';
    if (step === 'front') return 'Paso 2: Ahora toma un selfie';
    return '¡Fotos completadas!';
  };

  return (
    <View style={styles.container}>
      <CameraView 
        ref={(camera) => { cameraRef.current = camera; }} 
        style={styles.camera} 
        facing={type}
        ratio="4:3" 
      />
      
      {/* Indicador de paso */}
      <View style={styles.stepIndicator}>
        <Text style={styles.stepText}>{getStepText()}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: step === 'back' ? '50%' : '100%' }]} />
        </View>
        
        {/* Indicador de ubicación */}
        {location && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              📍 {LocationService.formatLocation(location)}
            </Text>
          </View>
        )}
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        {/* Botón cambiar cámara */}
        <TouchableOpacity style={styles.switchButton} onPress={handleSwitchCamera}>
          <Text style={styles.switchButtonText}>🔄</Text>
        </TouchableOpacity>

        {/* Botón principal de captura */}
        <TouchableOpacity 
          style={[styles.shutter, step === 'front' && styles.shutterFront]} 
          onPress={handleTakePhoto}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        {/* Indicador de fotos tomadas */}
        <View style={styles.photoIndicator}>
          <View style={[styles.photoIcon, backPhoto && styles.photoTaken]}>
            <Text style={styles.photoIconText}>📷</Text>
          </View>
          <View style={[styles.photoIcon, frontPhoto && styles.photoTaken]}>
            <Text style={styles.photoIconText}>🤳</Text>
          </View>
        </View>
      </View>

      {/* Texto del botón */}
      <View style={styles.buttonTextContainer}>
        <Text style={styles.buttonText}>{getButtonText()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inactive: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  camera: { 
    flex: 1 
  },
  stepIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 15,
  },
  stepText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  locationInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  switchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 24,
  },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterFront: {
    borderColor: '#007AFF',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B35',
  },
  photoIndicator: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  photoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photoTaken: {
    backgroundColor: '#4CAF50',
    borderColor: '#fff',
  },
  photoIconText: {
    fontSize: 18,
  },
  buttonTextContainer: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
});