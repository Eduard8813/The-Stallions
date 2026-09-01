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
import { EVENTS, events } from '../../services/events';
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
  const [assets, setAssets] = useState<AssetInfo[]>([]);

  const toAssetInfo = (a: any): AssetInfo => ({
    uri: a.uri,
    fileName: a.fileName,
    mimeType: a.mimeType,
  });

  const descLimit = 1000;
  const capDescription = (text: string) => {
    const arr = Array.from(text);
    if (arr.length <= descLimit) return text;
    return arr.slice(0, descLimit).join('');
  };

  const handleCapture = async () => {
    setError('');

    const current = await ImagePicker.getCameraPermissionsAsync();
    let camGranted = current.granted;
    if (!camGranted && current.canAskAgain) {
      const asked = await ImagePicker.requestCameraPermissionsAsync();
      camGranted = asked.granted;
    }

    if (!camGranted) {
      const lib = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!lib.granted && lib.canAskAgain) {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
      const { status: libStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (libStatus !== 'granted') {
        setError('No se permitieron los accesos a la cámara ni a la galería. Activá el permiso en los Ajustes del sistema.');
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1.0,
    });

    if (result.canceled || !result.assets?.length) return;

    setAssets((prev) => [...prev, ...result.assets!.map(toAssetInfo)]);
  };

  const elegirGaleria = async () => {
    setError('');

    const { status: libStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (libStatus !== 'granted') {
      setError('Se necesita acceso a la galería para subir fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: 0,
      quality: 1.0,
    });

    if (result.canceled || !result.assets?.length) return;

    setAssets((prev) => [...prev, ...result.assets!.map(toAssetInfo)]);
  };

  const tomarOtra = () => {
    setError('');
    handleCapture();
  };

  const eliminarFoto = (index: number) => {
    setAssets((prev) => prev.filter((_, i) => i !== index));
  };

  const subirFoto = async () => {
    if (!assets.length) return;
    setLoading(true);
    setError('');

    try {
      // Si hay más de una foto, se agrupan bajo un mismo grupoId para que en la
      // comunidad aparezcan juntas en un solo post (carrusel), en el mismo lugar.
      const grupoId = assets.length > 1 ? Date.now() : undefined;
      let ultimoExito = false;
      for (const asset of assets) {
        try {
          await userService.uploadFoto(asset.uri, visibilidad, descripcion, asset, grupoId);
          ultimoExito = true;
        } catch (e: any) {
          setError(e?.message || 'Error inesperado al subir una foto');
        }
      }
      if (!ultimoExito) return;
      events.emit(EVENTS.fotoSubida, { fecha: new Date().toISOString() });
      setAssets([]);
      setDescripcion('');
      setVisibilidad('publica');
      router.replace('/(tabs)/misFotos');
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
      {assets.length === 0 ? (
        <View style={styles.center}>
          <TouchableOpacity onPress={handleCapture} style={styles.captureButton}>
            <Text style={styles.captureText}>📷</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Toca para tomar una foto</Text>
          <TouchableOpacity onPress={elegirGaleria} style={styles.galeriaBtn}>
            <Text style={styles.galeriaText}>Subir foto de galería</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.publishContainer}>
          <Text style={styles.contadorLabel}>Fotos seleccionadas ({assets.length})</Text>
          <View style={styles.thumbsRow}>
            {assets.map((item, index) => (
              <View key={index} style={styles.thumbWrap}>
                <Image source={{ uri: item.uri }} style={styles.thumb} resizeMode="cover" />
                <TouchableOpacity style={styles.thumbX} onPress={() => eliminarFoto(index)}>
                  <Text style={styles.thumbXText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Image source={{ uri: assets[0].uri }} style={styles.preview} resizeMode="cover" />

          <TextInput
            style={styles.descInput}
            placeholder="Escribe una descripción para tus fotos..."
            placeholderTextColor="#777"
            value={descripcion}
            onChangeText={(t) => setDescripcion(capDescription(t))}
            multiline
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
          </View>
          <View style={styles.masButtons}>
            <TouchableOpacity style={styles.otraBtn} onPress={tomarOtra}>
              <Text style={styles.otraText}>📷 Tomar otra</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.otraBtn} onPress={elegirGaleria}>
              <Text style={styles.otraText}>De galería</Text>
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
  galeriaBtn: {
    marginTop: 20,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  galeriaText: { color: '#e40077', fontWeight: '600', fontSize: 15 },
  errorText: { color: '#ff5c5c', marginTop: 12, fontSize: 14, textAlign: 'center' },

  publishContainer: { padding: 16 },
  contadorLabel: { color: '#aaa', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  thumbsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  thumbWrap: { position: 'relative' },
  thumb: { width: 84, height: 84, borderRadius: 10, backgroundColor: '#000' },
  thumbX: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e40077',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbXText: { color: '#fff', fontSize: 12, fontWeight: '700', lineHeight: 14 },
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

  publishButtons: { marginTop: 4 },
  publicarBtn: {
    backgroundColor: '#e40077',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  publicarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  masButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },
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
