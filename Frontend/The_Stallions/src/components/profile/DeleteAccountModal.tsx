import React, { useState } from 'react';
import { View } from 'react-native';
import ConfirmModal from './ConfirmModal';
import Field from './Field';
import { privacyService } from '../../services/privacyService';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Two-step destructive confirmation. The second step requires typing
 * "ELIMINAR" to enable the confirm button.
 */
export default function DeleteAccountModal({ visible, onClose }: DeleteAccountModalProps) {
  const [step, setStep] = useState<'confirm' | 'type'>('confirm');
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setStep('confirm');
    setTyped('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await privacyService.deleteAccount();
      // The service emits the logged-out event; the SessionBridge redirects to login.
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo eliminar la cuenta.');
      setLoading(false);
    }
  };

  const cancel = () => handleClose();

  return (
    <>
      <ConfirmModal
        visible={visible && step === 'confirm'}
        title="¿Eliminar tu cuenta?"
        message="Tu cuenta será suspendida y tu contenido se ocultará de la comunidad. No podrás volver a iniciar sesión. ¿Deseas continuar?"
        confirmLabel="Continuar"
        destructive
        onConfirm={() => {
          setError('');
          setStep('type');
        }}
        onCancel={cancel}
      />
      <ConfirmModal
        visible={visible && step === 'type'}
        title="Confirmar eliminación"
        message="Para confirmar, escribí la palabra ELIMINAR en mayúsculas."
        confirmLabel="Eliminar cuenta"
        destructive
        loading={loading}
        confirmDisabled={typed !== 'ELIMINAR'}
        onConfirm={handleDelete}
        onCancel={cancel}
      >
        <View>
          <Field
            label="Confirmación"
            value={typed}
            onChangeText={(text) => {
              setTyped(text);
              if (error) setError('');
            }}
            placeholder="ELIMINAR"
            autoCapitalize="characters"
            autoCorrect={false}
            error={error}
          />
        </View>
      </ConfirmModal>
    </>
  );
}
