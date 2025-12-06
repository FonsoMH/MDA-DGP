import * as React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BasicCredentialsForm from './components/BasicCredentialsForm';
import { useForm } from 'react-hook-form';
import { CredentialsData, credentialsSchema } from '../../types/validationSchemas';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateAdmin } from './hook/useCreateAdmin';

type Props = NativeStackScreenProps<any, 'AdminCreate'>;

export default function AdminCreateScreen({ navigation }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting: isFormValidating },
  } = useForm({
    resolver: yupResolver(credentialsSchema),
    context: { isEdit: false },
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onBlur',
  });

  const { isSubmitting: isApiSubmitting, onSubmitForm } = useCreateAdmin();
  const isTotalSubmitting = isFormValidating || isApiSubmitting;

  const onSubmitRHF = async (data: any) => {
    const payload = {
      name: data.name,
      email: (data.email || '').toLowerCase().trim(),
      password: data.password ?? '',
    };
    const ok = await onSubmitForm(payload);
    if (ok) {
      // Volver para que UserList recupere foco y refresque (useFocusEffect)
      navigation.goBack();
    }
  };

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Crear Nuevo Administrador</Text>

        <BasicCredentialsForm
          control={control}
          userRole="admin"
          nameError={errors.name?.message}
          emailError={errors.email?.message}
          passwordError={errors.password?.message}
        />

        <View style={styles.actionsRow}>
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => navigation.goBack()}>
            <Text style={[styles.btnText, styles.btnTextSecondary]}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnPrimary, isTotalSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmit(onSubmitRHF)}
            disabled={isTotalSubmitting}
          >
            <Text style={styles.btnText}>{isApiSubmitting ? 'Guardando...' : 'Crear Administrador'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    alignContent: 'center',
  },
  content: {
    padding: 16,
    gap: 16,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#14213d' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  btn: {
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnSecondary: { backgroundColor: '#E5E7EB' },
  btnText: { color: '#fff', fontWeight: '700' },
  btnTextSecondary: { color: '#111' },
});