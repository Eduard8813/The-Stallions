import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import qrcodeFactory from 'qrcode-generator';
import { colors } from '../../constants/ui';
import Button from './Button';

interface TOTPSetupModalProps {
  visible: boolean;
  secret: string;
  otpAuthUrl: string | null;
  onClose: () => void;
}

function QRCode({ value, size }: { value: string; size: number }) {
  const { count, dark } = useMemo(() => {
    const qr = qrcodeFactory(0, 'M');
    qr.addData(value);
    qr.make();
    const c = qr.getModuleCount();
    const grid = Array.from({ length: c }, (_, r) =>
      Array.from({ length: c }, (_, col) => qr.isDark(r, col))
    );
    return { count: c, dark: grid };
  }, [value]);

  const cellSize = Math.max(2, Math.floor(size / count));
  const margin = 10;
  const side = count * cellSize;

  return (
    <View style={[styles.qrBox, { width: side + margin * 2, height: side + margin * 2, padding: margin }]}>
      {dark.map((row, r) => (
        <View key={r} style={styles.qrRow}>
          {row.map((isDark, c) => (
            <View key={c} style={[styles.qrCell, { width: cellSize, height: cellSize }, isDark && styles.qrCellDark]} />
          ))}
        </View>
      ))}
    </View>
  );
}

function groupSecret(secret: string): string {
  return secret.toUpperCase().replace(/(.{4})/g, '$1 ').trim();
}

export default function TOTPSetupModal({ visible, secret, otpAuthUrl, onClose }: TOTPSetupModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView bounces={false} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Escaneá el código QR</Text>
            <Text style={styles.subtitle}>Abrí Google Authenticator o Authy y agregá esta cuenta.</Text>

            <View style={styles.qrWrap}>
              <QRCode value={otpAuthUrl ?? secret} size={240} />
            </View>

            <Text style={styles.hint}>¿No podés escanearlo? Ingresá la clave manualmente:</Text>
            <Text selectable style={styles.secret}>{groupSecret(secret)}</Text>

            <Text style={styles.note}>El código de la app cambia cada 30 segundos y se pide al iniciar sesión.</Text>
          </ScrollView>

          <Button title="Ya lo configuré" onPress={onClose} style={styles.button} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  content: { alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 13, color: colors.subtext, lineHeight: 19, textAlign: 'center', marginBottom: 16 },
  qrWrap: {
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 16,
  },
  qrBox: {
    backgroundColor: '#fff',
    borderRadius: 6,
    alignSelf: 'center',
  },
  qrRow: { flexDirection: 'row' },
  qrCell: { backgroundColor: '#fff' },
  qrCellDark: { backgroundColor: '#111827' },
  hint: { fontSize: 12, color: colors.subtext, textAlign: 'center', marginBottom: 8 },
  secret: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.text,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  note: { fontSize: 12, color: colors.subtext, lineHeight: 18, textAlign: 'center', marginBottom: 16 },
  button: { width: '100%' },
});
