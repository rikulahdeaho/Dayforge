import { SymbolView } from '@/components/dayforge/SymbolView';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import Colors from '@/constants/Colors';
import { Fonts, Type } from '@/constants/Typography';
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
const EMPTY_WEEKLY_PLAN = {
  beforeYouBegin: '',
  pace: 'Balanced',
  protectedHabitIds: [],
};

export default function WeeklyPlanScreen() {
  const router = useRouter();
  const { state, incrementGoalProgress, decrementGoalProgress, moveTaskToDate, saveWeeklyPlan } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const thisWeekStartDateKey = getCurrentWeekStartDateKey();
  const nextWeekBaseDate = new Date();
  nextWeekBaseDate.setDate(nextWeekBaseDate.getDate() + 7);
  const nextWeekStartDateKey = getCurrentWeekStartDateKey(nextWeekBaseDate);
  const [selectedWeekStartDateKey, setSelectedWeekStartDateKey] = useState(thisWeekStartDateKey);
  const isCurrentWeekSelected = selectedWeekStartDateKey === thisWeekStartDateKey;
  const selectedWeekBaseDate = parseDateKeyToDate(selectedWeekStartDateKey);
  const selectedWeeklyPlan = useMemo(
    () => state.weeklyPlansByWeek[selectedWeekStartDateKey] ?? EMPTY_WEEKLY_PLAN,
    [selectedWeekStartDateKey, state.weeklyPlansByWeek]
  );

  const [beforeYouBegin, setBeforeYouBegin] = useState(selectedWeeklyPlan.beforeYouBegin);
  const [selectedPace, setSelectedPace] = useState(selectedWeeklyPlan.pace || 'Balanced');
  const [selectedHabits, setSelectedHabits] = useState<string[]>(selectedWeeklyPlan.protectedHabitIds);

  useEffect(() => {
    setBeforeYouBegin(selectedWeeklyPlan.beforeYouBegin);
    setSelectedPace(selectedWeeklyPlan.pace || 'Balanced');
    setSelectedHabits(selectedWeeklyPlan.protectedHabitIds);
  }, [selectedWeeklyPlan.beforeYouBegin, selectedWeeklyPlan.pace, selectedWeeklyPlan.protectedHabitIds, selectedWeekStartDateKey]);

  const goalProgress = selectGoalProgress(state);
  const weekRangeLabel = getCurrentWeekRangeLabel(selectedWeekBaseDate);
  const currentWeekStartDateKey = thisWeekStartDateKey;
  const currentWeekGoalProgress = state.goal.progressByWeek[currentWeekStartDateKey] ?? state.goal.progress;

  const weekReview = useMemo(() => {
    const previousWeekBaseDate = new Date(selectedWeekBaseDate);
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
  }, [selectedWeekBaseDate, state.goal.progressByWeek, state.goal.target, state.habits, state.reflectionHistory]);

  const weekDateKeys = useMemo(
    () => weekdayLabels.map((_, index) => getDateKeyForMondayBasedDayIndex(index, selectedWeekBaseDate)),
    [selectedWeekBaseDate]
  );

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
        const date = getDateForMondayBasedDayIndex(index, selectedWeekBaseDate);
        const dateKeyForWeek = getDateKeyForMondayBasedDayIndex(index, selectedWeekBaseDate);

        return {
          id: `${label}-${dateKeyForWeek}`,
          label,
          day: date.getDate(),
          index,
          dateKey: dateKeyForWeek,
          tasks: state.tasks.filter((task) => task.dateKey === dateKeyForWeek),
        };
      }),
    [selectedWeekBaseDate, state.tasks]
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
      dateKey: getDateKeyForMondayBasedDayIndex(targetDay, selectedWeekBaseDate),
    });
  };

  const saveAndClose = () => {
    saveWeeklyPlan({
      weekStartDateKey: selectedWeekStartDateKey,
      beforeYouBegin,
      pace: selectedPace,
      protectedHabitIds: selectedHabits,
    });
    router.back();
  };

  const cancelChanges = () => {
    setBeforeYouBegin(selectedWeeklyPlan.beforeYouBegin);
    setSelectedPace(selectedWeeklyPlan.pace || 'Balanced');
    setSelectedHabits(selectedWeeklyPlan.protectedHabitIds);
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
        <View style={styles.weekSwitchRow}>
          {[
            { id: thisWeekStartDateKey, label: 'This week' },
            { id: nextWeekStartDateKey, label: 'Next week' },
          ].map((option) => {
            const selected = option.id === selectedWeekStartDateKey;
            return (
              <Pressable
                key={option.id}
                onPress={() => {
                  feedbackSelection();
                  setSelectedWeekStartDateKey(option.id);
                }}
                style={[
                  styles.weekSwitchPill,
                  {
                    backgroundColor: selected ? palette.accentStrong : palette.card,
                    borderColor: selected ? palette.accentSoft : palette.border,
                  },
                ]}>
                <Text style={[styles.weekSwitchText, { color: selected ? palette.onAccent : palette.text }]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isCurrentWeekSelected ? (
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
        ) : null}

        <GradientCard palette={palette} style={styles.goalCard} colors={[palette.heroPrimaryStart, palette.heroPrimaryMid, palette.heroPrimaryEnd]}>
          <Text style={[styles.goalLabel, { color: palette.overlayText }]}>MAIN GOAL FOR THIS WEEK</Text>
          <Text style={[styles.goalTitle, { color: palette.onAccent }]}>{state.goal.title}</Text>
          <View style={styles.goalRow}>
            <ProgressTrack value={goalProgress} palette={palette} style={styles.goalProgress} />
            <Text style={[styles.goalProgressText, { color: palette.onAccent }]}>{currentWeekGoalProgress}/{state.goal.target}</Text>
          </View>
          <View style={styles.goalActions}>
            <View style={styles.goalStepperGroup}>
              <Pressable
                style={[styles.goalStepButton, { backgroundColor: palette.overlayStrong, borderColor: palette.overlayStrong }]}
                onPress={() => {
                  feedbackSelection();
                  decrementGoalProgress();
                }}>
                <Text style={[styles.goalStepText, { color: palette.onAccent }]}>-</Text>
              </Pressable>
              <Pressable
                style={[styles.goalStepButton, { backgroundColor: palette.overlayStrong, borderColor: palette.overlayStrong }]}
                onPress={() => {
                  feedbackSelection();
                  incrementGoalProgress();
                }}>
                <Text style={[styles.goalStepText, { color: palette.onAccent }]}>+</Text>
              </Pressable>
            </View>
            <Pressable
              style={[styles.goalEditButton, { backgroundColor: palette.overlayStrong, borderColor: palette.overlayStrong }]}
              onPress={() => {
                feedbackTap();
                router.push('/edit-weekly-focus' as never);
              }}>
              <SymbolView
                name={resolveSymbolName({ ios: 'square.and.pencil', android: 'edit', web: 'edit' })}
                size={16}
                tintColor={palette.accentSoft}
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

        <Text style={[styles.sectionHeading, { color: palette.text }]}>Priorities</Text>
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
                <Text style={[styles.paceText, { color: selected ? palette.onAccent : palette.text }]}>{option}</Text>
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
    ...Type.screenTitle,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  microLabel: {
    marginBottom: 16,
    paddingHorizontal: 4,
    ...Type.meta,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardTitle: {
    ...Type.cardTitle,
    marginBottom: 10,
  },
  weekSwitchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  weekSwitchPill: {
    borderWidth: 0.75,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  weekSwitchText: {
    ...Type.label,
  },
  reviewCard: { borderRadius: 26, marginBottom: 24 },
  reviewGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  reviewStat: {
    flex: 1,
    borderWidth: 0.75,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  reviewLabel: {
    ...Type.meta,
    marginBottom: 4,
  },
  reviewValue: {
    ...Type.value,
  },
  reviewInsight: {
    ...Type.bodySmall,
  },
  goalCard: {
    borderRadius: 26,
    marginBottom: 24,
    padding: 24,
  },
  goalLabel: {
    ...Type.meta,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  goalTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  goalProgress: {
    flex: 1,
    height: 8,
  },
  goalProgressText: {
    ...Type.bodyStrong,
  },
  goalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalStepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goalStepButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 0.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalStepText: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '700',
  },
  goalEditButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 0.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptCard: {
    borderRadius: 26,
    marginBottom: 24,
  },
  promptInput: {
    borderWidth: 0.75,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 84,
    textAlignVertical: 'top',
    ...Type.body,
  },
  sectionHeading: {
    ...Type.sectionTitle,
    marginBottom: 12,
    paddingHorizontal: 4,
    opacity: 0.94,
  },
  listCard: {
    borderRadius: 22,
    marginBottom: 10,
  },
  bucketTitle: {
    ...Type.cardTitle,
    marginBottom: 12,
  },
  bucketItem: {
    ...Type.bodySmall,
    marginBottom: 8,
  },
  emptyText: {
    ...Type.bodySmall,
  },
  rhythmCard: {
    borderRadius: 24,
    marginBottom: 24,
    gap: 10,
  },
  rhythmRow: {
    borderWidth: 0.75,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dayBadge: {
    width: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  dayBadgeLabel: {
    ...Type.meta,
  },
  dayBadgeDate: {
    marginTop: 2,
    ...Type.cardTitle,
  },
  dayTaskStack: {
    flex: 1,
    gap: 6,
  },
  dayTaskRow: {
    borderWidth: 0.75,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayTaskText: {
    flex: 1,
    ...Type.bodySmall,
  },
  dayTaskActions: {
    flexDirection: 'row',
    gap: 6,
  },
  moveButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 0.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  habitsCard: {
    borderRadius: 24,
    marginBottom: 24,
    gap: 8,
  },
  habitRow: {
    borderWidth: 0.75,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
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
    ...Type.bodySmall,
  },
  paceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  pacePill: {
    borderWidth: 0.75,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  paceText: {
    ...Type.label,
  },
  primaryButton: {
    marginBottom: 16,
  },
  secondaryAction: {
    textAlign: 'center',
    ...Type.bodyStrong,
  },
});
