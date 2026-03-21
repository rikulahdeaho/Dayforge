import { SymbolView } from '@/components/dayforge/SymbolView';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { getFlowCTA } from '@/components/dayforge/flow';
import { feedbackTap } from '@/components/dayforge/feedback';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import { DayforgePalette, GlowButton, GradientCard, SurfaceCard } from '@/components/dayforge/Primitives';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { getCurrentMondayBasedDayIndex, getDateKeyForMondayBasedDayIndex, toDateKey } from '@/store/appState.helpers';
import { useAppState } from '@/store/appState';
import {
  selectCompletedHabitsCount,
  selectCompletedTasksCount,
  selectDayClosureStreak,
  selectIsDayClosed,
  selectTotalHabitsCount,
  selectTotalTasksCount,
  selectWeeklyDayClosures,
} from '@/store/appState.selectors';

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
  const todayFullDate = new Date().toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const reflectionDone = state.reflectionHistory.some((entry) => entry.fullDate === todayFullDate);
  const dayClosureStreak = selectDayClosureStreak(state);
  const latestReflection = state.reflectionHistory[0];
  const highlight = latestReflection?.wentWell?.trim() || latestReflection?.preview || 'You kept momentum with one meaningful win.';
  const tomorrowTasks = state.tasks.filter((task) => task.dateKey === tomorrowDateKey).length;
  const streakDays = selectWeeklyDayClosures(state);
  const todayClosed = selectIsDayClosed(state, todayDateKey);

  const dateText = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}> 
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Day Summary</Text>
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
        <Text style={[styles.microLabel, { color: palette.mutedText }]}>{dateText}</Text>

        {!summaryUnlocked ? (
          <SurfaceCard palette={palette} style={styles.lockedCard}>
            <Text style={[styles.lockedTitle, { color: palette.text }]}>Finish the day flow first</Text>
            <Text style={[styles.lockedBody, { color: palette.mutedText }]}>Complete tasks, habits, and reflection to unlock Day Summary.</Text>
            <GlowButton
              label={flow.label}
              palette={palette}
              style={styles.lockedButton}
              onPress={() => {
                feedbackTap();
                router.push(flow.route as never);
              }}
            />
          </SurfaceCard>
        ) : (
          <>
            <GradientCard palette={palette} style={styles.heroCard} colors={['#1f183f', '#25214a', '#2c2458']}>
              <View style={styles.heroPill}>
                <SymbolView
                  name={resolveSymbolName({ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' })}
                  size={12}
                  tintColor="#fff"
                />
                <Text style={styles.heroPillText}>{dayClosureStreak} day streak</Text>
              </View>
              <Text style={styles.heroTitle}>Great job today</Text>
              <Text style={styles.heroBody}>You completed your key habits and made progress on your tasks.</Text>

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Habits</Text>
                  <Text style={styles.heroStatValue}>{completedHabits}/{totalHabits}</Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Tasks</Text>
                  <Text style={styles.heroStatValue}>{completedTasks}/{totalTasks}</Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Reflection</Text>
                  <Text style={styles.heroStatValue}>{reflectionDone ? 'Done' : 'Pending'}</Text>
                </View>
              </View>
            </GradientCard>

{/*             <View style={styles.metricsRow}>
              <SurfaceCard palette={palette} style={styles.metricCard}>
                <Text style={[styles.metricTitle, { color: palette.mutedText }]}>Habits</Text>
                <Text style={[styles.metricValue, { color: palette.text }]}>{completedHabits}/{totalHabits}</Text>
                <Text style={[styles.metricBody, { color: palette.mutedText }]}>Completed</Text>
              </SurfaceCard>
              <SurfaceCard palette={palette} style={styles.metricCard}>
                <Text style={[styles.metricTitle, { color: palette.mutedText }]}>Tasks</Text>
                <Text style={[styles.metricValue, { color: palette.text }]}>{completedTasks}/{totalTasks}</Text>
                <Text style={[styles.metricBody, { color: palette.mutedText }]}>Done today</Text>
              </SurfaceCard>
              <SurfaceCard palette={palette} style={styles.metricCard}>
                <Text style={[styles.metricTitle, { color: palette.mutedText }]}>Reflection</Text>
                <Text style={[styles.metricValue, { color: palette.text }]}>{reflectionDone ? 'Saved' : 'Pending'}</Text>
                <Text style={[styles.metricBody, { color: palette.mutedText }]}>Day closed</Text>
              </SurfaceCard>
            </View> */}

            <SurfaceCard palette={palette} style={styles.streakCard}>
              <View style={styles.streakHeader}>
                <Text style={[styles.streakTitle, { color: palette.text }]}>{dayClosureStreak} day streak</Text>
                <Text style={[styles.streakMeta, { color: palette.accent }]}>{todayClosed ? 'Momentum kept' : 'Keep the chain alive'}</Text>
              </View>
              <View style={styles.streakDots}>
                {streakDays.map((day) => {
                  const active = day.closed;
                  return (
                    <View key={day.id} style={styles.streakDotCol}>
                      <View
                        style={[
                          styles.streakDot,
                          {
                            backgroundColor: active ? palette.accentStrong : palette.cardStrong,
                            borderColor: active ? palette.accentSoft : palette.border,
                          },
                        ]}
                      />
                      <Text style={[styles.streakDay, { color: palette.mutedText }]}>{day.label[0]}</Text>
                    </View>
                  );
                })}
              </View>
            </SurfaceCard>

            <SurfaceCard palette={palette} style={styles.tomorrowCard}>
              <Text style={[styles.tomorrowTitle, { color: palette.text }]}>Tomorrow is ready</Text>
              <Text style={[styles.tomorrowLine, { color: palette.text }]}>{tomorrowTasks} tasks planned</Text>
              <Text style={[styles.tomorrowLine, { color: palette.text }]}>{state.goal.target > 0 ? 1 : 0} focus goal set</Text>
              <Text style={[styles.tomorrowLine, { color: palette.text }]}>{state.habits.length} habits ready</Text>
            </SurfaceCard>

            <GlowButton
              label="Finish day"
              palette={palette}
              style={styles.primaryButton}
              onPress={() => {
                feedbackTap();
                router.replace('/(tabs)' as never);
              }}
            />

            <Pressable
              onPress={() => {
                feedbackTap();
                router.replace('/weekly-plan' as never);
              }}>
              <Text style={[styles.secondaryLink, { color: palette.accentStrong, paddingTop: 5 }]}>Weekly plan</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingHorizontal: 10,
    paddingTop: 65,
    paddingBottom: 128,
  },
  headerRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
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
  microLabel: {
    marginBottom: 12,
    paddingHorizontal: 4,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  lockedCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  lockedTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  lockedBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  lockedButton: {
    borderRadius: 14,
  },
  heroCard: {
    borderRadius: 30,
    marginBottom: 12,
  },
  heroPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(124,58,237,0.35)',
    marginBottom: 10,
  },
  heroPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 40,
    lineHeight: 42,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  heroStatsRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroStatValue: {
    color: '#fff',
    marginTop: 2,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
  },
  metricBody: {
    marginTop: 3,
    fontSize: 12,
  },
  highlightCard: {
    borderRadius: 24,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  highlightText: {
    fontSize: 20,
    lineHeight: 28,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  streakCard: {
    borderRadius: 24,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  streakTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
  },
  streakMeta: {
    fontSize: 13,
    fontWeight: '700',
  },
  streakDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakDotCol: {
    alignItems: 'center',
    gap: 4,
  },
  streakDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  streakDay: {
    fontSize: 11,
    fontWeight: '600',
  },
  tomorrowCard: {
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  tomorrowTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  tomorrowLine: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 6,
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryLink: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
