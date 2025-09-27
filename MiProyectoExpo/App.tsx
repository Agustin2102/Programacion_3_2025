import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { AppNavigation } from './components/AppNavigation';
import { StorageService } from './services/StorageService';
import { LocationService } from './services/LocationService';
import { DualPhoto } from './utils/constants';

export default function App(): React.JSX.Element {
  const [cameraGranted, setCameraGranted] = useState<boolean>(false);
  const [locationGranted, setLocationGranted] = useState<boolean>(false);
  const [mediaLibraryGranted, setMediaLibraryGranted] = useState<boolean>(false);
  const [photos, setPhotos] = useState<DualPhoto[]>([]);

  // permisos iniciales
  useEffect(() => {
    (async () => {
      const cam = await Camera.requestCameraPermissionsAsync();
      setCameraGranted(cam.status === 'granted');

      const location = await LocationService.requestPermission();
      setLocationGranted(location);

      const media = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryGranted(media.status === 'granted');

      // Cargar fotos guardadas
      const savedPhotos = await StorageService.getPhotos();
      setPhotos(savedPhotos);
    })();
  }, []);

  const handleDualCapture = useCallback(async (data: { back: { uri: string }, front: { uri: string }, location?: any }) => {
    const photo: DualPhoto = {
      backPhoto: { uri: data.back.uri },
      frontPhoto: { uri: data.front.uri },
      timestamp: Date.now(),
      location: data.location,
    };
    
    // Guardar en AsyncStorage
    await StorageService.addPhoto(photo);
    
    // Agregar a la lista inmediatamente para UX fluida
    setPhotos(prev => [photo, ...prev]);
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
});