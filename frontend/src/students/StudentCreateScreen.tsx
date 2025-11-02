import * as React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { API_BASE_URL } from '../config';
import { PICTOGRAMS, type Pictogram } from '../pictograms/catalog';

// Route: 'StudentCreate'
type Props = NativeStackScreenProps<RootStackParamList, 'StudentCreate'>;

export default function StudentCreateScreen({ navigation }: Props) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [avatar, setAvatar] = React.useState<Pictogram | null>(null);
  const [passwordIcons, setPasswordIcons] = React.useState<Pictogram[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const maxPasswordLength = 4; // choose 4 pictograms

  const togglePasswordIcon = (pic: Pictogram) => {
    setPasswordIcons((prev) => {
      const found = prev.find((p) => p.key === pic.key);
      if (found) return prev.filter((p) => p.key !== pic.key);
      if (prev.length >= maxPasswordLength) return prev; // ignore if full
      return [...prev, pic];
    });
  };

  const onSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      alert('Nombre y correo son obligatorios');
      return;
    }
    if (passwordIcons.length !== maxPasswordLength) {
      alert(`Selecciona ${maxPasswordLength} pictogramas para la contraseña`);
      return;
    }
    console.log(passwordIcons);
    try {
      setSubmitting(true);
      const pictogram_password = passwordIcons.map((p) => p.key).join('-');
      console.log(pictogram_password);
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        pictogram_password,
        assigned_teacher_id: null,
      };
      await axios.post(`${API_BASE_URL}/api/students`, payload);
      alert('Estudiante creado');
      navigation.goBack();
    } catch (e: any) {
      console.error(e?.response?.data || e.message);
      alert('Error creando el estudiante');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Crear Nuevo Estudiante</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>

          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ej: María López García"
            style={styles.input}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="ejemplo@correo.com"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contraseña y avatar con pictogramas</Text>
          <Text style={styles.help}>Elige {maxPasswordLength} pictogramas para la contraseña del estudiante</Text>

          <View style={styles.pictogramsRow}>
            {PICTOGRAMS.map((p) => {
              const active = !!passwordIcons.find((i) => i.key === p.key);
              return (
                <Pressable
                  key={`pass-${p.key}`}
                  onPress={() => togglePasswordIcon(p)}
                  style={[styles.picButton, active && styles.picButtonActive]}
                  accessibilityRole="button"
                  accessibilityLabel={p.label || p.key}
                >
                  {p.image ? (
                    <Image source={p.image} style={styles.picImage} />
                  ) : (
                    <Text style={styles.picText}>{p.emoji || '🔶'}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.help, { marginTop: 8 }]}>Añade pictograma para el avatar del estudiante</Text>
          <View style={styles.pictogramsRow}>
            {PICTOGRAMS.map((p) => {
              const active = avatar?.key === p.key;
              return (
                <Pressable
                  key={`avatar-${p.key}`}
                  onPress={() => setAvatar(p)}
                  style={[styles.picButton, active && styles.picButtonActive]}
                  accessibilityRole="button"
                  accessibilityLabel={p.label || p.key}
                >
                  {p.image ? (
                    <Image source={p.image} style={styles.picImage} />
                  ) : (
                    <Text style={styles.picText}>{p.emoji || '🔶'}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.help, { marginTop: 8 }]}>La contraseña final y el avatar se muestran aquí:</Text>
          <View style={styles.passwordRow}>
            {Array.from({ length: maxPasswordLength }).map((_, idx) => {
              const pic = passwordIcons[idx];
              return (
                <View key={idx} style={styles.previewSlot}>
                  {pic?.image ? (
                    <Image source={pic.image} style={styles.previewImage} />
                  ) : (
                    <Text style={styles.previewText}>{pic?.emoji || '❓'}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => navigation.goBack()}>
            <Text style={[styles.btnText, styles.btnTextSecondary]}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnPrimary, submitting && { opacity: 0.7 }]}
            onPress={onSubmit}
            disabled={submitting}
          >
            <Text style={styles.btnText}>Crear Estudiante</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FB' },
  content: { padding: 16, gap: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#14213d' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    // shadows
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 8,
  },
  sectionTitle: { fontWeight: '700', color: '#111' },
  label: { color: '#333', marginTop: 4 },
  help: { color: '#666', fontSize: 12 },
  input: {
    backgroundColor: '#F4F5F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111',
  },
  pictogramsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  picButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  picButtonActive: {
    borderColor: '#4f46e5',
    backgroundColor: '#EEF2FF',
  },
  picText: { fontSize: 22 },
  picImage: { width: 26, height: 26, resizeMode: 'contain' },
  passwordRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  previewSlot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E8EB',
  },
  previewText: { fontSize: 20 },
  previewImage: { width: 24, height: 24, resizeMode: 'contain' },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnSecondary: { backgroundColor: '#E5E7EB' },
  btnText: { color: '#fff', fontWeight: '700' },
  btnTextSecondary: { color: '#111' },
});
