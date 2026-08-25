import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Image as RNImage, Modal, Button as RNButton } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { events } from '../../services/events';
import api from '../../services/api';

export default function CameraScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [visibilidad, setVisibilidad] = useState<'privada' | 'publica'>('publica');
  let uri: string | undefined;

  const handleCapture = async () => {
    setLoading(true);
    setError('');

    const { status: mediaStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (mediaStatus !== 'granted') {
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryStatus !== 'granted') {
        setError('No se permitieron los accesos a cámara ni galería.');
        setLoading(false);
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      setLoading(false);
      return;
    }

    const asset = result.assets[0];
    uri = asset.uri;

    setLoading(true);
    setError('');

    try {
      setShowConfirm(true);
    } catch (e) {
      setLoading(false);
    }
  };

  const confirmUpload = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError('');

    if (!uri) return;

    try {
      const form = new FormData();
      form.append('photo', { uri, name: `photo_${Date.now()}.jpg`, type: 'image/jpeg' } as any);
      form.append('visibilidad', visibilidad);

      const response = await api.post('/fotos', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.data;
      events.emit('fotoSubida', {
        url: data.url,
        usuarioId: data.usuarioId,
        fecha: new Date().toISOString(),
        visibilidad: data.visibilidad,
      });
      navigation.goBack();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error inesperado al subir la foto');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.cameraArea}>
        <TouchableOpacity onPress={handleCapture} style={styles.captureButton}>
          <Text style={styles.captureText}>Tomar foto</Text>
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        {showConfirm && (
          <Modal visible={true} animationType="fade" transparent>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Seleccionar visibilidad</Text>
              <View style={styles.modalOptions}>
                <TouchableOpacity 
                  style={[{ padding: 12, backgroundColor: visibilidad === 'privada' ? '#e40077' : 'transparent', borderRadius: 8, borderWidth: visibilidad === 'publica' ? 2 : 0, borderColor: visibilidad === 'publica' ? '#e40077' : 'transparent' }]} 
                  onPress={() => setVisibilidad('privada')}
                >
                  <Text style={styles.modalOptionText}>Privada</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[{ padding: 12, backgroundColor: visibilidad === 'publica' ? '#e40077' : 'transparent', borderRadius: 8, borderWidth: visibilidad === 'publica' ? 2 : 0, borderColor: visibilidad === 'publica' ? '#e40077' : 'transparent' }]} 
                  onPress={() => setVisibilidad('publica')}
                >
                  <Text style={styles.modalOptionText}>Pública</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtons}>
                <RNButton title="Cancelar" onPress={() => setShowConfirm(false)} />
                <RNButton title="Subir" onPress={confirmUpload} color="#e40077" />
              </View>
            </View>
          </Modal>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cameraArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e40077',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  captureText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff0000',
    marginTop: 10,
    fontSize: 14,
  },
  modalContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111',
  },
  modalOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  modalOptionText: {
    color: '#e40077',
    fontSize: 16,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
});