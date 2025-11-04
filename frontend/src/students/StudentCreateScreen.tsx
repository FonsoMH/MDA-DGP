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
  useWindowDimensions, // CAMBIO: Importamos el hook
} from 'react-native';
import axios from 'axios';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

import { PICTOGRAMS, type Pictogram } from '../pictograms/catalog';

// Route: 'StudentCreate'
type Props = NativeStackScreenProps<RootStackParamList, 'StudentCreate'>;

//Definimos un punto de corte para "pantalla grande"
const LARGE_SCREEN_BREAKPOINT = 768; // Ancho de un iPad en vertical

type Tutor = { id: number; name: string; email: string };

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function StudentCreateScreen({ navigation }: Props) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [avatarColor, setAvatarColor] = React.useState<string>('');
  const [avatarInitials, setAvatarInitials] = React.useState<string>('??');
  const [passwordIcons, setPasswordIcons] = React.useState<Pictogram[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const maxPasswordLength = 4;
  // Tutores
  const [tutors, setTutors] = React.useState<Tutor[]>([]);
  const [tutorsLoading, setTutorsLoading] = React.useState<boolean>(false);
  const [selectedTutorId, setSelectedTutorId] = React.useState<number | null>(null);

  // Obtenemos el ancho de la pantalla
  const { width } = useWindowDimensions();
  // Calculamos si la pantalla es grande
  const isLargeScreen = width > LARGE_SCREEN_BREAKPOINT;

  // Hacemos que los tamaños de los elementos dependan del tamaño de pantalla
  const titleSize = isLargeScreen ? 24 : 20;
  const picButtonSize = isLargeScreen ? 52 : 42;
  const picImageSize = isLargeScreen ? 32 : 26;
  const previewSlotSize = isLargeScreen ? 44 : 36;
  const previewImageSize = isLargeScreen ? 30 : 24;

  React.useEffect(() => {
    setAvatarInitials(computeInitials(name));
    setAvatarColor((c) => c || randomPastel());
  }, [name]);

  React.useEffect(() => {
    setAvatarColor((c) => c || randomPastel());
  }, []);

  // Cargar tutores (usuarios con rol teacher)
  React.useEffect(() => {
    const loadTutors = async () => {
      try {
        setTutorsLoading(true);
        const res = await axios.get(`${BASE_URL}/api/teachers`);
        // Backend devuelve [{ id, name, email, role }]
        const items: Tutor[] = (res.data || []).map((u: any) => ({ id: u.id, name: u.name, email: u.email }));
        setTutors(items);
      } catch (e) {
        console.error('Error fetching tutors', e);
      } finally {
        setTutorsLoading(false);
      }
    };
    loadTutors();
  }, []);

  const togglePasswordIcon = (pic: Pictogram) => {
    setPasswordIcons((prev) => {
      const found = prev.find((p) => p.key === pic.key);
      if (found) return prev.filter((p) => p.key !== pic.key);
      if (prev.length >= maxPasswordLength) return prev;
      return [...prev, pic];
    });
  };

  const onSubmit = async () => {
    // lógica de submit
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
        assigned_teacher_id: selectedTutorId,
        avatar: { initials: avatarInitials, color: avatarColor },
      };
      await axios.post(`${BASE_URL}/api/students`, payload);
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
        {/* Usamos el tamaño de fuente dinámico */}
        <Text style={[styles.title, { fontSize: titleSize }]}>Crear Nuevo Estudiante</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          { }
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
          <Text style={styles.sectionTitle}>Contraseña con pictogramas y avatar</Text>
          <Text style={styles.help}>Elige {maxPasswordLength} pictogramas para la contraseña del estudiante</Text>

          <View style={styles.pictogramsRow}>
            {PICTOGRAMS.map((p) => {
              const active = !!passwordIcons.find((i) => i.key === p.key);
              return (
                <Pressable
                  key={`pass-${p.key}`}
                  onPress={() => togglePasswordIcon(p)}
                  // Aplicamos tamaño dinámico al botón
                  style={[
                    styles.picButton,
                    active && styles.picButtonActive,
                    { width: picButtonSize, height: picButtonSize },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={p.label || p.key}
                >
                  {p.image ? (
                    // Aplicamos tamaño dinámico a la imagen
                    <Image
                      source={p.image}
                      style={[styles.picImage, { width: picImageSize, height: picImageSize }]}
                    />
                  ) : (
                    <Text style={styles.picText}>{p.emoji || '🔶'}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          { /* Avatar preview */}
          <Text style={[styles.help, { marginTop: 8 }]}>Avatar generado automáticamente</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
              <Text style={[styles.avatarText, { color: getReadableTextColor(avatarColor) }]}>
                {avatarInitials}
              </Text>
            </View>
          </View>


          <Text style={[styles.help, { marginTop: 8 }]}>La contraseña final y el avatar se muestran aquí:</Text>
          <View style={styles.passwordRow}>
            {Array.from({ length: maxPasswordLength }).map((_, idx) => {
              const pic = passwordIcons[idx];
              return (
                // Aplicamos tamaño dinámico al slot
                <View key={idx} style={[styles.previewSlot, { width: previewSlotSize, height: previewSlotSize }]}>
                  {pic?.image ? (
                    //Aplicamos tamaño dinámico a la imagen
                    <Image
                      source={pic.image}
                      style={[styles.previewImage, { width: previewImageSize, height: previewImageSize }]}
                    />
                  ) : (
                    <Text style={styles.previewText}>{pic?.emoji || '?'}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Asignar Tutores */}
        <View style={styles.section}>
          <View style={styles.tutorHeaderRow}>
            <Text style={styles.sectionTitle}>Asignar Tutores</Text>
            <View style={styles.tutorBadge}>
              <Text style={styles.tutorBadgeText}>{selectedTutorId ? '1 seleccionado' : '0 seleccionados'}</Text>
            </View>
          </View>
          <Text style={styles.help}>Selecciona el tutor que será asignado a este estudiante</Text>

          <View style={{ gap: 10, marginTop: 8 }}>
            {tutorsLoading && <Text style={styles.help}>Cargando tutores…</Text>}
            {!tutorsLoading && tutors.length === 0 && (
              <Text style={styles.help}>No hay tutores disponibles.</Text>
            )}
            {!tutorsLoading && tutors.map((t) => {
              const active = selectedTutorId === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setSelectedTutorId(active ? null : t.id)}
                  style={[styles.tutorItem, active && styles.tutorItemActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Seleccionar tutor ${t.name}`}
                >
                  <View style={[styles.tutorCheck, active && styles.tutorCheckActive]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tutorName}>{t.name}</Text>
                    <Text style={styles.tutorEmail}>{t.email}</Text>
                  </View>
                </Pressable>
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
  content: {
    padding: 16,
    gap: 16,
    // Añadimos un ancho máximo y centramos el contenido
    // en la pantalla.
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    // fontSize se aplica dinámicamente
    fontWeight: '700',
    color: '#14213d',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
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
    // width y height se aplican dinámicamente
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
  picText: { fontSize: 22 }, // <<-- tambien se puede hacer dinamico ojo
  picImage: {
    // width y height se aplican dinámicamente
    resizeMode: 'contain',
  },
  passwordRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  previewSlot: {
    // width y height se aplican dinámicamente
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E8EB',
  },
  previewText: { fontSize: 20 }, // Se puede hacer dinámico
  previewImage: {
    // width y height se aplican dinámicamente
    resizeMode: 'contain',
  },
  actionsRow: {
    flexDirection: 'row',
    // Justificar al final
    justifyContent: 'flex-end',
    gap: 12,
  },
  btn: {
    // Quitado 'flex: 1'
    minWidth: 120, // Añadido un ancho mínimo
    paddingVertical: 12,
    paddingHorizontal: 24, // Añadido padding horizontal
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnSecondary: { backgroundColor: '#E5E7EB' },
  btnText: { color: '#fff', fontWeight: '700' },
  btnTextSecondary: { color: '#111' },
  // ... (estilos de avatar y funciones de utilidad sin cambios) ...
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E8EB',
  },
  avatarText: { fontSize: 16, fontWeight: '700' },
  // Tutores
  tutorHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tutorBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  tutorBadgeText: { color: '#4f46e5', fontWeight: '700', fontSize: 12 },
  tutorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    // sombra suave
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tutorItemActive: { borderColor: '#4f46e5', backgroundColor: '#EEF2FF' },
  tutorCheck: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#c7c9cf',
    backgroundColor: 'transparent',
  },
  tutorCheckActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  tutorName: { fontWeight: '700', color: '#111' },
  tutorEmail: { color: '#666', fontSize: 12 },
});

// ===== utilidades avatar =====
function computeInitials(fullName: string): string {
  const parts = fullName
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1) {
    const p = parts[0];
    return (p[0] + (p[1] || p[0])).toUpperCase();
  }
  return '??';
}

function randomPastel(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 70;
  const l = 80;
  return hslToHex(h, s, l);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const C = (1 - Math.abs(2 * l - 1)) * s;
  const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - C / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = C; g = X; b = 0; }
  else if (60 <= h && h < 120) { r = X; g = C; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = C; b = X; }
  else if (180 <= h && h < 240) { r = 0; g = X; b = C; }
  else if (240 <= h && h < 300) { r = X; g = 0; b = C; }
  else { r = C; g = 0; b = X; }
  const R = Math.round((r + m) * 255);
  const G = Math.round((g + m) * 255);
  const B = Math.round((b + m) * 255);
  return '#' + [R, G, B].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function getReadableTextColor(bgHex: string): string {
  if (!bgHex) return '#111';
  const hex = bgHex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#111' : '#fff';
}
