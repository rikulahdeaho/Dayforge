import { SymbolView } from '@/components/dayforge/SymbolView';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { getFlowCTA } from '@/components/dayforge/flow';
import { feedbackTap } from '@/components/dayforge/feedback';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import { DayforgePalette, GlowButton, GradientCard, SurfaceCard } from '@/components/dayforge/Primitives';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { Fonts, Type } from '@/constants/Typography';
import { getCurrentMondayBasedDayIndex, getDateKeyForMondayBasedDayIndex, toDateKey } from '@/store/appState.helpers';
import { useAppState } from '@/store/appState';
import { selectCompletedHabitsCount, selectCompletedTasksCount, selectDayClosureStreak, selectIsDayClosed, selectTotalHabitsCount, selectTotalTasksCount, selectWeeklyDayClosures } from '@/store/appState.selectors';

export default function DaySummaryScreen() {
  const router = useRouter();
  const { state } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const flow = getFlowCTA(state);
  const summaryUnlocked = flow.step === 'summary';
  const todayIndex = getCurrentMondayBasedDayIndex();
  const todayDateKey = getDateKeyForMondayBasedDayIndex(todayIndex);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateKey = toDateKey(tomorrow);
  const completedHabits = selectCompletedHabitsCount(state);
  const totalHabits = selectTotalHabitsCount(state);
  const completedTasks = selectCompletedTasksCount(state);
  const totalTasks = selectTotalTasksCount(state);
  const todayFullDate = new Date().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const reflectionDone = state.reflectionHistory.some((entry) => entry.fullDate === todayFullDate);
  const dayClosureStreak = selectDayClosureStreak(state);
  const tomorrowTasks = state.tasks.filter((task) => task.dateKey === tomorrowDateKey).length;
  const streakDays = selectWeeklyDayClosures(state);
  const todayClosed = selectIsDayClosed(state, todayDateKey);
  const dateText = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Day Summary</Text>
          <Pressable onPress={() => router.back()} style={[styles.closeButton, { borderColor: palette.border, backgroundColor: palette.cardStrong }]}>
            <SymbolView name={resolveSymbolName({ ios: 'xmark', android: 'close', web: 'close' })} size={18} tintColor={palette.text} />
          </Pressable>
        </View>
        <Text style={[styles.microLabel, { color: palette.mutedText }]}>{dateText}</Text>

        {!summaryUnlocked ? (
          <SurfaceCard palette={palette} style={styles.lockedCard}>
            <Text style={[styles.lockedTitle, { color: palette.text }]}>Finish the day flow first</Text>
            <Text style={[styles.lockedBody, { color: palette.mutedText }]}>Complete tasks, habits, and reflection to unlock Day Summary.</Text>
            <GlowButton label={flow.label} palette={palette} style={styles.lockedButton} onPress={() => { feedbackTap(); router.push(flow.route as never); }} />
          </SurfaceCard>
        ) : (
          <>
            <GradientCard palette={palette} style={styles.heroCard} colors={[palette.heroPrimaryStart, palette.heroPrimaryMid, palette.heroPrimaryEnd]}>
              <View style={[styles.heroPill, { backgroundColor: palette.overlaySoft }]}>
                <SymbolView name={resolveSymbolName({ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' })} size={12} tintColor={palette.onAccent} />
                <Text style={[styles.heroPillText, { color: palette.onAccent }]}>{dayClosureStreak} day streak</Text>
              </View>
              <Text style={[styles.heroTitle, { color: palette.onAccent }]}>Great job today</Text>
              <Text style={[styles.heroBody, { color: palette.overlayText }]}>You completed your key habits and made progress on your tasks.</Text>
              <View style={[styles.heroStatsRow, { borderTopColor: palette.overlayStrong }]}>
                <View style={styles.heroStat}>
                  <Text style={[styles.heroStatLabel, { color: palette.overlayText }]}>Habits</Text>
                  <Text style={[styles.heroStatValue, { color: palette.onAccent }]}>{completedHabits}/{totalHabits}</Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={[styles.heroStatLabel, { color: palette.overlayText }]}>Tasks</Text>
                  <Text style={[styles.heroStatValue, { color: palette.onAccent }]}>{completedTasks}/{totalTasks}</Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={[styles.heroStatLabel, { color: palette.overlayText }]}>Reflection</Text>
                  <Text style={[styles.heroStatValue, { color: palette.onAccent }]}>{reflectionDone ? 'Done' : 'Pending'}</Text>
                </View>
              </View>
            </GradientCard>

            <SurfaceCard palette={palette} style={styles.streakCard}>
              <View style={styles.streakHeader}>
                <Text style={[styles.streakTitle, { color: palette.text }]}>{dayClosureStreak} day streak</Text>
                <Text style={[styles.streakMeta, { color: palette.mutedText }]}>{todayClosed ? 'Momentum kept' : 'Keep the chain alive'}</Text>
              </View>
              <View style={styles.streakDots}>
                {streakDays.map((day) => (
                  <View key={day.id} style={styles.streakDotCol}>
                    <View style={[styles.streakDot, { backgroundColor: day.closed ? palette.accentStrong : palette.cardStrong, borderColor: day.closed ? palette.accentSoft : palette.border }]} />
                    <Text style={[styles.streakDay, { color: palette.mutedText }]}>{day.label[0]}</Text>
                  </View>
                ))}
              </View>
            </SurfaceCard>

            <SurfaceCard palette={palette} style={styles.tomorrowCard}>
              <Text style={[styles.tomorrowTitle, { color: palette.text }]}>Tomorrow is ready</Text>
              <Text style={[styles.tomorrowLine, { color: palette.text }]}>{tomorrowTasks} tasks planned</Text>
              <Text style={[styles.tomorrowLine, { color: palette.text }]}>{state.goal.target > 0 ? 1 : 0} focus goal set</Text>
              <Text style={[styles.tomorrowLine, { color: palette.text }]}>{state.habits.length} habits ready</Text>
            </SurfaceCard>

            <GlowButton label="Finish day" palette={palette} style={styles.primaryButton} onPress={() => { feedbackTap(); router.replace('/(tabs)' as never); }} />
            <Pressable onPress={() => { feedbackTap(); router.replace('/weekly-plan' as never); }}>
              <Text style={[styles.secondaryLink, { color: palette.accentSoft, paddingTop: 6 }]}>Open weekly plan</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 10, paddingTop: 65, paddingBottom: 128 },
  headerRow: { marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { ...Type.screenTitle },
  closeButton: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  microLabel: { marginBottom: 12, paddingHorizontal: 4, ...Type.dateMeta, letterSpacing: 0.4, textTransform: 'uppercase' },
  lockedCard: { borderRadius: 24 },
  lockedTitle: { ...Type.sectionTitle, marginBottom: 8 },
  lockedBody: { ...Type.bodySmall, marginBottom: 12 },
  lockedButton: { borderRadius: 14 },
  heroCard: { borderRadius: 30, marginBottom: 16 },
  heroPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 14 },
  heroPillText: { ...Type.metaStrong },
  heroTitle: { fontFamily: Fonts.heading, fontSize: 24, lineHeight: 29, fontWeight: '700', marginBottom: 8 },
  heroBody: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  heroStatsRow: { borderTopWidth: 0.75, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatLabel: { ...Type.meta, textTransform: 'uppercase' },
  heroStatValue: { marginTop: 2, ...Type.value },
  streakCard: { borderRadius: 24, marginBottom: 16 },
  streakHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  streakTitle: { ...Type.heroTitle },
  streakMeta: { ...Type.metaStrong },
  streakDots: { flexDirection: 'row', justifyContent: 'space-between' },
  streakDotCol: { alignItems: 'center', gap: 6 },
  streakDot: { width: 12, height: 12, borderRadius: 999, borderWidth: 0.75 },
  streakDay: { ...Type.meta },
  tomorrowCard: { borderRadius: 24, marginBottom: 24 },
  tomorrowTitle: { ...Type.sectionTitle, marginBottom: 8 },
  tomorrowLine: { ...Type.body, marginBottom: 6 },
  primaryButton: { marginBottom: 12 },
  secondaryLink: { textAlign: 'center', ...Type.bodyStrong, opacity: 0.96 },
});
