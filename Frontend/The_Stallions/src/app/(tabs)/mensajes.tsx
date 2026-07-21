import { View, Text, StyleSheet } from 'react-native';

export default function MensajesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mensajes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 24, fontWeight: '700' },
});
