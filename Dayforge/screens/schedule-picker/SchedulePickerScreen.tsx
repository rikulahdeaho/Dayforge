import { SymbolView } from '@/components/dayforge/SymbolView';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import Colors from '@/constants/Colors';
import { Type } from '@/constants/Typography';
import { useAppState } from '@/store/appState';
import { formatFullDateLabel, toDateKey } from '@/store/appState.helpers';

function startOfWeek(date: Date) {
  const next = new Date(date);
  const mondayIndex = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - mondayIndex);
  next.setHours(0, 0, 0, 0);
  return next;
}

export default function SchedulePickerScreen() {
  const router = useRouter();
  const { state } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDateKey = toDateKey(today);

  const thisWeekStart = startOfWeek(today);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setDate(thisWeekStart.getDate() + 7);
  const rangeStart = new Date(lastWeekStart);
  const rangeEnd = new Date(nextWeekStart);
  rangeEnd.setDate(nextWeekStart.getDate() + 6);

  const rangeLabel = `${rangeStart.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} - ${rangeEnd.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })}`;

  const weekSections = [
    { id: 'last-week', title: 'Last week', start: lastWeekStart },
    { id: 'this-week', title: 'This week', start: thisWeekStart },
    { id: 'next-week', title: 'Next week', start: nextWeekStart },
  ].map((section) => ({
    ...section,
    items: Array.from({ length: 7 }, (_, index) => {
      const date = new Date(section.start);
      date.setDate(section.start.getDate() + index);
      const dateKey = toDateKey(date);
      const fullDate = formatFullDateLabel(date);
      const tasksForDate = state.tasks.filter((task) => task.dateKey === dateKey);
      const tasksDone = tasksForDate.filter((task) => Boolean(task.completionByDate[dateKey])).length;
      const habitsDone = state.habits.filter((habit) => Boolean(habit.completionByDate[dateKey])).length;
      const reflectionDone = state.reflectionHistory.some((entry) => entry.fullDate === fullDate);

      return {
        id: `${section.id}-${dateKey}`,
        dateKey,
        isToday: dateKey === todayDateKey,
        label: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
        tasksDone,
        tasksTotal: tasksForDate.length,
        habitsDone,
        reflectionDone,
      };
    }),
  }));

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: palette.text }]}>Schedule</Text>
          <Pressable onPress={() => router.back()} style={[styles.closeButton, { borderColor: palette.border, backgroundColor: palette.cardStrong }]}>
            <SymbolView name={resolveSymbolName({ ios: 'xmark', android: 'close', web: 'close' })} size={18} tintColor={palette.text} />
          </Pressable>
        </View>
        <Text style={[styles.microLabel, { color: palette.mutedText }]}>{rangeLabel}</Text>

        {weekSections.map((section) => (
          <SurfaceCard key={section.id} palette={palette} style={styles.card}>
            <Text style={[styles.sectionTitle, { color: palette.mutedText }]}>{section.title}</Text>
            {section.items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push({ pathname: '/schedule-day', params: { dateKey: item.dateKey } } as never)}
                style={[
                  styles.row,
                  {
                    borderColor: item.isToday ? palette.accentSoft : palette.border,
                    backgroundColor: item.isToday ? palette.surfaceMuted : palette.card,
                  },
                ]}>
                <View style={styles.dateRow}>
                  <Text style={[styles.dateText, { color: palette.text }]}>{item.label}</Text>
                  {item.isToday ? (
                    <View style={[styles.todayBadge, { backgroundColor: `${palette.accent}20`, borderColor: `${palette.accent}34` }]}>
                      <Text style={[styles.todayBadgeText, { color: palette.accent }]}>Today</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.metaText, { color: palette.mutedText }]}>
                  {item.tasksDone}/{item.tasksTotal} tasks | {item.habitsDone} habits | {item.reflectionDone ? 'reflection saved' : 'no reflection'}
                </Text>
              </Pressable>
            ))}
          </SurfaceCard>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 12, paddingTop: 68, paddingBottom: 40 },
  headerRow: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...Type.screenTitle },
  closeButton: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  microLabel: { marginBottom: 16, paddingHorizontal: 4, ...Type.meta, letterSpacing: 0.8, textTransform: 'uppercase' },
  card: { borderRadius: 20, marginBottom: 12 },
  sectionTitle: { ...Type.metaStrong, marginBottom: 12, paddingHorizontal: 2, textTransform: 'uppercase' },
  row: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 10, marginBottom: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  dateText: { ...Type.cardTitle, marginBottom: 2 },
  metaText: { ...Type.meta },
  todayBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  todayBadgeText: {
    ...Type.metaStrong,
  },
});
