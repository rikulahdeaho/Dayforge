/**
 * Plan Screen - Weekly Planning & Daily Tasks
 *
 * Overview:
 * - Manages weekly goals and daily task execution
 * - Allows users to track progress toward weekly objectives
 * - Provides a visual schedule and task list for today
 *
 * Content:
 * 1. Header with week title (Week 9) and date range (Feb 26 - Mar 3)
 * 2. Goals progress summary card showing completed vs total goals
 * 3. Weekly focus card with current objective, progress bar, and "Update progress" button
 * 4. Horizontal schedule row with 7 day chips (tap to select day)
 * 5. Today's tasks list with checkboxes (toggle to mark complete/incomplete)
 * 6. "Add task" dashed button to create new dummy task
 * 7. Reflection CTA card at bottom
 *
 * Interactions:
 * - Tap day chip in schedule → select that day (visual feedback only)
 * - Tap task checkbox → toggle task complete status
 * - Tap "Add task" → append new dummy task to list ("New task")
 * - Tap "Update progress" → increment weekly goal progress (caps at target)
 * - Tap "Start Journaling" CTA → navigate to Reflect screen
 * - Session-only state: resets on app reload
 */
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { DEMO_SCHEDULE } from '@/data/mockData';

import { DateHeader } from '@/components/dayforge/DateHeader';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import {
  DashedAction,
  DayforgePalette,
  GlowButton,
  GradientCard,
  ProgressTrack,
  SectionTitle,
  SurfaceCard,
} from '@/components/dayforge/Primitives';
import { WeekdayPicker } from '@/components/dayforge/WeekdayPicker';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';

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

export default function TaskScreen() {
  const router = useRouter();
  const palette = Colors.dark as DayforgePalette;
  const { state, addTask, decrementGoalProgress, incrementGoalProgress, selectScheduleDay, toggleTask } = useAppState();

  const goalProgress = state.goal.target > 0 ? state.goal.progress / state.goal.target : 0;
  const completedTasks = state.tasks.filter((task) => task.completed).length;
  const remainingTasks = state.tasks.length - completedTasks;
  const isGoalComplete = state.goal.progress >= state.goal.target;
  const successColor = palette.success;

  const headerDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DateHeader palette={palette} dateText={headerDate} title="Today's Tasks" />

        <GradientCard palette={palette} style={styles.focusCard}>
          <View style={styles.focusTop}>
            <View style={styles.objectiveTag}>
              <Text style={styles.objectiveTagText}>{state.goal.label}</Text>
            </View>
          </View>
          <Text style={styles.focusGoal}>{state.goal.title}</Text>
          <View style={styles.rowBetween}>
            <ProgressTrack value={goalProgress} palette={palette} style={styles.focusProgress} />
            <Text style={styles.focusValue}>
              {state.goal.progress} / {state.goal.target}
            </Text>
          </View>
          <View style={styles.ctaWrap}>
            <View style={styles.stepperGroup}>
              <Pressable
                style={[styles.stepperButton, { opacity: state.goal.progress <= 0 ? 0.55 : 1 }]}
                disabled={state.goal.progress <= 0}
                onPress={decrementGoalProgress}>
                <Text style={styles.stepperText}>-</Text>
              </Pressable>
              <Pressable
                style={[styles.stepperButton, { opacity: isGoalComplete ? 0.55 : 1 }]}
                disabled={isGoalComplete}
                onPress={incrementGoalProgress}>
                <Text style={styles.stepperText}>+</Text>
              </Pressable>
            </View>
            <Pressable style={[styles.editButton, { borderColor: palette.accentStrong }]}> 
              <SymbolView
                name={resolveSymbolName({ ios: 'square.and.pencil', android: 'edit', web: 'edit' })}
                size={18}
                tintColor={palette.accentStrong}
              />
            </Pressable>
          </View>
        </GradientCard>

        <WeekdayPicker
          palette={palette}
          selectedIndex={state.selectedScheduleDay}
          onSelectDay={(index) => selectScheduleDay(index)}
        />

        <View style={styles.sectionRow}>
          <View style={styles.sectionLeftWrap}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Today's Tasks</Text>
            <Pressable style={[styles.addTaskChip, { borderColor: palette.border }]} onPress={addTask}>
              <View style={styles.addTaskChipInner}>
                <SymbolView
                  name={resolveSymbolName({ ios: 'plus', android: 'add', web: 'add' })}
                  size={12}
                  tintColor={palette.accent}
                />
                <Text style={[styles.addTaskChipText, { color: palette.accent }]}>Add task</Text>
              </View>
            </Pressable>
          </View>
          <Text style={[styles.sectionAction, { color: palette.accent }]}>{remainingTasks} REMAINING</Text>
        </View>
        {state.tasks.map((task) => (
          <Pressable key={task.id} onPress={() => toggleTask(task.id)}>
            <SurfaceCard palette={palette} style={[styles.taskCard, { opacity: task.completed ? 0.6 : 1 }]}>
              <View style={styles.taskRow}>
                <View
                  style={[
                    styles.taskCheck,
                    {
                      borderColor: task.completed ? successColor : palette.border,
                      backgroundColor: 'transparent',
                    },
                  ]}>
                  <AnimatedCompleteCheck completed={task.completed} tintColor={successColor} />
                </View>
                <Text
                  style={[
                    styles.taskText,
                    {
                      color: task.completed ? palette.mutedText : palette.text,
                      textDecorationLine: task.completed ? 'line-through' : 'none',
                    },
                  ]}>
                  {task.title}
                </Text>
              </View>
            </SurfaceCard>
          </Pressable>
        ))}

        <DashedAction
          label="Add task"
          palette={palette}
          icon={
            <SymbolView
              name={resolveSymbolName({ ios: 'plus', android: 'add', web: 'add' })}
              size={20}
              tintColor={palette.mutedText}
            />
          }
          style={styles.addTask}
          onPress={addTask}
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
    paddingBottom: 132,
  },
  progressCard: {
    marginBottom: 24,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryProgress: {
    marginTop: 14,
    height: 8,
  },
  sectionRow: {
    paddingHorizontal: 6,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  addTaskChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addTaskChipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  addTaskChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  focusCard: {
    marginBottom: 24,
    borderRadius: 30,
  },
  focusTop: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  objectiveTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  objectiveTagText: {
    color: '#fff',
    fontSize: 13,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  focusGoal: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    marginBottom: 12,
  },
  focusProgress: {
    flex: 1,
    marginRight: 12,
    height: 9,
  },
  focusValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  ctaWrap: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    width: 56,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    color: '#5b21b6',
    fontSize: 26,
    fontWeight: '700',
  },
  editButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
  },

  scheduleList: {
    paddingBottom: 12,
    gap: 10,
  },
  scheduleCard: {
    width: 64,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 12,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  scheduleDay: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  scheduleDate: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '700',
  },
  scheduleDot: {
    marginTop: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  taskCard: {
    marginBottom: 12,
    borderRadius: 26,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  addTask: {
    marginTop: 2,
    marginBottom: 20,
  },
  reflectionCard: {
    alignItems: 'center',
    borderRadius: 30,
    paddingVertical: 24,
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  reflectionBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6f1dff',
    marginBottom: 10,
  },
  reflectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  reflectionBody: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 14,
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
