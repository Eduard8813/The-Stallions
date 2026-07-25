import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import NicaraguaMap from '../../components/NicaraguaMap';

export default function ExplorarScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.topBar} />
      <View style={styles.mapArea}>
        <NicaraguaMap />
      </View>
      <View style={styles.bottomBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  topBar: { height: 60, backgroundColor: '#000000' },
  mapArea: { flex: 1 },
  bottomBar: { height: 0 },
});
