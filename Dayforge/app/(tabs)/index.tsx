/**
 * Today Screen - Daily Dashboard & Summary
 *
 * Overview:
 * - Displays a real-time summary of today's progress
 * - Shows habit completion status, task count, and weekly goal progress
 * - Serves as the main entry point to other screens
 *
 * Content:
 * 1. Hero card with streak badge and habit completion count
 * 2. Quick grid showing habits completed, remaining tasks, weekly goal, and reflection reminder
 * 3. Task preview list (first 3 tasks from today's list)
 * 4. Reflection CTA card with button to start journaling
 * 5. Profile icon in header (links to Profile screen)
 *
 * Interactions:
 * - Tap profile icon → navigate to Profile screen
 * - Tap habit card → navigate to Habits screen
 * - Tap task card → navigate to Plan screen
 * - Tap weekly goal card → navigate to Plan screen
 * - Tap reflection CTA → navigate to Reflect screen
 * - All data updates live from in-memory state (no persistence)
 */

import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import { DayforgePalette, GlowButton, GradientCard, ProgressTrack, SectionTitle, SurfaceCard } from '@/components/dayforge/Primitives';
import { useAppState } from '@/store/appState';
import type { Task } from '@/types';

export default function TodayScreen() {
  const router = useRouter();
  const palette = Colors.dark as DayforgePalette;
  const { state, toggleTask } = useAppState();
  const [animatingTaskIds, setAnimatingTaskIds] = useState<Set<string>>(new Set());

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

  const completedHabits = state.habits.filter((habit) => habit.completedToday).length;
  const totalHabits = state.habits.length;
  const habitProgress = totalHabits ? completedHabits / totalHabits : 0;
  const remainingTasks = state.tasks.filter((task) => !task.completed).length;
  const completedTasks = state.tasks.filter((task) => task.completed).length;
  const firstName = state.user.name.split(' ')[0] ?? state.user.name;
  const streakDays = 5;
  const reflectionStreak = Math.min(7, state.reflectionHistory.length + (state.reflectionDraft.mood ? 1 : 0));
  const totalTasks = state.tasks.length;

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

  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const weeklyStats = [
    { id: 'habits', title: 'Habits', value: completedHabits, sub: `${totalHabits} today` },
    { id: 'tasks', title: 'Tasks', value: completedTasks, sub: `${totalTasks} total` },
    { id: 'reflect', title: 'Reflection', value: reflectionStreak, sub: 'streak' },
  ];

  const dailyHabitCounts = weekdayLabels.map((_, dayIndex) =>
    state.habits.reduce((sum, habit) => sum + (habit.weeklyProgress[dayIndex] ? 1 : 0), 0)
  );

  const safeGoalProgress = state.goal.target > 0 ? state.goal.progress / state.goal.target : 0;
  const safeTaskProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const weeklyChart = dailyHabitCounts.map((count, dayIndex) => {
    const habitsScore = (count / Math.max(1, totalHabits)) * 72;
    const supportScore = safeGoalProgress * 18 + safeTaskProgress * 10;
    const value = Math.max(10, Math.min(100, Math.round(habitsScore + supportScore)));

    return {
      id: `weekly-bar-${dayIndex}`,
      label: weekdayLabels[dayIndex],
      value,
    };
  });

  const earlyWeekAverage = (weeklyChart[0].value + weeklyChart[1].value + weeklyChart[2].value) / 3;
  const lateWeekAverage = (weeklyChart[4].value + weeklyChart[5].value + weeklyChart[6].value) / 3;
  const trendDelta = Math.round(lateWeekAverage - earlyWeekAverage);
  const trendUp = trendDelta >= 0;

  const mostProductiveDay = weeklyChart.reduce((best, day) => (day.value > best.value ? day : best), weeklyChart[0]);
  const todayDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const motivationalCopy =
    remainingTasks === 0
      ? 'You completed everything today. Keep this momentum going.'
      : `Almost there! ${Math.max(0, totalHabits - completedHabits)} more habits to hit your goal.`;

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DateHeader palette={palette} dateText={todayDate} title="Today" subtitle={`Welcome back, ${firstName}`} />

        <GradientCard palette={palette} style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.streakPill}>
              <Animated.View style={firePulseStyle}>
                <SymbolView
                  name={resolveSymbolName({ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' })}
                  size={14}
                  tintColor="#ffffff"
                />
              </Animated.View>
              <Text style={styles.streakText}>{streakDays} DAY STREAK</Text>
            </View>
            <Text style={styles.heroSubtle}>Session Progress</Text>
          </View>
          <Text style={styles.heroTitle}>
            {completedHabits}/{totalHabits} habits done
          </Text>
          <Text style={styles.heroBody}>{motivationalCopy}</Text>
          <ProgressTrack value={habitProgress} palette={palette} style={styles.heroProgress} />
        </GradientCard>

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Task Preview</Text>
          <Pressable onPress={() => router.push('/(tabs)/task')}>
            <Text style={[styles.sectionAction, { color: palette.accent }]}>OPEN</Text>
          </Pressable>
        </View>
        <SurfaceCard palette={palette} style={styles.previewCard}>
          {state.tasks
            .filter((task) => !task.completed || animatingTaskIds.has(task.id))
            .slice(0, 3)
            .map((task) => (
              <TaskPreviewItem
                key={task.id}
                task={task}
                palette={palette}
                onToggle={() => handleTaskToggle(task.id)}
              />
            ))}
        </SurfaceCard>

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
              <Text style={[styles.trendText, { color: trendUp ? palette.accentSoft : palette.mutedText }]}>
                {trendUp ? '↗' : '↘'} {trendUp ? '+' : ''}
                {trendDelta} vs early week
              </Text>
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

          <View style={styles.weeklyChartWrap}>
            {weeklyChart.map((bar) => (
              <View key={bar.id} style={styles.weeklyChartColumn}>
                <View style={[styles.weeklyChartTrack, { backgroundColor: 'rgba(255,255,255,0.07)' }]}>
                  <View
                    style={[
                      styles.weeklyChartFill,
                      {
                        backgroundColor: palette.accent,
                        height: `${bar.value}%`,
                        opacity: 0.84,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.weekdayLabel, { color: palette.mutedText }]}>{bar.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.insightRow, { borderColor: palette.border, backgroundColor: 'rgba(255,255,255,0.035)' }]}>
            <SymbolView
              name={resolveSymbolName({ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' })}
              size={14}
              tintColor={palette.accentSoft}
            />
            <Text style={[styles.insightText, { color: palette.text }]}>Most productive day: {mostProductiveDay.label}</Text>
          </View>
        </SurfaceCard>

        <Pressable onPress={() => router.push('/(tabs)/reflect')}>
          <SurfaceCard palette={palette} style={styles.reflectionCtaCard}>
            <View style={[styles.reflectionBadge, { backgroundColor: palette.accentStrong }]}> 
              <SymbolView
                name={resolveSymbolName({ ios: 'book.pages.fill', android: 'menu_book', web: 'menu_book' })}
                size={20}
                tintColor="#fff"
              />
            </View>
            <Text style={[styles.reflectionTitle, { color: palette.text }]}>Daily Reflection</Text>
            <Text style={[styles.reflectionBody, { color: palette.mutedText }]}>Take two minutes to capture what went well today.</Text>
          </SurfaceCard>
        </Pressable>

      </ScrollView>
    </View>
  );
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
  onToggle,
}: {
  task: Task;
  palette: DayforgePalette;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.previewRow,
        pressed && styles.previewRowPressed,
      ]}>
      <View
        style={[
          styles.previewDot,
          {
            borderColor: task.completed ? palette.success : palette.border,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}>
        <AnimatedCompleteCheck completed={task.completed} tintColor={palette.success} />
      </View>
      <Text
        style={[
          styles.previewText,
          {
            color: task.completed ? palette.mutedText : palette.text,
            textDecorationLine: task.completed ? 'line-through' : 'none',
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
  bottomGlow: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: 120,
    height: 240,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 65,
    paddingBottom: 128,
  },
  heroCard: {
    borderRadius: 30,
    paddingVertical: 20,
    marginBottom: 24,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  streakPill: {
    height: 42,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakText: {
    color: '#ffffff',
    fontSize: 12,
    letterSpacing: 0.6,
    fontWeight: '700',
  },
  heroSubtle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 13,
    fontWeight: '500',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
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
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  quickGrid: {
    marginBottom: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCell: {
    width: '48.4%',
  },
  quickCard: {
    minHeight: 104,
  },
  quickLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  quickValue: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    lineHeight: 24,
  },
  previewCard: {
    marginBottom: 22,
    borderRadius: 26,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.035)',
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
  reflectionCtaCard: {
    alignItems: 'center',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.035)',
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
  weeklyStatLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  weeklyStatValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  weeklyChartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 10,
  },
  weeklyChartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  weeklyChartTrack: {
    width: '100%',
    height: 66,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weeklyChartFill: {
    width: '100%',
    borderRadius: 10,
    minHeight: 8,
  },
  weekdayLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600',
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
    fontSize: 12,
    fontWeight: '600',
  },
  reflectionBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  reflectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  reflectionBody: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 0,
  },
  reflectButton: {
    width: '100%',
    minHeight: 54,
  },
  reflectButtonText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
});

