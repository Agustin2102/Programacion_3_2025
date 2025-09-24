import React from 'react';
import { View, ScrollView, StyleSheet, Text, Image, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');
const itemWidth = (width - 30) / 2; // 2 columnas con márgenes

// Fotos de ejemplo estilo Pinterest
const samplePhotos = [
  {
    id: 1,
    uri: 'https://picsum.photos/400/600?random=1',
    title: 'Paisaje montañoso',
    location: 'Mendoza, Argentina',
    height: Math.random() * 200 + 200, // altura aleatoria para efecto Pinterest
  },
  {
    id: 2,
    uri: 'https://picsum.photos/400/800?random=2',
    title: 'Arquitectura urbana',
    location: 'Buenos Aires, Argentina',
    height: Math.random() * 200 + 200,
  },
  {
    id: 3,
    uri: 'https://picsum.photos/400/500?random=3',
    title: 'Naturaleza',
    location: 'Bariloche, Argentina',
    height: Math.random() * 200 + 200,
  },
  {
    id: 4,
    uri: 'https://picsum.photos/400/700?random=4',
    title: 'Arte urbano',
    location: 'Córdoba, Argentina',
    height: Math.random() * 200 + 200,
  },
  {
    id: 5,
    uri: 'https://picsum.photos/400/450?random=5',
    title: 'Costa atlántica',
    location: 'Mar del Plata, Argentina',
    height: Math.random() * 200 + 200,
  },
  {
    id: 6,
    uri: 'https://picsum.photos/400/650?random=6',
    title: 'Vida nocturna',
    location: 'Rosario, Argentina',
    height: Math.random() * 200 + 200,
  },
  {
    id: 7,
    uri: 'https://picsum.photos/400/550?random=7',
    title: 'Tradiciones',
    location: 'Salta, Argentina',
    height: Math.random() * 200 + 200,
  },
  {
    id: 8,
    uri: 'https://picsum.photos/400/750?random=8',
    title: 'Aventura',
    location: 'Ushuaia, Argentina',
    height: Math.random() * 200 + 200,
  },
];

export const FeedScreen: React.FC = () => {
  // Dividir fotos en dos columnas
  const leftColumn = samplePhotos.filter((_, index) => index % 2 === 0);
  const rightColumn = samplePhotos.filter((_, index) => index % 2 === 1);

  const renderPhotoCard = (photo: any) => (
    <TouchableOpacity 
      key={photo.id} 
      style={[styles.photoCard, { height: photo.height }]}
      activeOpacity={0.9}
    >
      <Image source={{ uri: photo.uri }} style={styles.photoImage} />
      <View style={styles.photoOverlay}>
        <Text style={styles.photoTitle}>{photo.title}</Text>
        <Text style={styles.photoLocation}>📍 {photo.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header estilo Pinterest */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📸 Photo Locations</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Feed estilo Pinterest con dos columnas */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.feedContainer}>
          {/* Columna izquierda */}
          <View style={styles.column}>
            {leftColumn.map(renderPhotoCard)}
          </View>
          
          {/* Columna derecha */}
          <View style={styles.column}>
            {rightColumn.map(renderPhotoCard)}
          </View>
        </View>
        
        {/* Espaciado inferior para el tab bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Para el notch
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  feedContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  column: {
    flex: 1,
    paddingHorizontal: 5,
  },
  photoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  photoImage: {
    width: '100%',
    flex: 1,
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
  },
  photoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  photoLocation: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  bottomSpacing: {
    height: 100, // Espacio para el tab bar
  },
});