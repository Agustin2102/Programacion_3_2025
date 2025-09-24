import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { FeedScreen } from '../screens/FeedScreen';
import { GalleryScreen } from '../screens/GalleryScreen';
import { MapScreen } from '../screens/MapScreen';
import { DualCamera } from '../components/DualCamera';
import { Timer } from '../components/TimerComponent';
import { DualPhoto, CAPTURE_WINDOWS_MS } from '../utils/constants';

const Tab = createBottomTabNavigator();

interface NavigationProps {
  photos: DualPhoto[];
  onDualCapture: (data: { back: { uri: string }, front: { uri: string } }) => void;
  onDeletePhoto?: (timestamp: number) => void;
}

// Componente para la pantalla de cámara
const CameraScreen: React.FC<{ onDualCapture: any }> = ({ onDualCapture }) => {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <DualCamera enabled={true} onDualCapture={onDualCapture} />
      <Timer ms={CAPTURE_WINDOWS_MS} running={false} onEnd={() => {}} />
    </View>
  );
};

export const AppNavigation: React.FC<NavigationProps> = ({ 
  photos, 
  onDualCapture, 
  onDeletePhoto 
}) => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            height: 85,
            paddingBottom: 25,
            paddingTop: 10,
            elevation: 0,
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: -2 },
          },
          tabBarActiveTintColor: '#e60023', // Pinterest red
          tabBarInactiveTintColor: '#767676',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginTop: -2,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Feed"
          component={FeedScreen}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}>
                <Text style={{ fontSize: size, color }}>🏠</Text>
              </View>
            ),
            tabBarLabel: 'Inicio',
          }}
        />
        
        <Tab.Screen
          name="Camera"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{
                width: size + 16,
                height: size + 16,
                borderRadius: (size + 16) / 2,
                backgroundColor: focused ? '#e60023' : '#f0f0f0',
                justifyContent: 'center',
                alignItems: 'center',
                transform: [{ scale: focused ? 1.15 : 1 }],
              }}>
                <Text style={{ 
                  fontSize: size - 2, 
                  color: focused ? '#fff' : '#767676'
                }}>📷</Text>
              </View>
            ),
            tabBarLabel: 'Crear',
          }}
        >
          {() => <CameraScreen onDualCapture={onDualCapture} />}
        </Tab.Screen>
        
        <Tab.Screen
          name="Gallery"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}>
                <Text style={{ fontSize: size, color }}>🖼️</Text>
              </View>
            ),
            tabBarLabel: 'Guardados',
          }}
        >
          {() => (
            <GalleryScreen 
              photos={photos} 
              onBack={() => {}} // No se necesita en navegación por tabs
            />
          )}
        </Tab.Screen>
        
        <Tab.Screen
          name="Map"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}>
                <Text style={{ fontSize: size, color }}>🗺️</Text>
              </View>
            ),
            tabBarLabel: 'Explorar',
          }}
        >
          {() => <MapScreen photos={photos} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};