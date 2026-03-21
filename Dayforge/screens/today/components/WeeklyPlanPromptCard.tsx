import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SurfaceCard, DayforgePalette } from '@/components/dayforge/Primitives';
import { Fonts, Type } from '@/constants/Typography';

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
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => [
          styles.button,
          { borderColor: `${palette.accent}2e`, backgroundColor: palette.surfaceSubtle },
          pressed && styles.pressed,
        ]}>
        <Text style={[styles.buttonText, { color: palette.accentStrong }]}>Open weekly plan</Text>
      </Pressable>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    ...Type.cardTitle,
    fontFamily: Fonts.heading,
  },
  badge: {
    ...Type.meta,
    letterSpacing: 0.6,
  },
  body: {
    ...Type.bodySmall,
    marginBottom: 10,
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    ...Type.metaStrong,
    letterSpacing: 0.3,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
});
