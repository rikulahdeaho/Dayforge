import { SymbolView } from 'expo-symbols';
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
import { DateHeader } from '@/components/dayforge/DateHeader';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { WeeklyProgressChart } from '@/components/dayforge/WeeklyProgressChart';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import { DayforgePalette, GlowButton, GradientCard, ProgressTrack, SurfaceCard } from '@/components/dayforge/Primitives';
import { formatFullDateLabel, getCurrentMondayBasedDayIndex, getDateKeyForMondayBasedDayIndex } from '@/store/appState.helpers';
import { useAppState } from '@/store/appState';
import {
  selectCompletedHabitsCount,
  selectCompletedTasksCount,
  selectFirstName,
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

type NextActionKind = 'tasks' | 'habits' | 'reflect' | 'summary';

export default function TodayScreen() {
  const router = useRouter();
  const { state, toggleTask } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const [animatingTaskIds, setAnimatingTaskIds] = useState<Set<string>>(new Set());
  const [focusedSection, setFocusedSection] = useState<NextActionKind | null>(null);
  const [now, setNow] = useState(new Date());

  const todayIndex = getCurrentMondayBasedDayIndex();
  const todayDateKey = getDateKeyForMondayBasedDayIndex(todayIndex);
  const todayFullDate = formatFullDateLabel(new Date());

  const completedHabits = selectCompletedHabitsCount(state);
  const totalHabits = selectTotalHabitsCount(state);
  const habitsLeft = Math.max(0, totalHabits - completedHabits);
  const habitProgress = selectHabitProgress(state);
  const habitsDone = totalHabits === 0 || habitsLeft === 0;

  const totalTasks = selectTotalTasksCount(state);
  const remainingTasks = selectRemainingTasksCount(state);
  const completedTasks = selectCompletedTasksCount(state);
  const tasksDone = remainingTasks === 0;

  const reflectionStreak = selectReflectionStreak(state);
  const reflectionDoneToday = state.reflectionHistory.some((entry) => entry.fullDate === todayFullDate);
  const firstName = selectFirstName(state).trim();

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

  const nextAction = useMemo(() => {
    if (!tasksDone) {
      return {
        kind: 'tasks' as NextActionKind,
        label: 'Continue tasks',
        route: '/(tabs)/task',
      };
    }

    if (!habitsDone) {
      return {
        kind: 'habits' as NextActionKind,
        label: 'Continue habits',
        route: '/(tabs)/habits',
      };
    }

    if (!reflectionDoneToday) {
      return {
        kind: 'reflect' as NextActionKind,
        label: 'Finish your day',
        route: '/(tabs)/reflect',
      };
    }

    return {
      kind: 'summary' as NextActionKind,
      label: 'View summary',
      route: '/reflections',
    };
  }, [habitsDone, reflectionDoneToday, tasksDone]);

  useEffect(() => {
    setFocusedSection(nextAction.kind);
    const fadeTimer = setTimeout(() => setFocusedSection(null), 1800);

    return () => clearTimeout(fadeTimer);
  }, [nextAction.kind]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const handleTaskToggle = (taskId: string) => {
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

  const heroKickoffText = resolveHeroKickoffText(habitProgress, totalHabits);
  const heroSupportText = resolveHeroSupportText(habitsLeft, totalHabits);
  const greeting = firstName ? `Welcome back, ${firstName}` : 'Welcome back';

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

  const taskActionLabel =
    totalTasks === 0 ? 'OPEN TASKS' : remainingTasks > 0 ? `${remainingTasks} REMAINING` : 'VIEW ALL';

  const reflectionStatus = reflectionDoneToday ? 'Done today' : reflectionStreak > 0 ? 'Streak at risk' : 'Not done yet';
  const reflectionMotivation = reflectionDoneToday
    ? 'Nice close-out. You can update it in Reflect.'
    : 'Capture today before it slips away.';
  const reflectionTimeMeta = reflectionDoneToday ? 'Saved' : getTimeUntilDayEndsLabel(now);

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DateHeader palette={palette} dateText={todayDate} title="Today" subtitle={greeting} />

        <View style={styles.ctaWrap}>
          <GlowButton label={nextAction.label} palette={palette} onPress={() => router.push(nextAction.route as never)} />
        </View>

        <Pressable onPress={() => router.push('/(tabs)/habits')} style={styles.heroPressable}>
          <GradientCard
            palette={palette}
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
            <Pressable onPress={() => router.push('/(tabs)/task')}>
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
                borderWidth: 1,
              },
            ]}>
            {totalTasks === 0 ? (
              <Text style={[styles.emptyTaskText, { color: palette.mutedText }]}>No tasks for today yet.</Text>
            ) : remainingTasks === 0 ? (
              <Text style={[styles.emptyTaskText, { color: palette.success }]}>All tasks done for today.</Text>
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
              <Text style={[styles.emptyTaskText, { color: palette.mutedText }]}>No tasks for today yet.</Text>
            )}

            {totalTasks === 1 ? (
              <Text style={[styles.singleTaskHint, { color: palette.mutedText }]}>
                {remainingTasks === 0 ? 'All set. Tap to open tasks.' : '1 remaining. Tap to open tasks.'}
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

        <View>
          <Pressable onPress={() => router.push('/(tabs)/reflect')}>
            <SurfaceCard
              palette={palette}
              style={[
                styles.reflectionCtaCard,
                focusedSection === 'reflect' && {
                  borderColor: `${palette.accentSoft}CC`,
                  borderWidth: 1,
                },
              ]}>
              <View style={styles.reflectionTopRow}>
                <View style={[styles.reflectionBadge, { backgroundColor: palette.accentStrong }]}>
                  <SymbolView
                    name={resolveSymbolName({ ios: 'book.pages.fill', android: 'menu_book', web: 'menu_book' })}
                    size={18}
                    tintColor="#fff"
                  />
                </View>
                <View style={styles.reflectionCopy}>
                  <Text style={[styles.reflectionTitle, { color: palette.text }]}>Daily Reflection</Text>
                  <Text style={[styles.reflectionBody, { color: palette.mutedText }]}>{reflectionMotivation}</Text>
                </View>
              </View>

              <View style={[styles.reflectionStatusRow, { borderColor: palette.border }]}>
                <Text style={[styles.reflectionStatusText, { color: palette.text }]}>{reflectionStatus}</Text>
                <Text style={[styles.reflectionStatusMeta, { color: palette.accent }]}>
                  {reflectionTimeMeta}
                </Text>
              </View>
            </SurfaceCard>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function resolveHeroKickoffText(progress: number, totalHabits: number) {
  if (totalHabits === 0 || progress <= 0) {
    return "Let's get started";
  }
  if (progress >= 1) {
    return 'Great job today';
  }
  if (progress >= 0.5) {
    return 'Halfway there';
  }
  return 'Keep the momentum going';
}

function resolveHeroSupportText(habitsLeft: number, totalHabits: number) {
  if (totalHabits === 0) {
    return 'Add your first habit to start your streak.';
  }
  if (habitsLeft === 0) {
    return 'You completed all habits for today.';
  }
  return `${habitsLeft} left to keep your streak going.`;
}

function resolveTrendCopy(trendDelta: number) {
  if (trendDelta > 0) {
    return `+${trendDelta} vs earlier this week`;
  }
  if (trendDelta < 0) {
    return `${Math.abs(trendDelta)} below early-week average`;
  }
  return 'On early-week average';
}

function getTimeUntilDayEndsLabel(now: Date) {
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const diffMs = Math.max(0, endOfDay.getTime() - now.getTime());
  const totalMinutes = Math.ceil(diffMs / 60_000);

  if (totalMinutes <= 1) {
    return '<1m left';
  }

  if (totalMinutes < 60) {
    return `${totalMinutes}m left`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h left`;
  }

  return `${hours}h ${minutes}m left`;
}

function AnimatedCompleteCheck({ completed, tintColor }: { completed: boolean; tintColor: string }) {
  const scale = useSharedValue(completed ? 1 : 0.8);

  useEffect(() => {
    if (completed) {
      scale.value = withSequence(
        withTiming(0.8, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(1.2, { duration: 140, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 120, easing: Easing.inOut(Easing.quad) })
      );
      return;
    }

    scale.value = withTiming(0.8, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [completed, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!completed) {
    return null;
  }

  return (
    <Animated.View style={animatedStyle}>
      <SymbolView
        name={resolveSymbolName({ ios: 'checkmark', android: 'done', web: 'done' })}
        size={15}
        tintColor={tintColor}
      />
    </Animated.View>
  );
}

function TaskPreviewItem({
  task,
  palette,
  dayIndex,
  onToggle,
  highlight,
}: {
  task: Task;
  palette: DayforgePalette;
  dayIndex: number;
  onToggle: () => void;
  highlight?: boolean;
}) {
  const completedForDay = Boolean(task.completionByDate[getDateKeyForMondayBasedDayIndex(dayIndex)]);

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [styles.previewRow, pressed && styles.previewRowPressed, highlight && styles.previewRowFocus]}>
      <View
        style={[
          styles.previewDot,
          {
            borderColor: completedForDay ? palette.success : palette.border,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}>
        <AnimatedCompleteCheck completed={completedForDay} tintColor={palette.success} />
      </View>
      <Text
        style={[
          styles.previewText,
          {
            color: completedForDay ? palette.mutedText : palette.text,
            textDecorationLine: completedForDay ? 'line-through' : 'none',
          },
        ]}>
        {task.title}
      </Text>
    </Pressable>
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
  ctaWrap: {
    marginBottom: 12,
  },
  heroPressable: {
    marginBottom: 22,
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
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroKickoff: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 16,
    fontWeight: '700',
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.45,
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
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    minHeight: 42,
  },
  previewRowPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(127,34,255,0.1)',
    transform: [{ scale: 0.97 }],
  },
  previewRowFocus: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(127,34,255,0.14)',
  },
  previewDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 14,
  },
  previewText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  emptyTaskText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 6,
  },
  singleTaskHint: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  weeklyStatsCard: {
    borderRadius: 30,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  weeklyHeaderRow: {
    paddingHorizontal: 6,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
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
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
  },
  weeklyStatSub: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  weeklyStatValue: {
    fontSize: 18,
    fontWeight: '700',
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
    fontSize: 12,
    fontWeight: '600',
  },
  reflectionCtaCard: {
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  reflectionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reflectionBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reflectionCopy: {
    flex: 1,
  },
  reflectionTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  reflectionBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  reflectionStatusRow: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reflectionStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reflectionStatusMeta: {
    fontSize: 12,
    fontWeight: '700',
  },
});
