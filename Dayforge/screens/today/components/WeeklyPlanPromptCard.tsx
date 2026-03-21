import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SurfaceCard, DayforgePalette } from '@/components/dayforge/Primitives';
import { Fonts } from '@/constants/Typography';

export function WeeklyPlanPromptCard({
  palette,
  onOpen,
}: {
  palette: DayforgePalette;
  onOpen: () => void;
}) {
  return (
    <SurfaceCard palette={palette} style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>Sunday reset is ready</Text>
        <Text style={[styles.badge, { color: palette.accent }]}>WEEKLY</Text>
      </View>
      <Text style={[styles.body, { color: palette.mutedText }]}>Set your focus and lock in a realistic week.</Text>
      <Pressable onPress={onOpen} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={[styles.buttonText, { color: palette.accentStrong }]}>Open weekly plan</Text>
      </Pressable>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: Fonts.heading,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.28)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
});
