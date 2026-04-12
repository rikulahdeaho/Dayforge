import { SymbolView } from '@/components/dayforge/SymbolView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import Colors from '@/constants/Colors';
import { Type } from '@/constants/Typography';
import { useAppState } from '@/store/appState';
import { formatFullDateLabel, parseDateKeyToDate } from '@/store/appState.helpers';

export default function ScheduleDayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ dateKey?: string }>();
  const { state } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;

  const date = params.dateKey ? parseDateKeyToDate(params.dateKey) : new Date();
  const dateKey = params.dateKey;
  const fullDate = formatFullDateLabel(date);
  const titleDate = date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const tasksForDate = dateKey ? state.tasks.filter((task) => task.dateKey === dateKey) : [];
  const tasksDone = dateKey ? tasksForDate.filter((task) => Boolean(task.completionByDate[dateKey])).length : 0;
  const habitsDone = dateKey ? state.habits.filter((habit) => Boolean(habit.completionByDate[dateKey])).length : 0;
  const reflection = state.reflectionHistory.find((entry) => entry.fullDate === fullDate);
  const reflectionSnippet = reflection?.preview?.trim() || 'No reflection saved for this date.';

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: palette.text }]}>Day Summary</Text>
          <Pressable onPress={() => router.back()} style={[styles.closeButton, { borderColor: palette.border, backgroundColor: palette.cardStrong }]}>
            <SymbolView name={resolveSymbolName({ ios: 'xmark', android: 'close', web: 'close' })} size={18} tintColor={palette.text} />
          </Pressable>
        </View>

        <Text style={[styles.dateText, { color: palette.mutedText }]}>{titleDate}</Text>

        <SurfaceCard palette={palette} style={styles.kpiCard}>
          <Text style={[styles.cardTitle, { color: palette.text }]}>Overview</Text>
          <View style={[styles.kpiRow, { borderColor: palette.border }]}>
            <Text style={[styles.kpiLabel, { color: palette.mutedText }]}>Tasks</Text>
            <Text style={[styles.kpiValue, { color: palette.text }]}>{tasksDone}/{tasksForDate.length}</Text>
          </View>
          <View style={[styles.kpiRow, { borderColor: palette.border }]}>
            <Text style={[styles.kpiLabel, { color: palette.mutedText }]}>Habits completed</Text>
            <Text style={[styles.kpiValue, { color: palette.text }]}>{habitsDone}</Text>
          </View>
          <View style={[styles.kpiRow, styles.kpiRowLast, { borderColor: palette.border }]}>
            <Text style={[styles.kpiLabel, { color: palette.mutedText }]}>Reflection</Text>
            <Text style={[styles.kpiValue, { color: reflection ? palette.accent : palette.text }]}>{reflection ? 'Saved' : 'None'}</Text>
          </View>
        </SurfaceCard>

        <SurfaceCard palette={palette} style={styles.snippetCard}>
          <Text style={[styles.cardTitle, { color: palette.text }]}>Reflection Snippet</Text>
          <Text numberOfLines={3} style={[styles.snippetText, { color: palette.text }]}>{reflectionSnippet}</Text>
        </SurfaceCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 12, paddingTop: 35, paddingBottom: 40 },
  headerRow: { marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...Type.heroTitle },
  closeButton: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dateText: { ...Type.dateMeta, marginBottom: 12 },
  kpiCard: { borderRadius: 20, marginBottom: 10 },
  snippetCard: { borderRadius: 20 },
  cardTitle: { ...Type.cardTitle, marginBottom: 8 },
  kpiRow: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kpiRowLast: { marginBottom: 0 },
  kpiLabel: { ...Type.metaStrong },
  kpiValue: { ...Type.cardTitle },
  snippetText: { ...Type.body },
});
