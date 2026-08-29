import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { userService } from '../../services/userService';
import { useTheme } from '../../context/ThemeContext';
import Section from '../../components/profile/Section';
import ListRow from '../../components/profile/ListRow';
import Button from '../../components/profile/Button';
import DeleteAccountModal from '../../components/profile/DeleteAccountModal';
import CenteredBox from '../../components/profile/CenteredBox';

const SUPPORT_ITEMS = [
  { icon: '💬', title: 'Contactar soporte', subtitle: 'Escribinos y te respondemos a la brevedad' },
  { icon: '📄', title: 'Términos y Condiciones', subtitle: 'Reglas de uso de Wani Connect' },
  { icon: '🛡️', title: 'Política de privacidad', subtitle: 'Cómo usamos y protegemos tus datos' },
];

export default function HelpScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [notice, setNotice] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await userService.logout(); // emite logged-out; SessionBridge redirige a login
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <CenteredBox>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <Section title="Soporte">
        {SUPPORT_ITEMS.map((item, index) => (
          <ListRow
            key={item.title}
            icon={item.icon}
            title={item.title}
            subtitle={item.subtitle}
            chevron
            last={index === SUPPORT_ITEMS.length - 1}
            onPress={() => {
              setNotice('Este contenido estará disponible próximamente.');
            }}
          />
        ))}
      </Section>

      <Section title="App">
        <ListRow icon="🧭" title="Versión" subtitle={`Wani Connect · v${appVersion}`} last />
      </Section>

      <Section title="Cuenta">
        <View style={styles.padding}>
          <Button title="Cerrar sesión" variant="outline" loading={signingOut} onPress={handleSignOut} />
          <View style={styles.spacer} />
          <Button title="Eliminar cuenta" variant="danger" onPress={() => setDeleteVisible(true)} />
        </View>
      </Section>

      <DeleteAccountModal visible={deleteVisible} onClose={() => setDeleteVisible(false)} />
    </CenteredBox>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  padding: { padding: 14 },
  spacer: { height: 10 },
  notice: {
    color: colors.accent,
    fontSize: 13,
    marginBottom: 14,
    backgroundColor: colors.accentSoft,
    padding: 12,
    borderRadius: 12,
  },
});
