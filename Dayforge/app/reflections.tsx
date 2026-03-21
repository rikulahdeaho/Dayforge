import { SymbolView } from '@/components/dayforge/SymbolView';
import { useRouter } from 'expo-router';
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

function moodSummary(mood: Mood) {
  switch (mood) {
    case 'sad':
      return 'Reset and recover day';
    case 'neutral':
      return 'Grounded day';
    case 'good':
      return 'Productive day';
    case 'happy':
      return 'High-energy day';
    default:
      return 'Steady day';
  }
}

export default function ReflectionsScreen() {
  const router = useRouter();
  const { state } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: palette.text }]}>Past Reflections</Text>
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

        {state.reflectionHistory.length ? (
          state.reflectionHistory.map((entry, index) => (
            <Pressable
              key={entry.id}
              onPress={() =>
                router.push({ pathname: '/reflection/[id]' as never, params: { id: entry.id } } as never)
              }>
              <SurfaceCard
                palette={palette}
                style={[
                  styles.entryCard,
                  index === 0 ? { borderColor: palette.accent, borderWidth: 1.6 } : null,
                ]}>
                <View style={styles.entryRow}>
                  <Text style={styles.emoji}>{moodEmoji(entry.mood)}</Text>
                  <View style={styles.entryCopy}>
                    <Text style={[styles.entryDate, { color: palette.text }]}>
                      {entry.fullDate}
                      {index === 0 ? '  •  Latest' : ''}
                    </Text>
                    <Text numberOfLines={2} style={[styles.entryPreview, { color: palette.mutedText }]}>
                      {entry.preview}
                    </Text>
                    <Text numberOfLines={1} style={[styles.entryMoodSummary, { color: palette.accentSoft }]}>
                      {moodSummary(entry.mood)}
                    </Text>
                  </View>
                  <SymbolView
                    name={resolveSymbolName({ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' })}
                    size={18}
                    tintColor={palette.mutedText}
                  />
                </View>
              </SurfaceCard>
            </Pressable>
          ))
        ) : (
          <SurfaceCard palette={palette}>
            <Text style={[styles.emptyText, { color: palette.mutedText }]}>No reflections yet.</Text>
          </SurfaceCard>
        )}
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
  entryCard: {
    marginBottom: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emoji: {
    fontSize: 28,
  },
  entryCopy: {
    flex: 1,
  },
  entryDate: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  entryPreview: {
    fontSize: 13,
    lineHeight: 18,
  },
  entryMoodSummary: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
