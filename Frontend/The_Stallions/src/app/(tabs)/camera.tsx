import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { events } from '../../services/events';
import { userService } from '../../services/userService';

type AssetInfo = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export default function CameraScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visibilidad, setVisibilidad] = useState<'privada' | 'publica'>('publica');
  const [descripcion, setDescripcion] = useState('');
  const [asset, setAsset] = useState<AssetInfo | null>(null);

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

    const a = result.assets[0];
    setAsset({
      uri: a.uri,
      fileName: a.fileName,
      mimeType: a.mimeType,
    });
    setDescripcion('');
  };

  const tomarOtra = () => {
    setAsset(null);
    setDescripcion('');
    setError('');
    handleCapture();
  };

  const subirFoto = async () => {
    if (!asset) return;
    setLoading(true);
    setError('');

    try {
      await userService.uploadFoto(asset.uri, visibilidad, descripcion, asset);
      events.emit('fotoSubida', { fecha: new Date().toISOString() });
      setAsset(null);
      setDescripcion('');
      setVisibilidad('publica');
      router.replace('/(tabs)/misFotos');
    } catch (e: any) {
      setError(e?.message || 'Error inesperado al subir la foto');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#e40077" />
          <Text style={styles.loadingText}>Subiendo foto...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      {!asset ? (
        <View style={styles.center}>
          <TouchableOpacity onPress={handleCapture} style={styles.captureButton}>
            <Text style={styles.captureText}>📷</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Toca para tomar una foto</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.publishContainer}>
          <Image source={{ uri: asset.uri }} style={styles.preview} resizeMode="cover" />

          <TextInput
            style={styles.descInput}
            placeholder="Escribe una descripción para tu foto..."
            placeholderTextColor="#777"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            maxLength={1000}
          />

          <Text style={styles.visLabel}>¿Quién puede ver tu foto?</Text>
          <View style={styles.modalOptions}>
            <TouchableOpacity
              style={[styles.visBtn, visibilidad === 'privada' && styles.visBtnActiva]}
              onPress={() => setVisibilidad('privada')}
            >
              <Text style={[styles.visText, visibilidad === 'privada' && styles.visTextActiva]}>
                🔒 Privada
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.visBtn, visibilidad === 'publica' && styles.visBtnActiva]}
              onPress={() => setVisibilidad('publica')}
            >
              <Text style={[styles.visText, visibilidad === 'publica' && styles.visTextActiva]}>
                🌍 Pública
              </Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.publishButtons}>
            <TouchableOpacity style={styles.publicarBtn} onPress={subirFoto}>
              <Text style={styles.publicarText}>Subir foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.otraBtn} onPress={tomarOtra}>
              <Text style={styles.otraText}>Tomar otra 📷</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0b' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { color: '#aaa', marginTop: 12 },
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
  errorText: { color: '#ff5c5c', marginTop: 12, fontSize: 14, textAlign: 'center' },

  publishContainer: { padding: 16 },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    backgroundColor: '#000',
    marginBottom: 16,
  },
  descInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 60,
    marginBottom: 18,
  },
  visLabel: { color: '#aaa', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  modalOptions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  visBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
  },
  visBtnActiva: { borderColor: '#e40077', backgroundColor: '#2a1020' },
  visText: { color: '#aaa', fontWeight: '600', fontSize: 14 },
  visTextActiva: { color: '#e40077' },

  publishButtons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  publicarBtn: {
    flex: 1,
    backgroundColor: '#e40077',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  publicarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  otraBtn: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  otraText: { color: '#e40077', fontWeight: '700', fontSize: 14 },
});
