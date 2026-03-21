import { SymbolView } from '@/components/dayforge/SymbolView';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';
import { formatFullDateLabel, toDateKey } from '@/store/appState.helpers';

export default function SchedulePickerScreen() {
  const router = useRouter();
  const { state } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;

  const scheduleDateOptions = Array.from({ length: 21 }, (_, index) => {
    const offset = index - 7;
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    const dateKey = toDateKey(date);
    const fullDate = formatFullDateLabel(date);
    const tasksForDate = state.tasks.filter((task) => task.dateKey === dateKey);
    const tasksDone = tasksForDate.filter((task) => Boolean(task.completionByDate[dateKey])).length;
    const habitsDone = state.habits.filter((habit) => Boolean(habit.completionByDate[dateKey])).length;
    const reflectionDone = state.reflectionHistory.some((entry) => entry.fullDate === fullDate);

    return {
      id: `${dateKey}-${index}`,
      dateKey,
      label: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      tasksDone,
      tasksTotal: tasksForDate.length,
      habitsDone,
      reflectionDone,
    };
  });

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: palette.text }]}>Schedule</Text>
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
          {scheduleDateOptions.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push({ pathname: '/schedule-day', params: { dateKey: item.dateKey } } as never)}
              style={[styles.row, { borderColor: palette.border }]}>
              <Text style={[styles.dateText, { color: palette.text }]}>{item.label}</Text>
              <Text style={[styles.metaText, { color: palette.mutedText }]}>
                {item.tasksDone}/{item.tasksTotal} tasks | {item.habitsDone} habits |{' '}
                {item.reflectionDone ? 'reflection saved' : 'no reflection'}
              </Text>
            </Pressable>
          ))}
        </SurfaceCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingHorizontal: 12,
    paddingTop: 68,
    paddingBottom: 40,
  },
  headerRow: {
    marginBottom: 12,
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
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  row: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
