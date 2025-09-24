import React, { useState } from "react";
import { View, FlatList, Image, StyleSheet, Text, TouchableOpacity, Dimensions, Modal, Alert, SafeAreaView } from 'react-native';
import { DualPhoto } from '../utils/constants';
import { LocationService } from '../services/LocationService';
import { PhotoDownloadService } from '../services/PhotoDownloadService';

type Props = { 
  photos: DualPhoto[]; 
  onBack: () => void; 
};

const { width } = Dimensions.get('window');
const itemWidth = (width - 30) / 2; // 2 columnas con márgenes

export const GalleryScreen: React.FC<Props> = ({ photos, onBack }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<DualPhoto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const openPhotoDetail = (photo: DualPhoto) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPhoto(null);
  };

  const downloadPhoto = async (uri: string, filename: string) => {
    try {
      setDownloading(true);
      
      // Usar el nuevo servicio simplificado
      const success = await PhotoDownloadService.downloadPhoto(uri, filename);
      
      if (!success) {
        Alert.alert(
          'Error',
          'No se pudo preparar la foto para guardar',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Error downloading photo:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error al procesar la foto',
        [{ text: 'OK' }]
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadBack = () => {
    if (selectedPhoto) {
      const timestamp = new Date(selectedPhoto.timestamp).toISOString().replace(/:/g, '-');
      downloadPhoto(selectedPhoto.backPhoto.uri, `foto-trasera-${timestamp}.jpg`);
    }
  };

  const handleDownloadFront = () => {
    if (selectedPhoto) {
      const timestamp = new Date(selectedPhoto.timestamp).toISOString().replace(/:/g, '-');
      downloadPhoto(selectedPhoto.frontPhoto.uri, `selfie-${timestamp}.jpg`);
    }
  };

  const handleDownloadBoth = async () => {
    if (selectedPhoto) {
      const timestamp = new Date(selectedPhoto.timestamp).toISOString().replace(/:/g, '-');
      await downloadPhoto(selectedPhoto.backPhoto.uri, `foto-trasera-${timestamp}.jpg`);
      await downloadPhoto(selectedPhoto.frontPhoto.uri, `selfie-${timestamp}.jpg`);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const renderItem = ({ item }: { item: DualPhoto }) => (
    <TouchableOpacity 
      style={[styles.card, { width: itemWidth }]}
      onPress={() => openPhotoDetail(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.backPhoto.uri }} style={styles.back} />
      <Image source={{ uri: item.frontPhoto.uri }} style={styles.front} />
      <View style={styles.overlay}>
        <Text style={styles.dateText}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header con botón de volver */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mi Galería</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Contenido */}
      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📸</Text>
          <Text style={styles.emptyTitle}>No hay fotos aún</Text>
          <Text style={styles.emptySubtitle}>¡Toma tu primera foto dual!</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={p => String(p.timestamp)}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de vista detallada */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalBackdrop} onPress={closeModal} />
            
            {selectedPhoto && (
              <View style={styles.modalContent}>
                {/* Header del modal */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Vista Detallada</Text>
                  <View style={{ width: 30 }} />
                </View>

                {/* Imágenes */}
                <View style={styles.imagesContainer}>
                  <View style={styles.imageWrapper}>
                    <Text style={styles.imageLabel}>📷 Foto Principal</Text>
                    <Image 
                      source={{ uri: selectedPhoto.backPhoto.uri }} 
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={handleDownloadBack}
                      disabled={downloading}
                    >
                      <Text style={styles.downloadButtonText}>
                        {downloading ? '⏳' : '�'} Compartir
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.imageWrapper}>
                    <Text style={styles.imageLabel}>🤳 Selfie</Text>
                    <Image 
                      source={{ uri: selectedPhoto.frontPhoto.uri }} 
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={handleDownloadFront}
                      disabled={downloading}
                    >
                      <Text style={styles.downloadButtonText}>
                        {downloading ? '⏳' : '�'} Compartir
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Información de la foto */}
                <View style={styles.photoInfo}>
                  <Text style={styles.infoTitle}>📅 Fecha y hora</Text>
                  <Text style={styles.infoText}>{formatDate(selectedPhoto.timestamp)}</Text>
                  
                  {selectedPhoto.location && (
                    <>
                      <Text style={styles.infoTitle}>📍 Ubicación</Text>
                      <Text style={styles.infoText}>
                        {LocationService.formatLocation(selectedPhoto.location)}
                      </Text>
                    </>
                  )}
                </View>

                {/* Botón para descargar ambas */}
                <TouchableOpacity 
                  style={styles.downloadAllButton}
                  onPress={handleDownloadBoth}
                  disabled={downloading}
                >
                  <Text style={styles.downloadAllButtonText}>
                    {downloading ? '⏳ Compartiendo...' : '� Compartir Ambas Fotos'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  backButtonText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#212529',
  },
  placeholder: {
    width: 60, // Para equilibrar el header
  },
  list: { 
    padding: 10,
    paddingBottom: 30,
  },
  card: { 
    margin: 5, 
    aspectRatio: 3 / 4, 
    borderRadius: 16, 
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  back: { 
    width: '100%', 
    height: '100%' 
  },
  front: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  dateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContainer: {
    flex: 1,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    flex: 1,
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  imageWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 10,
  },
  downloadButton: {
    backgroundColor: '#e60023',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  photoInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  downloadAllButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  downloadAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});