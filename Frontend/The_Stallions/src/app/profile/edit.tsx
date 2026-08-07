import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAsync } from '../../hooks/useAsync';
import { userService } from '../../services/userService';
import { validateEmail } from '../../utils/validators';
import { colors } from '../../constants/ui';
import type { Gender, UpdateProfileInput, UserProfile } from '../../services/userTypes';
import CenterLoading from '../../components/profile/CenterLoading';
import ErrorState from '../../components/profile/ErrorState';
import Section from '../../components/profile/Section';
import Field from '../../components/profile/Field';
import SelectChips from '../../components/profile/SelectChips';
import Avatar from '../../components/profile/Avatar';
import Button from '../../components/profile/Button';
import CenteredBox from '../../components/profile/CenteredBox';

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: 'Masculino', value: 'male' },
  { label: 'Femenino', value: 'female' },
  { label: 'Otro', value: 'other' },
  { label: 'Prefiero no decirlo', value: 'prefer_not_to_say' },
];

type FieldErrors = Partial<Record<keyof UpdateProfileInput, string>>;

function EditProfileForm({ initialProfile }: { initialProfile: UserProfile }) {
  const [form, setForm] = useState<UpdateProfileInput>({
    firstName: initialProfile.firstName,
    lastName: initialProfile.lastName,
    username: initialProfile.username,
    email: initialProfile.email,
    phone: initialProfile.phone,
    birthDate: initialProfile.birthDate ?? '',
    gender: initialProfile.gender,
    city: initialProfile.city,
    bio: initialProfile.bio,
    photoUrl: initialProfile.photoUrl,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [photoError, setPhotoError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof UpdateProfileInput>(key: K, value: UpdateProfileInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const pickPhoto = async () => {
    setPhotoError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPhotoError('Se necesita acceso a la galería para cambiar la foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setForm((f) => ({ ...f, photoUrl: uri }));
    setUploading(true);
    try {
      const { photoUrl } = await userService.uploadProfilePhoto(uri);
      setForm((f) => ({ ...f, photoUrl }));
    } catch (e: any) {
      setPhotoError(e?.message ?? 'No se pudo subir la foto.');
    } finally {
      setUploading(false);
    }
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!form.firstName.trim()) next.firstName = 'Ingresá tu nombre.';
    if (!form.lastName.trim()) next.lastName = 'Ingresá tu apellido.';
    if (!form.username.trim()) next.username = 'Ingresá tu nombre de usuario.';
    else if (!/^[a-zA-Z0-9_.]{3,20}$/.test(form.username.trim()))
      next.username = 'Entre 3 y 20 caracteres (letras, números, . o _).';
    if (!validateEmail(form.email.trim())) next.email = 'Ingresá un correo válido.';
    if (form.phone.trim() && !/^\+?[0-9()\-\s]{7,20}$/.test(form.phone.trim()))
      next.phone = 'Formato de teléfono inválido.';
    if ((form.birthDate ?? '').trim() && !/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test((form.birthDate ?? '').trim()))
      next.birthDate = 'Usá el formato DD/MM/AAAA.';
    if (form.bio.length > 160) next.bio = 'Máximo 160 caracteres.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    setSaveError('');
    setSaved(false);
    if (!validate()) return;
    setSaving(true);
    try {
      await userService.updateProfile({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        bio: form.bio.trim(),
      });
      setSaved(true);
    } catch (e: any) {
      setSaveError(e?.message ?? 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <CenteredBox>
        <View style={styles.avatarWrap}>
          <Avatar
            uri={form.photoUrl}
            name={`${form.firstName} ${form.lastName}`}
            size={104}
            onEditPress={pickPhoto}
          />
          <Text style={styles.avatarHint}>{uploading ? 'Subiendo…' : 'Tocá la cámara para cambiar la foto'}</Text>
          {photoError ? <Text style={styles.errorText}>{photoError}</Text> : null}
        </View>

        <Section title="Información personal">
          <Field label="Nombre" value={form.firstName} onChangeText={(v) => set('firstName', v)} placeholder="Nombre" error={errors.firstName} autoCapitalize="words" autoCorrect={false} />
          <Field label="Apellido" value={form.lastName} onChangeText={(v) => set('lastName', v)} placeholder="Apellido" error={errors.lastName} autoCapitalize="words" autoCorrect={false} />
          <Field label="Nombre de usuario" value={form.username} onChangeText={(v) => set('username', v)} placeholder="usuario" error={errors.username} autoCapitalize="none" autoCorrect={false} />
          <Field label="Correo electrónico" value={form.email} onChangeText={(v) => set('email', v)} placeholder="correo@ejemplo.com" keyboardType="email-address" error={errors.email} autoCapitalize="none" autoCorrect={false} />
          <Field label="Teléfono" value={form.phone} onChangeText={(v) => set('phone', v)} placeholder="+505 0000 0000" keyboardType="phone-pad" error={errors.phone} />
          <Field label="Fecha de nacimiento" value={form.birthDate ?? ''} onChangeText={(v) => set('birthDate', v)} placeholder="DD/MM/AAAA" error={errors.birthDate} keyboardType="numbers-and-punctuation" />
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Género</Text>
            <SelectChips options={GENDER_OPTIONS} value={form.gender ?? 'prefer_not_to_say'} onChange={(v) => set('gender', v)} />
          </View>
          <Field label="Ciudad" value={form.city} onChangeText={(v) => set('city', v)} placeholder="Managua" autoCapitalize="words" />
          <Field label="Biografía" value={form.bio} onChangeText={(v) => set('bio', v)} placeholder="Contá algo sobre vos…" multiline maxLength={160} helper={`${form.bio.length}/160`} />
        </Section>

        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
        {saved ? <Text style={styles.successText}>Cambios guardados correctamente.</Text> : null}

        <Button title="Guardar cambios" loading={saving} onPress={handleSave} />
      </CenteredBox>
    </KeyboardAvoidingView>
  );
}

export default function EditProfileScreen() {
  const { data, loading, error, refetch } = useAsync(() => userService.getProfile());

  if (loading) return <CenterLoading />;
  if (error || !data) return <ErrorState message={error ?? 'No se pudo cargar el perfil.'} onRetry={refetch} />;
  return <EditProfileForm initialProfile={data} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  avatarWrap: { alignItems: 'center', marginBottom: 22 },
  avatarHint: { color: colors.subtext, fontSize: 12, marginTop: 10 },
  fieldBlock: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.subtext, marginBottom: 8 },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: 12 },
  successText: { color: colors.success, fontSize: 13, marginBottom: 12 },
});
