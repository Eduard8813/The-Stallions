import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Modal,
  Button as RNButton,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { events } from '../../services/events';
import api from '../../services/api';

export default function CameraScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [visibilidad, setVisibilidad] = useState<'privada' | 'publica'>('publica');
  const [uri, setUri] = useState<string | null>(null);

  const handleCapture = async () => {
    setError('');

    const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (camStatus !== 'granted') {
      const { status: libStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libStatus !== 'granted') {
        setError('No se permitieron los accesos a cámara ni galería.');
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    setUri(result.assets[0].uri);
    setShowConfirm(true);
  };

  const confirmUpload = async () => {
    if (!uri) return;
    setShowConfirm(false);
    setLoading(true);
    setError('');

    try {
      const form = new FormData();
      form.append('photo', { uri, name: `photo_${Date.now()}.jpg`, type: 'image/jpeg' } as any);
      form.append('visibilidad', visibilidad);

      await api.post('/fotos', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      events.emit('fotoSubida', { fecha: new Date().toISOString() });
      router.replace('/(tabs)/misFotos');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error inesperado al subir la foto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#e40077" />
          <Text style={styles.loadingText}>Subiendo foto...</Text>
        </View>
      ) : (
        <View style={styles.center}>
          {uri && <Image source={{ uri }} style={styles.preview} />}
          <TouchableOpacity onPress={handleCapture} style={styles.captureButton}>
            <Text style={styles.captureText}>📷</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Toca para tomar una foto</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      )}

      <Modal visible={showConfirm} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>¿Quién puede ver tu foto?</Text>
            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={[
                  styles.visBtn,
                  visibilidad === 'privada' && styles.visBtnActiva,
                ]}
                onPress={() => setVisibilidad('privada')}
              >
                <Text style={[styles.visText, visibilidad === 'privada' && styles.visTextActiva]}>
                  🔒 Privada
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.visBtn,
                  visibilidad === 'publica' && styles.visBtnActiva,
                ]}
                onPress={() => setVisibilidad('publica')}
              >
                <Text style={[styles.visText, visibilidad === 'publica' && styles.visTextActiva]}>
                  🌍 Pública
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <RNButton
                title="Cancelar"
                onPress={() => setShowConfirm(false)}
                color="#888"
              />
              <RNButton title="Subir" onPress={confirmUpload} color="#e40077" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { color: '#aaa', marginTop: 12 },
  preview: { width: '80%', aspectRatio: 4 / 3, borderRadius: 12, marginBottom: 32 },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#1c1c1c',
    borderWidth: 3,
    borderColor: '#e40077',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureText: { fontSize: 34 },
  hint: { color: '#777', marginTop: 14, fontSize: 14 },
  errorText: { color: '#ff5c5c', marginTop: 10, fontSize: 14, textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 18, color: '#111' },
  modalOptions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  visBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  visBtnActiva: { borderColor: '#e40077', backgroundColor: '#fdeef6' },
  visText: { color: '#555', fontWeight: '600', fontSize: 14 },
  visTextActiva: { color: '#e40077' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
});
