import * as React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Switch, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAllConfig, updateConfig } from '../../api/studentConfig';
import { RootStackParamList } from '../../types/navigation';

// Add route type in navigation types: StudentGameConfig: { studentId: number }
type Props = NativeStackScreenProps<RootStackParamList, 'StudentGameConfig'>;

export default function StudentGameConfigScreen({ route }: Props) {
  const { studentId } = route.params;
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [configs, setConfigs] = React.useState<any>({});

  // Responsive: medidas
  const { width } = useWindowDimensions();
  const MAX_CONTENT_WIDTH = 900; // columna centrada con ancho cómodo
  const H_PADDING = 16;
  const GAP = 12;

  const titleSize = width >= 1024 ? 24 : width >= 768 ? 22 : 20;
  const stepBtnSize = width >= 768 ? 32 : 28;
  const stepFontSize = width >= 768 ? 20 : 18;

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAllConfig(studentId);
        setConfigs(data.games || {});
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId]);

  const handleStep = (slug: string, key: string, delta: number) => {
    setConfigs((prev: any) => {
      const cur = prev[slug]?.settings?.[key] ?? 0;
      const next = Math.max(0, (cur as number) + delta);
      return { ...prev, [slug]: { ...prev[slug], settings: { ...prev[slug].settings, [key]: next } } };
    });
  };

  const handleToggle = (slug: string, key: string) => {
    setConfigs((prev: any) => {
      const cur = Boolean(prev[slug]?.settings?.[key]);
      return { ...prev, [slug]: { ...prev[slug], settings: { ...prev[slug].settings, [key]: !cur } } };
    });
  };

  const saveOne = async (slug: string) => {
    try {
      setSaving(true);
      const payload = configs[slug]?.settings || {};
      await updateConfig(studentId, slug, payload);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando configuración…</Text>
      </View>
    );
  }

  const entries = Object.entries(configs) as [string, any][];

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { maxWidth: MAX_CONTENT_WIDTH, paddingHorizontal: H_PADDING }]}
      style={{ flex: 1 }}
    >
      <Text style={[styles.title, { fontSize: titleSize }]}>Configuración de juegos</Text>

      <View style={[styles.column, { gap: GAP }]}
      >
        {entries.map(([slug, info]) => (
          <View key={slug} style={styles.card}>
            <Text style={styles.cardTitle}>{info.name || slug}</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Rango</Text>
              <Step value={info.settings.ranges}
                onInc={() => handleStep(slug, 'ranges', +1)}
                onDec={() => handleStep(slug, 'ranges', -1)}
                size={stepBtnSize}
                fontSize={stepFontSize}
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Elementos</Text>
              <Step value={info.settings.num_elements}
                onInc={() => handleStep(slug, 'num_elements', +1)}
                onDec={() => handleStep(slug, 'num_elements', -1)}
                size={stepBtnSize}
                fontSize={stepFontSize}
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Contenedores</Text>
              <Step value={info.settings.num_containers}
                onInc={() => handleStep(slug, 'num_containers', +1)}
                onDec={() => handleStep(slug, 'num_containers', -1)}
                size={stepBtnSize}
                fontSize={stepFontSize}
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Ascendente</Text>
              <Switch value={!!info.settings.upward} onValueChange={() => handleToggle(slug, 'upward')} />
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Usa suma</Text>
              <Switch value={!!info.settings.sum} onValueChange={() => handleToggle(slug, 'sum')} />
            </View>

            <View style={styles.actions}>
              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => saveOne(slug)} disabled={saving}
                accessibilityRole="button" accessibilityLabel={`Guardar configuración de ${info.name || slug}`}
              >
                <Text style={styles.btnText}>{saving ? 'Guardando…' : 'Guardar'}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Step({ value, onInc, onDec, size = 28, fontSize = 18 }: { value: number; onInc: () => void; onDec: () => void; size?: number; fontSize?: number }) {
  return (
    <View style={styles.step}>
      <Pressable style={[styles.stepBtn, { width: size, height: size, borderRadius: size / 2 }]} onPress={onDec} accessibilityRole="button" accessibilityLabel="Disminuir">
        <Text style={[styles.stepBtnText, { fontSize } ]}>−</Text>
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable style={[styles.stepBtn, { width: size, height: size, borderRadius: size / 2 }]} onPress={onInc} accessibilityRole="button" accessibilityLabel="Aumentar">
        <Text style={[styles.stepBtnText, { fontSize } ]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { 
    paddingVertical: 16, 
    gap: 12,
    alignSelf: 'center',
    width: '100%',
  },
  column: {
    flexDirection: 'column',
    width: '100%',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '700', color: '#111', marginBottom: 8 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, gap: 8, borderWidth: 1, borderColor: '#E6E8EB' },
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
