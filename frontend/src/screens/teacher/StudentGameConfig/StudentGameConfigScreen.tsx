import * as React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TeacherStackParamList } from '../../../navigation/TeacherNavigator';
import BackButton from '../../../components/common/BackButton/BackButton';
import { CONFIG_COMPONENTS_JSX } from './ConfigGameComponent';
import { useSaveStudentConfig } from '../hooks/useSaveStudentConfig';
import { useStudentConfigs } from '../hooks/useStudentConfig';

// Add route type in navigation types: StudentGameConfig: { studentId: number }
type Props = NativeStackScreenProps<TeacherStackParamList, 'StudentGameConfig'>;

const CONFIG_MAP = {
  'toca-numero': ['min_value', 'max_value', 'num_elements'],
  'ordena-secuencia': ['min_value', 'max_value', 'num_elements', 'upward'], 
  'deja-igual': ['min_value', 'max_value', 'num_elements', 'num_containers', 'sum'],
  'reparte-igual': ['min_value', 'max_value', 'num_elements', 'num_containers', 'sum'],
};

export default function StudentGameConfigScreen({ route }: Props) {
  const { studentId } = route.params;

  // Responsive: medidas
  const { width } = useWindowDimensions();
  const GAP = 12;

  const titleSize = width >= 1024 ? 24 : width >= 768 ? 22 : 20;

  const { configs, loading, error, setConfigs } = useStudentConfigs(studentId);

  const handleChange = React.useCallback((slug: string, key: string, value: string) => {
    
    const rawValue = value.trim() === '' ? '0' : value;

    const numericValue = Math.max(0, Number(rawValue)); 

    setConfigs((prev: any) => ({ 
        ...prev, 
        [slug]: { 
            ...prev[slug], 
            settings: { 
                ...prev[slug].settings, 
                [key]: numericValue 
            } 
        } 
    }));
  }, []);

  const handleToggle = (slug: string, key: string) => {
    setConfigs((prev: any) => {
      const cur = Boolean(prev[slug]?.settings?.[key]);
      return { ...prev, [slug]: { ...prev[slug], settings: { ...prev[slug].settings, [key]: !cur } } };
    });
  };

  const { saveOne, saving } = useSaveStudentConfig(studentId, configs);

  if (loading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando configuración…</Text>
      </View>
    );
  }

  if (error) {
     return <View style={styles.center}><Text>❌ Error al cargar las configuraciones.</Text></View>;
  }

  const entries = Object.entries(configs) as [string, any][];

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={0}
    >
    <ScrollView
      contentContainerStyle={styles.content}
      style={{ flex: 1 }}
    >
      <BackButton width={130} height={50} />
      <Text style={[styles.title, { fontSize: titleSize }]}>Configuración de juegos</Text>

      <View style={[styles.gridContainer, { gap: GAP }]}>
        {entries.map(([slug, info]) => {
          
          const requiredKeys = CONFIG_MAP[slug as keyof typeof CONFIG_MAP] || []; 
          
          
          const renderProps = { slug, info, handleChange, handleToggle};

          return (
            <View key={slug} style={styles.card}>
              <Text style={styles.cardTitle}>{info.name || slug}</Text>

              {requiredKeys.map((key) => {
                const componentEntry = CONFIG_COMPONENTS_JSX[key];
                if (!componentEntry) return null; 

                const renderFunction = componentEntry.render;

                return (
                  <React.Fragment key={key}>
                    {renderFunction(renderProps)}
                  </React.Fragment>
                );
              })}

              <View style={[styles.actions, { marginTop: 'auto' }]}>
                <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => saveOne(slug)} disabled={saving}
                  accessibilityRole="button" accessibilityLabel={`Guardar configuración de ${info.name || slug}`}
                >
                  <Text style={styles.btnText}>{saving ? 'Guardando…' : 'Guardar'}</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    alignSelf: 'center',
    width: '100%',
    paddingVertical: 30,
    paddingHorizontal: 20
  },

  gridContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    width: '100%',
    justifyContent: 'space-between',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '700', color: '#111', marginBottom: 8 },
  card: { 
    width: '48.5%',
    marginBottom: 12,
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 10, 
    gap: 8, 
    borderWidth: 1, 
    borderColor: '#E6E8EB' 
  },
  cardTitle: { fontWeight: '700', color: '#14213d', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: '#333' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999 },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnText: { color: '#fff', fontWeight: '700' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontWeight: '700' },
  stepValue: { minWidth: 28, textAlign: 'center', fontWeight: '700' },
});
