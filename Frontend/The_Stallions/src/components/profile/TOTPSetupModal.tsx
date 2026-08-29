import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import qrcodeFactory from 'qrcode-generator';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

interface TOTPSetupModalProps {
  visible: boolean;
  secret: string;
  otpAuthUrl: string | null;
  onClose: () => void;
}

function QRImage({ value, size }: { value: string; size: number }) {
  const source = useMemo(() => {
    const qr = qrcodeFactory(0, 'M');
    qr.addData(value);
    qr.make();
    return { uri: qr.createDataURL(8, 2) };
  }, [value]);

  return <Image source={source} style={{ width: size, height: size }} contentFit="contain" />;
}

function groupSecret(secret: string): string {
  return secret.toUpperCase().replace(/(.{4})/g, '$1 ').trim();
}

export default function TOTPSetupModal({ visible, secret, otpAuthUrl, onClose }: TOTPSetupModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView bounces={false} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Escaneá el código QR</Text>
            <Text style={styles.subtitle}>Abrí Google Authenticator o Authy y agregá esta cuenta.</Text>

            <View style={styles.qrWrap}>
              <QRImage value={otpAuthUrl ?? secret} size={220} />
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

const createStyles = (colors: any) =>
  StyleSheet.create({
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
