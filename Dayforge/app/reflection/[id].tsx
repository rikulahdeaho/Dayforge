import { SymbolView } from '@/components/dayforge/SymbolView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';
import { type Mood } from '@/types';

function moodEmoji(mood: Mood) {
  switch (mood) {
    case 'sad':
      return '😔';
    case 'neutral':
      return '😐';
    case 'good':
      return '😊';
    case 'happy':
      return '✨';
    default:
      return '😊';
  }
}

export default function ReflectionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { state } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const entry = state.reflectionHistory.find((item) => item.id === params.id);

  if (!entry) {
    return (
      <View style={[styles.safe, { backgroundColor: palette.background }]}>
        <TopGradientBackground />
        <View style={styles.center}>
          <Text style={[styles.missingText, { color: palette.mutedText }]}>Reflection not found.</Text>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: palette.accent }]}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: palette.text }]}>Reflection Detail</Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeButton, { borderColor: palette.border, backgroundColor: palette.cardStrong }]}>
            <SymbolView
              name={resolveSymbolName({ ios: 'xmark', android: 'close', web: 'close' })}
              size={18}
              tintColor={palette.text}
            />
          </Pressable>
        </View>

        <SurfaceCard palette={palette} style={styles.card}>
          <Text style={styles.emoji}>{moodEmoji(entry.mood)}</Text>
          <Text style={[styles.dateText, { color: palette.text }]}>{entry.fullDate}</Text>

          <Text style={[styles.sectionLabel, { color: palette.accent }]}>What went well</Text>
          <Text style={[styles.sectionBody, { color: palette.text }]}>{entry.wentWell || entry.preview}</Text>

          <Text style={[styles.sectionLabel, { color: palette.accent }]}>What I am grateful for</Text>
          <Text style={[styles.sectionBody, { color: palette.text }]}>{entry.gratefulFor || entry.preview}</Text>
        </SurfaceCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 68,
    paddingBottom: 40,
  },
  headerRow: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  emoji: {
    fontSize: 34,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  missingText: {
    fontSize: 16,
    marginBottom: 12,
  },
  backButton: {
    borderRadius: 10,
    minHeight: 40,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
