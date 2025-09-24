import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { AppNavigation } from './components/AppNavigation';
import { StorageService } from './services/StorageService';
import { LocationService } from './services/LocationService';
import { GalleryStorageService } from './services/GalleryStorageService';
import { DualPhoto } from './utils/constants';

export default function App(): React.JSX.Element {
  const [cameraGranted, setCameraGranted] = useState<boolean>(false);
  const [locationGranted, setLocationGranted] = useState<boolean>(false);
  const [mediaLibraryGranted, setMediaLibraryGranted] = useState<boolean>(false);
  const [photos, setPhotos] = useState<DualPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState<boolean>(true);

  // Función para cargar fotos desde galería
  const loadPhotosFromGallery = useCallback(async () => {
    try {
      setLoadingPhotos(true);
      console.log('Cargando fotos desde galería...');
      
      // Cargar desde galería
      const galleryPhotos = await GalleryStorageService.loadDualPhotosFromGallery();
      console.log(`Encontradas ${galleryPhotos.length} fotos en galería`);
      
      // Cargar también desde AsyncStorage (fotos que no se guardaron en galería)
      const localPhotos = await StorageService.getPhotos();
      console.log(`Encontradas ${localPhotos.length} fotos locales`);
      
      // Combinar y eliminar duplicados por timestamp
      const allPhotos = [...galleryPhotos, ...localPhotos];
      const uniquePhotos = allPhotos.filter((photo, index, self) => 
        index === self.findIndex(p => p.timestamp === photo.timestamp)
      );
      
      // Ordenar por timestamp (más recientes primero)
      uniquePhotos.sort((a, b) => b.timestamp - a.timestamp);
      
      setPhotos(uniquePhotos);
      console.log(`Total de fotos únicas cargadas: ${uniquePhotos.length}`);
    } catch (error) {
      console.error('Error loading photos:', error);
      // Fallback a AsyncStorage si hay error
      const localPhotos = await StorageService.getPhotos();
      setPhotos(localPhotos);
    } finally {
      setLoadingPhotos(false);
    }
  }, []);

  // permisos iniciales
  useEffect(() => {
    (async () => {
      const cam = await Camera.requestCameraPermissionsAsync();
      setCameraGranted(cam.status === 'granted');

      const location = await LocationService.requestPermission();
      setLocationGranted(location);

      const media = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryGranted(media.status === 'granted');

      // Cargar fotos después de obtener permisos
      await loadPhotosFromGallery();
    })();
  }, [loadPhotosFromGallery]);

  const handleDualCapture = useCallback(async (data: { back: { uri: string }, front: { uri: string }, location?: any, saved?: boolean }) => {
    const photo: DualPhoto = {
      backPhoto: { uri: data.back.uri },
      frontPhoto: { uri: data.front.uri },
      timestamp: Date.now(),
      location: data.location,
    };
    
    // Solo guardar en AsyncStorage si no se guardó en galería
    if (!data.saved) {
      await StorageService.addPhoto(photo);
    }
    
    // Agregar a la lista inmediatamente para UX fluida
    setPhotos(prev => [photo, ...prev]);
    
    // Mostrar mensaje de estado
    if (data.saved) {
      console.log('✅ Foto guardada en galería del dispositivo');
    } else {
      console.log('⚠️ Foto guardada localmente (revisar permisos para galería)');
    }
  }, []);

  const handleDeletePhoto = useCallback(async (timestamp: number) => {
    // Implementar eliminación de fotos
    const updatedPhotos = photos.filter(photo => photo.timestamp !== timestamp);
    setPhotos(updatedPhotos);
    // Aquí se actualizaría también el StorageService
  }, [photos]);

  if (!cameraGranted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Se necesitan permisos de cámara para usar la app
        </Text>
        <Text style={styles.subText}>
          {!locationGranted && 'Se recomiendan permisos de ubicación para el mapa'}
          {!mediaLibraryGranted && '\nSe recomiendan permisos de galería para guardar fotos permanentemente'}
        </Text>
      </View>
    );
  }

  if (loadingPhotos) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>📸</Text>
        <Text style={styles.loadingTitle}>Cargando fotos...</Text>
        <Text style={styles.subText}>
          {mediaLibraryGranted 
            ? 'Obteniendo fotos desde la galería del dispositivo' 
            : 'Cargando fotos locales'
          }
        </Text>
      </View>
    );
  }

  return (
    <>
      <AppNavigation 
        photos={photos}
        onDualCapture={handleDualCapture}
        onDeletePhoto={handleDeletePhoto}
      />
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    margin: 20,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  loadingText: {
    fontSize: 60,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
});