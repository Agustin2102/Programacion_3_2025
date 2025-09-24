import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Modal, Dimensions, SafeAreaView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { DualPhoto } from '../utils/constants';

type Props = {
  photos: DualPhoto[];
};

const { width, height } = Dimensions.get('window');

export const MapScreen: React.FC<Props> = ({ photos }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<DualPhoto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Filtrar fotos que tienen ubicación
  const photosWithLocation = photos.filter(photo => photo.location);

  // Obtener región inicial del mapa
  const getInitialRegion = () => {
    if (photosWithLocation.length === 0) {
      // Región por defecto (México City)
      return {
        latitude: 19.4326,
        longitude: -99.1332,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    // Calcular el centro de todas las fotos
    const latitudes = photosWithLocation.map(photo => photo.location!.latitude);
    const longitudes = photosWithLocation.map(photo => photo.location!.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    const deltaLat = Math.max(maxLat - minLat, 0.01);
    const deltaLng = Math.max(maxLng - minLng, 0.01);

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: deltaLat * 1.2, // Padding
      longitudeDelta: deltaLng * 1.2,
    };
  };

  const handleMarkerPress = useCallback((photo: DualPhoto) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedPhoto(null);
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (photosWithLocation.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>📍 Sin fotos con ubicación</Text>
        <Text style={styles.emptyText}>
          Toma algunas fotos para ver sus ubicaciones en el mapa
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={getInitialRegion()}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {photosWithLocation.map((photo, index) => (
          <Marker
            key={photo.timestamp}
            coordinate={{
              latitude: photo.location!.latitude,
              longitude: photo.location!.longitude,
            }}
            onPress={() => handleMarkerPress(photo)}
          >
            <View style={styles.markerContainer}>
              <Image 
                source={{ uri: photo.backPhoto.uri }} 
                style={styles.markerImage}
              />
              <View style={styles.markerBadge}>
                <Text style={styles.markerText}>{index + 1}</Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header con contador */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🗺️ Mapa de Fotos</Text>
          <Text style={styles.headerCount}>
            {photosWithLocation.length} ubicación{photosWithLocation.length !== 1 ? 'es' : ''}
          </Text>
        </View>
      </SafeAreaView>

      {/* Modal para mostrar la foto */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={closeModal} />
          
          {selectedPhoto && (
            <View style={styles.modalContent}>
              <View style={styles.photoContainer}>
                <View style={styles.photoGrid}>
                  <Image 
                    source={{ uri: selectedPhoto.backPhoto.uri }} 
                    style={styles.modalPhoto}
                  />
                  <Image 
                    source={{ uri: selectedPhoto.frontPhoto.uri }} 
                    style={styles.modalPhoto}
                  />
                </View>
              </View>
              
              <View style={styles.photoInfo}>
                <Text style={styles.photoDate}>
                  📅 {formatDate(selectedPhoto.timestamp)}
                </Text>
                {selectedPhoto.location && (
                  <Text style={styles.photoLocation}>
                    📍 {selectedPhoto.location.address || 
                        `${selectedPhoto.location.latitude.toFixed(6)}, ${selectedPhoto.location.longitude.toFixed(6)}`}
                  </Text>
                )}
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#e60023',
  },
  markerBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e60023',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxWidth: width * 0.9,
    maxHeight: height * 0.8,
  },
  photoContainer: {
    marginBottom: 15,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  modalPhoto: {
    width: (width * 0.9 - 60) / 2,
    height: (width * 0.9 - 60) / 2,
    borderRadius: 12,
  },
  photoInfo: {
    marginBottom: 20,
  },
  photoDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  photoLocation: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#e60023',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});