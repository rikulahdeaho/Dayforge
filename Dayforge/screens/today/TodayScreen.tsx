import { SymbolView } from '@/components/dayforge/SymbolView';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import Colors from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
import { DateHeader } from '@/components/dayforge/DateHeader';
import { FlowCTA, FlowStatusRow } from '@/components/dayforge/FlowCTA';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { WeeklyProgressChart } from '@/components/dayforge/WeeklyProgressChart';
import { getFlowCTA, type FlowStep } from '@/components/dayforge/flow';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import { DayforgePalette, GradientCard, ProgressTrack, SurfaceCard } from '@/components/dayforge/Primitives';
import { feedbackComplete, feedbackTap } from '@/components/dayforge/feedback';
import { formatFullDateLabel, getCurrentMondayBasedDayIndex, getDateKeyForMondayBasedDayIndex } from '@/store/appState.helpers';
import { useAppState } from '@/store/appState';
import {
  selectCompletedHabitsCount,
  selectCompletedTasksCount,
  selectHabitProgress,
  selectMostProductiveDay,
  selectReflectionStreak,
  selectRemainingTasksCount,
  selectTotalHabitsCount,
  selectTotalTasksCount,
  selectWeeklyChart,
  selectWeeklyCompletions,
  selectWeeklyTrendDelta,
} from '@/store/appState.selectors';
import type { Task } from '@/types';

import { ReflectionCtaCard } from './components/ReflectionCtaCard';
import { TaskPreviewItem } from './components/TaskPreviewItem';
import { WeeklyPlanPromptCard } from './components/WeeklyPlanPromptCard';
import { getTimeUntilDayEndsLabel, resolveHeroKickoffText, resolveHeroSupportText, resolveTrendCopy } from './utils';

export default function TodayScreen() {
  const router = useRouter();
  const { state, toggleTask } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const [animatingTaskIds, setAnimatingTaskIds] = useState<Set<string>>(new Set());
  const [focusedSection, setFocusedSection] = useState<FlowStep | null>(null);
  const [now, setNow] = useState(new Date());

  const todayIndex = getCurrentMondayBasedDayIndex();
  const todayDateKey = getDateKeyForMondayBasedDayIndex(todayIndex);
  const todayFullDate = formatFullDateLabel(new Date());

  const completedHabits = selectCompletedHabitsCount(state);
  const totalHabits = selectTotalHabitsCount(state);
  const habitsLeft = Math.max(0, totalHabits - completedHabits);
  const habitProgress = selectHabitProgress(state);

  const totalTasks = selectTotalTasksCount(state);
  const remainingTasks = selectRemainingTasksCount(state);
  const completedTasks = selectCompletedTasksCount(state);

  const reflectionStreak = selectReflectionStreak(state);
  const reflectionDoneToday = state.reflectionHistory.some((entry) => entry.fullDate === todayFullDate);
  const todayTasks = useMemo(
    () => state.tasks.filter((task) => task.dateKey === todayDateKey),
    [state.tasks, todayDateKey]
  );

  const incompleteTodayTasks = useMemo(
    () => todayTasks.filter((task) => !task.completionByDate[todayDateKey]),
    [todayDateKey, todayTasks]
  );

  const previewTasks = useMemo(() => {
    const pending = todayTasks.filter(
      (task) => !task.completionByDate[todayDateKey] || animatingTaskIds.has(task.id)
    );
    if (pending.length) {
      return pending.slice(0, 3);
    }
    return todayTasks.slice(0, 3);
  }, [animatingTaskIds, todayDateKey, todayTasks]);

  const firstIncompleteTaskId = incompleteTodayTasks[0]?.id;

  const flow = getFlowCTA(state);

  useEffect(() => {
    setFocusedSection(flow.step);
    const fadeTimer = setTimeout(() => setFocusedSection(null), 1800);

    return () => clearTimeout(fadeTimer);
  }, [flow.step]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const handleTaskToggle = (taskId: string) => {
    feedbackComplete();
    setAnimatingTaskIds((prev) => new Set(prev).add(taskId));
    toggleTask(taskId);
    setTimeout(() => {
      setAnimatingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }, 600);
  };

  const firePulse = useSharedValue(1);

  useEffect(() => {
    firePulse.value = withRepeat(
      withSequence(
        withTiming(1.16, { duration: 520, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 520, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [firePulse]);

  const firePulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: firePulse.value }],
    opacity: 0.88 + (firePulse.value - 1) * 0.5,
  }));

  const heroKickoffText = resolveHeroKickoffText(habitProgress, totalHabits, flow.step);
  const heroSupportText = resolveHeroSupportText(habitsLeft, totalHabits, flow.step);

  const weeklyStats = [
    { id: 'habits', title: 'Habits', value: `${completedHabits}/${totalHabits}`, sub: 'done today' },
    { id: 'tasks', title: 'Tasks', value: `${completedTasks}/${totalTasks}`, sub: 'completed today' },
    { id: 'reflect', title: 'Reflection', value: `${reflectionStreak}`, sub: 'day streak' },
  ];

  const weeklyChart = selectWeeklyChart(state);
  const weeklyCompletions = selectWeeklyCompletions(state);
  const trendDelta = selectWeeklyTrendDelta(state);
  const trendCopy = resolveTrendCopy(trendDelta);
  const trendUp = trendDelta >= 0;
  const mostProductiveDay = selectMostProductiveDay(state);
  const strongestDays = weeklyCompletions
    .slice()
    .sort((a, b) => b.totalCompleted - a.totalCompleted)
    .slice(0, 2)
    .map((day) => day.label)
    .join('-');
  const insightCopy =
    trendDelta < 0
      ? `Drop shows after midweek. Your strongest days are ${strongestDays}.`
      : `Most productive day is ${mostProductiveDay.label}. Midweek pace looks stable.`;

  const todayDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const isSunday = new Date().getDay() === 0;

  const taskActionLabel =
    totalTasks === 0 ? 'Open tasks' : remainingTasks > 0 ? `${remainingTasks} left` : 'View all';

  const reflectionStatus = reflectionDoneToday ? 'Saved today' : reflectionStreak > 0 ? 'Do it today' : 'Not started';
  const reflectionMotivation = reflectionDoneToday
    ? 'Nice close-out. Update it anytime.'
    : 'Capture today before it slips away.';
  const reflectionTimeMeta = reflectionDoneToday ? 'Saved' : getTimeUntilDayEndsLabel(now);
  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DateHeader palette={palette} dateText={todayDate} title="Today" />
        <FlowStatusRow palette={palette} />
        <FlowCTA palette={palette} />
        {isSunday ? (
          <WeeklyPlanPromptCard
            palette={palette}
            onOpen={() => {
              feedbackTap();
              router.push('/weekly-plan' as never);
            }}
          />
        ) : null}

        <Pressable
          onPress={() => {
            feedbackTap();
            router.push('/(tabs)/habits');
          }}
          style={({ pressed }) => [styles.heroPressable, pressed && styles.scaleDown]}>
          <GradientCard
            palette={palette}
            colors={['#191523', '#231c31', '#2c243b']}
            style={[
              styles.heroCard,
              focusedSection === 'habits' && {
                borderColor: `${palette.accentSoft}CC`,
                borderWidth: 1,
              },
            ]}>
            <View style={styles.heroTop}>
              <View style={[styles.streakPill, { transform: [{ scale: 0.94 }] }]}>
                <Animated.View style={firePulseStyle}>
                  <SymbolView
                    name={resolveSymbolName({
                      ios: 'flame.fill',
                      android: 'local_fire_department',
                      web: 'local_fire_department',
                    })}
                    size={13}
                    tintColor="#ffffff"
                  />
                </Animated.View>
                <Text style={styles.streakText}>{Math.max(1, reflectionStreak)} DAY STREAK</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              {completedHabits}/{totalHabits} habits done
            </Text>
            <Text style={styles.heroKickoff}>{heroKickoffText}</Text>
            <Text style={styles.heroBody}>{heroSupportText}</Text>
            <ProgressTrack value={habitProgress} palette={palette} style={styles.heroProgress} />
          </GradientCard>
        </Pressable>

        <View>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Task Preview</Text>
            <Pressable
              onPress={() => {
                feedbackTap();
                router.push('/(tabs)/task');
              }}>
              <Text style={[styles.sectionAction, { color: palette.accent }]}>{taskActionLabel}</Text>
            </Pressable>
          </View>

          <SurfaceCard
            palette={palette}
            style={[
              styles.previewCard,
              totalTasks <= 1 && styles.previewCardCompact,
              focusedSection === 'tasks' && {
                borderColor: `${palette.accentSoft}CC`,
                borderWidth: 0.5,
              },
            ]}>
            {totalTasks === 0 ? (
              <Text style={[styles.emptyTaskText, { color: palette.mutedText }]}>No tasks yet.</Text>
            ) : remainingTasks === 0 ? (
              <Text style={[styles.emptyTaskText, { color: palette.success }]}>All tasks are done.</Text>
            ) : previewTasks.length ? (
              previewTasks.map((task) => (
                <TaskPreviewItem
                  key={task.id}
                  task={task}
                  palette={palette}
                  dayIndex={todayIndex}
                  onToggle={() => handleTaskToggle(task.id)}
                  highlight={focusedSection === 'tasks' && task.id === firstIncompleteTaskId}
                />
              ))
            ) : (
              <Text style={[styles.emptyTaskText, { color: palette.mutedText }]}>No tasks yet.</Text>
            )}

            {totalTasks === 1 ? (
              <Text style={[styles.singleTaskHint, { color: palette.mutedText }]}>
                {remainingTasks === 0 ? 'All set. Open tasks anytime.' : '1 left. Open tasks.'}
              </Text>
            ) : null}
          </SurfaceCard>
        </View>

        <SurfaceCard palette={palette} style={styles.weeklyStatsCard}>
          <View style={styles.weeklyHeaderRow}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Weekly Progress</Text>
            <View
              style={[
                styles.trendPill,
                {
                  borderColor: trendUp ? palette.accent : palette.border,
                  backgroundColor: trendUp ? 'rgba(127,34,255,0.2)' : 'rgba(255,255,255,0.05)',
                },
              ]}>
              <Text style={[styles.trendText, { color: trendUp ? palette.accentSoft : palette.mutedText }]}>{trendCopy}</Text>
            </View>
          </View>

          <View style={styles.weeklyStatGrid}>
            {weeklyStats.map((stat) => (
              <View
                key={stat.id}
                style={[
                  styles.weeklyStatCard,
                  {
                    borderColor: palette.border,
                    backgroundColor: 'rgba(255,255,255,0.045)',
                  },
                ]}>
                <Text style={[styles.weeklyStatTitle, { color: palette.mutedText }]}>{stat.title}</Text>
                <Text style={[styles.weeklyStatValue, { color: palette.text }]}>{stat.value}</Text>
                <Text style={[styles.weeklyStatSub, { color: palette.accent }]}>{stat.sub}</Text>
              </View>
            ))}
          </View>

          <WeeklyProgressChart bars={weeklyChart} palette={palette} todayIndex={todayIndex} />

          <View style={[styles.insightRow, { borderColor: palette.border, backgroundColor: 'rgba(255,255,255,0.035)' }]}>
            <SymbolView
              name={resolveSymbolName({ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' })}
              size={14}
              tintColor={palette.accentSoft}
            />
            <Text style={[styles.insightText, { color: palette.text }]}>{insightCopy}</Text>
          </View>
        </SurfaceCard>

        <ReflectionCtaCard
          palette={palette}
          motivation={reflectionMotivation}
          status={reflectionStatus}
          meta={reflectionTimeMeta}
          highlight={focusedSection === 'reflect'}
          onOpen={() => {
            feedbackTap();
            router.push('/(tabs)/reflect');
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 65,
    paddingBottom: 128,
  },
  heroPressable: {
    marginBottom: 22,
  },
  scaleDown: {
    transform: [{ scale: 0.985 }],
  },
  heroCard: {
    borderRadius: 30,
    paddingVertical: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakPill: {
    height: 36,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  streakText: {
    color: '#ffffff',
    fontSize: 11,
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#ffffff',
    ...Type.heroTitle,
    marginBottom: 4,
  },
  heroKickoff: {
    color: '#ffffff',
    ...Type.bodyStrong,
    marginBottom: 4,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.78)',
    ...Type.bodySmall,
    marginBottom: 14,
  },
  heroProgress: {
    height: 12,
  },
  sectionRow: {
    paddingHorizontal: 6,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...Type.sectionTitle,
  },
  sectionAction: {
    ...Type.metaStrong,
  },
  previewCard: {
    marginBottom: 22,
    borderRadius: 26,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  previewCardCompact: {
    paddingVertical: 10,
  },
  emptyTaskText: {
    textAlign: 'center',
    ...Type.bodySmall,
    paddingVertical: 6,
  },
  singleTaskHint: {
    marginTop: 2,
    textAlign: 'center',
    ...Type.meta,
  },
  weeklyStatsCard: {
    borderRadius: 30,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  weeklyHeaderRow: {
    paddingHorizontal: 6,
    marginBottom: 12,
    gap: 10,
  },
  trendPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  trendText: {
    ...Type.metaStrong,
  },
  weeklyStatGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  weeklyStatCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  weeklyStatTitle: {
    ...Type.metaStrong,
    marginBottom: 3,
  },
  weeklyStatSub: {
    marginTop: 2,
    ...Type.meta,
  },
  weeklyStatValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Fonts.heading,
  },
  insightRow: {
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  insightText: {
    flex: 1,
    ...Type.metaStrong,
  },
});
