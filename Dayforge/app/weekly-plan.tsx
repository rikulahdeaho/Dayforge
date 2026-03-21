import { SymbolView } from '@/components/dayforge/SymbolView';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import Colors from '@/constants/Colors';
import { feedbackSelection, feedbackTap } from '@/components/dayforge/feedback';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import { DayforgePalette, GlowButton, GradientCard, ProgressTrack, SurfaceCard } from '@/components/dayforge/Primitives';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import {
  getCurrentWeekRangeLabel,
  getCurrentWeekStartDateKey,
  formatFullDateLabel,
  getDateForMondayBasedDayIndex,
  getDateKeyForMondayBasedDayIndex,
  parseDateKeyToDate,
} from '@/store/appState.helpers';
import { useAppState } from '@/store/appState';
import { selectGoalProgress } from '@/store/appState.selectors';

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const paceOptions = ['Light and realistic', 'Balanced', 'Focused', 'High energy'];

export default function WeeklyPlanScreen() {
  const router = useRouter();
  const { state, incrementGoalProgress, decrementGoalProgress, moveTaskToDate, saveWeeklyPlan } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;

  const [beforeYouBegin, setBeforeYouBegin] = useState(state.weeklyPlan.beforeYouBegin);
  const [selectedPace, setSelectedPace] = useState(state.weeklyPlan.pace || 'Balanced');
  const [selectedHabits, setSelectedHabits] = useState<string[]>(state.weeklyPlan.protectedHabitIds);

  useEffect(() => {
    setBeforeYouBegin(state.weeklyPlan.beforeYouBegin);
    setSelectedPace(state.weeklyPlan.pace || 'Balanced');
    setSelectedHabits(state.weeklyPlan.protectedHabitIds);
  }, [state.weeklyPlan.beforeYouBegin, state.weeklyPlan.pace, state.weeklyPlan.protectedHabitIds]);

  const goalProgress = selectGoalProgress(state);
  const weekRangeLabel = getCurrentWeekRangeLabel();
  const currentWeekStartDateKey = getCurrentWeekStartDateKey();
  const currentWeekGoalProgress = state.goal.progressByWeek[currentWeekStartDateKey] ?? state.goal.progress;

  const weekReview = useMemo(() => {
    const previousWeekBaseDate = new Date();
    previousWeekBaseDate.setDate(previousWeekBaseDate.getDate() - 7);
    const previousWeekStartDateKey = getCurrentWeekStartDateKey(previousWeekBaseDate);
    const lastWeekDateKeys = weekdayLabels.map((_, index) =>
      getDateKeyForMondayBasedDayIndex(index, previousWeekBaseDate)
    );

    const habitsCompleted = state.habits.reduce(
      (sum, habit) => sum + lastWeekDateKeys.filter((key) => Boolean(habit.completionByDate[key])).length,
      0
    );

    const reflectionDays = new Set(
      state.reflectionHistory
        .map((entry) => entry.fullDate)
        .filter((fullDate) =>
          lastWeekDateKeys.map((key) => formatFullDateLabel(parseDateKeyToDate(key))).includes(fullDate)
        )
    ).size;

    return {
      goalProgress: `${state.goal.progressByWeek[previousWeekStartDateKey] ?? 0}/${state.goal.target}`,
      habitsCompleted,
      reflectionDays,
    };
  }, [state.goal.progressByWeek, state.goal.target, state.habits, state.reflectionHistory]);

  const weekDateKeys = useMemo(() => weekdayLabels.map((_, index) => getDateKeyForMondayBasedDayIndex(index)), []);

  const priorities = useMemo(() => {
    const tasksForWeek = state.tasks.filter((task) => weekDateKeys.includes(task.dateKey));
    return {
      mustDo: tasksForWeek.filter((task) => task.category === 'must-do'),
      goodToDo: tasksForWeek.filter((task) => task.category === 'good-to-do'),
      wellbeing: tasksForWeek.filter((task) => task.category === 'wellbeing'),
    };
  }, [state.tasks, weekDateKeys]);

  const weekRhythm = useMemo(
    () =>
      weekdayLabels.map((label, index) => {
        const dateKey = getDateKeyForMondayBasedDayIndex(index);
        const date = getDateForMondayBasedDayIndex(index);

        return {
          id: `${label}-${dateKey}`,
          label,
          day: date.getDate(),
          index,
          dateKey,
          tasks: state.tasks.filter((task) => task.dateKey === dateKey),
        };
      }),
    [state.tasks]
  );

  const toggleHabit = (habitId: string) => {
    setSelectedHabits((prev) => {
      if (prev.includes(habitId)) {
        return prev.filter((id) => id !== habitId);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, habitId];
    });
  };

  const moveTask = (taskId: string, currentDayIndex: number, direction: -1 | 1) => {
    const targetDay = currentDayIndex + direction;
    if (targetDay < 0 || targetDay > 6) {
      return;
    }

    moveTaskToDate({
      taskId,
      dateKey: getDateKeyForMondayBasedDayIndex(targetDay),
    });
  };

  const saveAndClose = () => {
    saveWeeklyPlan({
      beforeYouBegin,
      pace: selectedPace,
      protectedHabitIds: selectedHabits,
    });
    router.back();
  };

  const cancelChanges = () => {
    setBeforeYouBegin(state.weeklyPlan.beforeYouBegin);
    setSelectedPace(state.weeklyPlan.pace || 'Balanced');
    setSelectedHabits(state.weeklyPlan.protectedHabitIds);
    router.back();
  };

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}> 
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: palette.text }]}>Weekly Plan</Text>
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
        <Text style={[styles.microLabel, { color: palette.mutedText }]}>{weekRangeLabel}</Text>

        <SurfaceCard palette={palette} style={styles.reviewCard}>
          <Text style={[styles.cardTitle, { color: palette.text }]}>Last week</Text>
          <View style={styles.reviewGrid}>
            <View style={[styles.reviewStat, { borderColor: palette.border }]}>
              <Text style={[styles.reviewLabel, { color: palette.mutedText }]}>Goal progress</Text>
              <Text style={[styles.reviewValue, { color: palette.accentStrong }]}>{weekReview.goalProgress}</Text>
            </View>
            <View style={[styles.reviewStat, { borderColor: palette.border }]}>
              <Text style={[styles.reviewLabel, { color: palette.mutedText }]}>Habits completed</Text>
              <Text style={[styles.reviewValue, { color: palette.text }]}>{weekReview.habitsCompleted}</Text>
            </View>
            <View style={[styles.reviewStat, { borderColor: palette.border }]}>
              <Text style={[styles.reviewLabel, { color: palette.mutedText }]}>Reflection days</Text>
              <Text style={[styles.reviewValue, { color: palette.text }]}>{weekReview.reflectionDays}</Text>
            </View>
          </View>
          <Text style={[styles.reviewInsight, { color: palette.mutedText }]}>You stayed most consistent on midweek blocks.</Text>
        </SurfaceCard>

        <GradientCard palette={palette} style={styles.goalCard} colors={['#5b21b6', '#6d28d9', '#7c3aed']}>
          <Text style={styles.goalLabel}>MAIN GOAL FOR THIS WEEK</Text>
          <Text style={styles.goalTitle}>{state.goal.title}</Text>
          <View style={styles.goalRow}>
            <ProgressTrack value={goalProgress} palette={palette} style={styles.goalProgress} />
            <Text style={styles.goalProgressText}>{currentWeekGoalProgress}/{state.goal.target}</Text>
          </View>
          <View style={styles.goalActions}>
            <View style={styles.goalStepperGroup}>
              <Pressable
                style={styles.goalStepButton}
                onPress={() => {
                  feedbackSelection();
                  decrementGoalProgress();
                }}>
                <Text style={styles.goalStepText}>-</Text>
              </Pressable>
              <Pressable
                style={styles.goalStepButton}
                onPress={() => {
                  feedbackSelection();
                  incrementGoalProgress();
                }}>
                <Text style={styles.goalStepText}>+</Text>
              </Pressable>
            </View>
            <Pressable
              style={styles.goalEditButton}
              onPress={() => {
                feedbackTap();
                router.push('/edit-weekly-focus' as never);
              }}>
              <SymbolView
                name={resolveSymbolName({ ios: 'square.and.pencil', android: 'edit', web: 'edit' })}
                size={18}
                tintColor="#5b21b6"
              />
            </Pressable>
          </View>
        </GradientCard>

        <SurfaceCard palette={palette} style={styles.promptCard}>
          <Text style={[styles.cardTitle, { color: palette.text }]}>Weekly intention</Text>
          <TextInput
            value={beforeYouBegin}
            onChangeText={setBeforeYouBegin}
            placeholder="What matters most this week, and what will you protect to make it happen?"
            placeholderTextColor={palette.mutedText}
            multiline
            style={[
              styles.promptInput,
              {
                borderColor: palette.border,
                color: palette.text,
                backgroundColor: palette.cardStrong,
              },
            ]}
          />
        </SurfaceCard>

        <Text style={[styles.sectionHeading, { color: palette.text }]}>Priorities (from tasks)</Text>
        <SurfaceCard palette={palette} style={styles.listCard}>
          <Text style={[styles.bucketTitle, { color: palette.accentStrong }]}>Must do</Text>
          {priorities.mustDo.length ? (
            priorities.mustDo.map((task) => (
              <Text key={task.id} style={[styles.bucketItem, { color: palette.text }]}>- {task.title}</Text>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: palette.mutedText }]}>No tasks in this category.</Text>
          )}
        </SurfaceCard>
        <SurfaceCard palette={palette} style={styles.listCard}>
          <Text style={[styles.bucketTitle, { color: palette.accentStrong }]}>Good to do</Text>
          {priorities.goodToDo.length ? (
            priorities.goodToDo.map((task) => (
              <Text key={task.id} style={[styles.bucketItem, { color: palette.text }]}>- {task.title}</Text>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: palette.mutedText }]}>No tasks in this category.</Text>
          )}
        </SurfaceCard>
        <SurfaceCard palette={palette} style={styles.listCard}>
          <Text style={[styles.bucketTitle, { color: palette.accentStrong }]}>Personal / wellbeing</Text>
          {priorities.wellbeing.length ? (
            priorities.wellbeing.map((task) => (
              <Text key={task.id} style={[styles.bucketItem, { color: palette.text }]}>- {task.title}</Text>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: palette.mutedText }]}>No tasks in this category.</Text>
          )}
        </SurfaceCard>

        <Text style={[styles.sectionHeading, { color: palette.text }]}>Week structure</Text>
        <SurfaceCard palette={palette} style={styles.rhythmCard}>
          {weekRhythm.map((day) => (
            <View key={day.id} style={[styles.rhythmRow, { borderColor: palette.border }]}> 
              <View style={[styles.dayBadge, { backgroundColor: palette.cardStrong }]}>
                <Text style={[styles.dayBadgeLabel, { color: palette.mutedText }]}>{day.label}</Text>
                <Text style={[styles.dayBadgeDate, { color: palette.text }]}>{day.day}</Text>
              </View>
              <View style={styles.dayTaskStack}>
                {day.tasks.length ? (
                  day.tasks.map((task) => (
                    <View key={task.id} style={[styles.dayTaskRow, { borderColor: palette.border }]}> 
                      <Text numberOfLines={1} style={[styles.dayTaskText, { color: palette.text }]}>{task.title}</Text>
                      <View style={styles.dayTaskActions}>
                        <Pressable
                          onPress={() => moveTask(task.id, day.index, -1)}
                          style={[styles.moveButton, { borderColor: palette.border, backgroundColor: palette.cardStrong }]}
                          disabled={day.index === 0}>
                          <Text style={[styles.moveButtonText, { color: day.index === 0 ? palette.mutedText : palette.text }]}>↑</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => moveTask(task.id, day.index, 1)}
                          style={[styles.moveButton, { borderColor: palette.border, backgroundColor: palette.cardStrong }]}
                          disabled={day.index === 6}>
                          <Text style={[styles.moveButtonText, { color: day.index === 6 ? palette.mutedText : palette.text }]}>↓</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyText, { color: palette.mutedText }]}>No tasks</Text>
                )}
              </View>
            </View>
          ))}
        </SurfaceCard>

        <Text style={[styles.sectionHeading, { color: palette.text }]}>Habits to protect</Text>
        <SurfaceCard palette={palette} style={styles.habitsCard}>
          {state.habits.map((habit) => {
            const selected = selectedHabits.includes(habit.id);
            return (
              <Pressable
                key={habit.id}
                onPress={() => {
                  feedbackSelection();
                  toggleHabit(habit.id);
                }}
                style={[styles.habitRow, { borderColor: palette.border }]}> 
                <View
                  style={[
                    styles.habitCheck,
                    {
                      borderColor: selected ? palette.accentStrong : palette.border,
                      backgroundColor: selected ? palette.accentStrong : 'transparent',
                    },
                  ]}
                />
                <Text style={[styles.habitTitle, { color: palette.text }]}>{habit.title}</Text>
              </Pressable>
            );
          })}
        </SurfaceCard>

        <Text style={[styles.sectionHeading, { color: palette.text }]}>How should this week feel?</Text>
        <View style={styles.paceWrap}>
          {paceOptions.map((option) => {
            const selected = selectedPace === option;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  feedbackSelection();
                  setSelectedPace(option);
                }}
                style={[
                  styles.pacePill,
                  {
                    backgroundColor: selected ? palette.accentStrong : palette.card,
                    borderColor: selected ? palette.accentSoft : palette.border,
                  },
                ]}>
                <Text style={[styles.paceText, { color: selected ? '#fff' : palette.text }]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <GlowButton
          label="Save weekly plan"
          palette={palette}
          style={styles.primaryButton}
          onPress={() => {
            feedbackTap();
            saveAndClose();
          }}
        />

        <Pressable
          onPress={() => {
            feedbackTap();
            cancelChanges();
          }}>
          <Text style={[styles.secondaryAction, { color: palette.accentStrong }]}>Cancel</Text>
        </Pressable>
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
  microLabel: {
    marginBottom: 12,
    paddingHorizontal: 4,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  reviewCard: {
    borderRadius: 26,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  reviewGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  reviewStat: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  reviewLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
  },
  reviewInsight: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  goalCard: {
    borderRadius: 26,
    marginBottom: 14,
  },
  goalLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  goalTitle: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    marginBottom: 10,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  goalProgress: {
    flex: 1,
    height: 8,
  },
  goalProgressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  goalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalStepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalStepButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalStepText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
  },
  goalEditButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptCard: {
    borderRadius: 26,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 84,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  listCard: {
    borderRadius: 22,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  bucketTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  bucketItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  rhythmCard: {
    borderRadius: 24,
    marginBottom: 14,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  rhythmRow: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dayBadge: {
    width: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  dayBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dayBadgeDate: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '700',
  },
  dayTaskStack: {
    flex: 1,
    gap: 6,
  },
  dayTaskRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayTaskText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  dayTaskActions: {
    flexDirection: 'row',
    gap: 6,
  },
  moveButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  habitsCard: {
    borderRadius: 24,
    marginBottom: 14,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  habitRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  habitCheck: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
  },
  habitTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500',
  },
  paceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  pacePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  paceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryAction: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
});
