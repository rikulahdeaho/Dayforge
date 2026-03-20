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
import { SymbolView } from '@/components/dayforge/SymbolView';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { DateHeader } from '@/components/dayforge/DateHeader';
import { feedbackComplete, feedbackSelection, feedbackTap } from '@/components/dayforge/feedback';
import { FlowCTA, FlowStatusRow } from '@/components/dayforge/FlowCTA';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import {
  DashedAction,
  DayforgePalette,
  GradientCard,
  ProgressTrack,
  SurfaceCard,
} from '@/components/dayforge/Primitives';
import { WeekdayPicker } from '@/components/dayforge/WeekdayPicker';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';
import {
  getCurrentMondayBasedDayIndex,
  getCurrentWeekStartDateKey,
  getDateForMondayBasedDayIndex,
  getDateKeyForMondayBasedDayIndex,
} from '@/store/appState.helpers';
import {
  selectCompletedTasksCount,
  selectGoalProgress,
  selectRemainingTasksCount,
} from '@/store/appState.selectors';
import { useRouter } from 'expo-router';

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
  const { state, decrementGoalProgress, incrementGoalProgress, removeTask, toggleTask } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const [selectedScheduleDay, setSelectedScheduleDay] = useState(getCurrentMondayBasedDayIndex);
  const [pendingTaskDeletion, setPendingTaskDeletion] = useState<{ id: string; title: string } | null>(null);
  const pendingTaskDeletionRef = useRef<{ id: string; title: string } | null>(null);
  const pendingTaskDeletionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedDateKey = getDateKeyForMondayBasedDayIndex(selectedScheduleDay);
  const selectedDateLabel = getDateForMondayBasedDayIndex(selectedScheduleDay).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const selectedSectionDate = getDateForMondayBasedDayIndex(selectedScheduleDay).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const goalProgress = selectGoalProgress(state);
  const currentWeekStartDateKey = getCurrentWeekStartDateKey();
  const currentWeekGoalProgress = state.goal.progressByWeek[currentWeekStartDateKey] ?? state.goal.progress;
  const completedTasks = selectCompletedTasksCount(state, selectedScheduleDay);
  const remainingTasks = selectRemainingTasksCount(state, selectedScheduleDay);
  const isGoalComplete = currentWeekGoalProgress >= state.goal.target;
  const successColor = palette.success;

  const headerDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const openTaskModal = () => {
    feedbackTap();
    router.push({ pathname: '/add-task', params: { dayIndex: String(selectedScheduleDay) } });
  };

  const clearPendingDeletionTimeout = () => {
    if (pendingTaskDeletionTimeoutRef.current) {
      clearTimeout(pendingTaskDeletionTimeoutRef.current);
      pendingTaskDeletionTimeoutRef.current = null;
    }
  };

  const commitTaskDeletion = (taskId: string) => {
    removeTask(taskId);
    clearPendingDeletionTimeout();

    if (pendingTaskDeletionRef.current?.id === taskId) {
      pendingTaskDeletionRef.current = null;
      setPendingTaskDeletion(null);
    }
  };

  const queueTaskDeletion = (taskId: string, title: string) => {
    feedbackSelection();
    const previousDeletion = pendingTaskDeletionRef.current;
    if (previousDeletion) {
      commitTaskDeletion(previousDeletion.id);
    }

    const nextDeletion = { id: taskId, title };
    pendingTaskDeletionRef.current = nextDeletion;
    setPendingTaskDeletion(nextDeletion);
    clearPendingDeletionTimeout();
    pendingTaskDeletionTimeoutRef.current = setTimeout(() => {
      commitTaskDeletion(taskId);
    }, 4500);
  };

  const undoTaskDeletion = () => {
    feedbackTap();
    clearPendingDeletionTimeout();
    pendingTaskDeletionRef.current = null;
    setPendingTaskDeletion(null);
  };

  useEffect(() => {
    return () => {
      clearPendingDeletionTimeout();
    };
  }, []);

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DateHeader palette={palette} dateText={headerDate} title="Today's Tasks" />
        <FlowStatusRow palette={palette} />
        <FlowCTA palette={palette} currentStep="tasks" />

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
              {currentWeekGoalProgress} / {state.goal.target}
            </Text>
          </View>
          <View style={styles.ctaWrap}>
            <View style={styles.stepperGroup}>
              <Pressable
                style={[styles.stepperButton, { opacity: currentWeekGoalProgress <= 0 ? 0.55 : 1 }]}
                disabled={currentWeekGoalProgress <= 0}
                onPress={() => {
                  feedbackSelection();
                  decrementGoalProgress();
                }}>
                <Text style={styles.stepperText}>-</Text>
              </Pressable>
              <Pressable
                style={[styles.stepperButton, { opacity: isGoalComplete ? 0.55 : 1 }]}
                disabled={isGoalComplete}
                onPress={() => {
                  feedbackSelection();
                  incrementGoalProgress();
                }}>
                <Text style={styles.stepperText}>+</Text>
              </Pressable>
            </View>
            <Pressable
              style={[styles.editButton, { borderColor: palette.accentStrong }]}
              onPress={() => {
                feedbackTap();
                router.push('/edit-weekly-focus' as never);
              }}>
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
          selectedIndex={selectedScheduleDay}
          onSelectDay={setSelectedScheduleDay}
          onCalendarPress={() => router.push({ pathname: '/schedule-picker', params: { dateKey: selectedDateKey } } as never)}
        />

        <View style={styles.sectionRow}>
          <View style={styles.sectionLeftWrap}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>{selectedSectionDate}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.addTaskChip,
                { borderColor: palette.border, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={openTaskModal}>
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
        <Text style={[styles.swipeHint, { color: palette.mutedText }]}>Swipe left on a task to delete it.</Text>
        {state.tasks
          .filter((task) => task.dateKey === selectedDateKey)
          .filter((task) => task.id !== pendingTaskDeletion?.id)
          .map((task) => (
            <Swipeable
              key={task.id}
              overshootRight={false}
              renderRightActions={() => (
                <Pressable
                  onPress={() => queueTaskDeletion(task.id, task.title)}
                  style={styles.deleteAction}>
                  <SymbolView
                    name={resolveSymbolName({ ios: 'trash.fill', android: 'delete', web: 'delete' })}
                    size={18}
                    tintColor="#fff"
                  />
                  <Text style={styles.deleteActionText}>Delete</Text>
                </Pressable>
              )}>
              <Pressable
                onPress={() => {
                  feedbackComplete();
                  toggleTask(task.id, selectedScheduleDay);
                }}
                style={({ pressed }) => [pressed && styles.scaleDown]}>
                <SurfaceCard
                  palette={palette}
                  style={[styles.taskCard, { opacity: task.completionByDate[selectedDateKey] ? 0.6 : 1 }]}>
                  <View style={styles.taskRow}>
                    <View
                      style={[
                        styles.taskCheck,
                        {
                          borderColor: task.completionByDate[selectedDateKey] ? successColor : palette.border,
                          backgroundColor: 'transparent',
                        },
                      ]}>
                      <AnimatedCompleteCheck
                        completed={Boolean(task.completionByDate[selectedDateKey])}
                        tintColor={successColor}
                      />
                    </View>
                    <Text
                      style={[
                        styles.taskText,
                        {
                          color: task.completionByDate[selectedDateKey] ? palette.mutedText : palette.text,
                          textDecorationLine: task.completionByDate[selectedDateKey] ? 'line-through' : 'none',
                        },
                      ]}>
                      {task.title}
                    </Text>
                    <View
                      style={[
                        styles.categoryBadge,
                        { borderColor: palette.border, backgroundColor: palette.cardStrong },
                      ]}>
                      <Text style={[styles.categoryBadgeText, { color: palette.accent }]}>
                        {task.category === 'must-do'
                          ? 'Must do'
                          : task.category === 'good-to-do'
                            ? 'Good to do'
                            : 'Personal / wellbeing'}
                      </Text>
                    </View>
                  </View>
                </SurfaceCard>
              </Pressable>
            </Swipeable>
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
          onPress={openTaskModal}
        />
      </ScrollView>
      {pendingTaskDeletion ? (
        <View style={[styles.undoBar, { backgroundColor: palette.cardStrong, borderColor: palette.border }]}>
          <Text style={[styles.undoText, { color: palette.text }]} numberOfLines={1}>
            Deleted "{pendingTaskDeletion.title}"
          </Text>
          <Pressable onPress={undoTaskDeletion}>
            <Text style={[styles.undoAction, { color: palette.accent }]}>UNDO</Text>
          </Pressable>
        </View>
      ) : null}
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
  scaleDown: {
    transform: [{ scale: 0.985 }],
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
  swipeHint: {
    paddingHorizontal: 6,
    marginTop: -2,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '500',
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
    marginRight: 8,
  },
  categoryBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  addTask: {
    marginTop: 2,
    marginBottom: 20,
  },
  deleteAction: {
    width: 94,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: '#d1435b',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  undoBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 96,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  undoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  undoAction: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
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
