import { SymbolView } from '@/components/dayforge/SymbolView';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { DateHeader } from '@/components/dayforge/DateHeader';
import { feedbackComplete, feedbackTap } from '@/components/dayforge/feedback';
import { FlowCTA, FlowStatusRow } from '@/components/dayforge/FlowCTA';
import { DayforgePalette, DashedAction, ProgressTrack } from '@/components/dayforge/Primitives';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import { WeekdayPicker } from '@/components/dayforge/WeekdayPicker';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';
import { getCurrentMondayBasedDayIndex, getDateKeyForMondayBasedDayIndex } from '@/store/appState.helpers';
import { useRouter } from 'expo-router';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HABIT_ICON_ID_BY_IOS_NAME: Record<string, string> = {
  'figure.mind.and.body': 'figure.mind.and.body',
  'book.fill': 'book.fill',
  'drop.fill': 'drop.fill',
  'dumbbell.fill': 'dumbbell.fill',
  'moon.stars.fill': 'moon.stars.fill',
  'heart.fill': 'heart.fill',
};

function resolveStreakPillText(totalCount: number, completedCount: number) {
  if (!totalCount) {
    return 'START YOUR STREAK';
  }

  if (completedCount >= totalCount) {
    return 'PERFECT DAY';
  }

  if (completedCount / totalCount >= 0.6) {
    return 'MOMENTUM HIGH';
  }

  return 'STREAK ACTIVE';
}

function resolveHeroBody(totalCount: number, completedCount: number, nextHabitTitle?: string) {
  const habitsLeft = Math.max(0, totalCount - completedCount);

  if (!totalCount) {
    return 'Add your first habit and build a repeatable daily rhythm.';
  }

  if (habitsLeft === 0) {
    return 'Everything is done for this day. Keep the consistency tomorrow.';
  }

  if (habitsLeft === 1 && nextHabitTitle) {
    return `Only one left: ${nextHabitTitle}. Finish strong.`;
  }

  return `${habitsLeft} habits left. Stack small wins and keep the chain alive.`;
}

function resolveHabitStatus(weeklyProgress: boolean[]) {
  const completedDays = weeklyProgress.filter(Boolean).length;

  if (completedDays >= 6) {
    return {
      label: 'STREAKING',
      icon: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' },
    };
  }

  if (completedDays >= 4) {
    return {
      label: 'ON TRACK',
      icon: { ios: 'bolt.fill', android: 'flash_on', web: 'flash_on' },
    };
  }

  if (completedDays >= 2) {
    return {
      label: 'CONSISTENT',
      icon: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
    };
  }

  return {
    label: 'BUILDING',
    icon: { ios: 'leaf.fill', android: 'eco', web: 'eco' },
  };
}

function AnimatedCompleteBadge({ completed, tintColor }: { completed: boolean; tintColor: string }) {
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
        size={16}
        tintColor={tintColor}
      />
    </Animated.View>
  );
}

function AnimatedProgressDot({ filled, color }: { filled: boolean; color: string }) {
  const scale = useSharedValue(filled ? 1 : 0.8);
  const opacity = useSharedValue(filled ? 1 : 0.45);

  useEffect(() => {
    scale.value = withTiming(filled ? 1 : 0.8, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(filled ? 1 : 0.45, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });
  }, [filled, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scaleX: scale.value }, { scaleY: scale.value }],
  }));

  return <Animated.View style={[styles.dot, { backgroundColor: color }, animatedStyle]} />;
}

export default function HabitsScreen() {
  const router = useRouter();
  const { removeHabit, state, toggleHabit } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const [selectedHabitDayIndex, setSelectedHabitDayIndex] = useState(getCurrentMondayBasedDayIndex);
  const longPressHabitIdRef = useRef<string | null>(null);
  const successColor = palette.success;

  const selectedDateKey = useMemo(
    () => getDateKeyForMondayBasedDayIndex(selectedHabitDayIndex),
    [selectedHabitDayIndex]
  );

  const totalCount = state.habits.length;
  const completedCount = useMemo(
    () => state.habits.filter((habit) => Boolean(habit.completionByDate[selectedDateKey])).length,
    [selectedDateKey, state.habits]
  );
  const progressValue = totalCount ? completedCount / totalCount : 0;

  const nextIncompleteHabit = useMemo(() => {
    const incompleteHabits = state.habits.filter((habit) => !habit.completionByDate[selectedDateKey]);
    if (!incompleteHabits.length) {
      return undefined;
    }

    const protectedHabitIds = new Set(state.weeklyPlan.protectedHabitIds);
    return incompleteHabits.find((habit) => protectedHabitIds.has(habit.id)) ?? incompleteHabits[0];
  }, [selectedDateKey, state.habits, state.weeklyPlan.protectedHabitIds]);

  const headerDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const completeHabit = (habitId: string) => {
    feedbackComplete();
    toggleHabit(habitId, selectedHabitDayIndex);
  };

  const openHabitModal = () => {
    feedbackTap();
    router.push('/add-habit');
  };

  const openEditHabit = (habit: (typeof state.habits)[number]) => {
    const fallbackIconId = 'heart.fill';
    const iconId = HABIT_ICON_ID_BY_IOS_NAME[habit.icon.ios] ?? fallbackIconId;

    feedbackTap();
    router.push({
      pathname: '/add-habit',
      params: {
        mode: 'edit',
        habitId: habit.id,
        title: habit.title,
        subtitle: habit.subtitle,
        iconId,
      },
    });
  };

  const confirmDeleteHabit = (habitId: string, title: string) => {
    Alert.alert('Delete habit', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeHabit(habitId);
        },
      },
    ]);
  };

  const openHabitActions = (habit: (typeof state.habits)[number]) => {
    Alert.alert(habit.title, 'Choose action', [
      {
        text: 'Edit',
        onPress: () => openEditHabit(habit),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => confirmDeleteHabit(habit.id, habit.title),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const completeNextHabit = () => {
    if (nextIncompleteHabit) {
      completeHabit(nextIncompleteHabit.id);
      return;
    }

    if (!state.habits.length) {
      openHabitModal();
      return;
    }

    feedbackTap();
  };

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DateHeader palette={palette} dateText={headerDate} title="Today's Habits" />
        <FlowStatusRow palette={palette} />
        <FlowCTA palette={palette} currentStep="habits" />

        <Pressable onPress={completeNextHabit}>
          <LinearGradient
            colors={[palette.accentStrong, palette.accent, '#7f22ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}>
            <View style={styles.streakPill}>
              <SymbolView
                name={resolveSymbolName({
                  ios: 'flame.fill',
                  android: 'local_fire_department',
                  web: 'local_fire_department',
                })}
                size={14}
                tintColor="#fff"
              />
              <Text style={styles.streakText}>{resolveStreakPillText(totalCount, completedCount)}</Text>
            </View>
            <Text style={styles.heroTitle}>
              {Math.max(0, totalCount - completedCount)} left for {WEEKDAY_LABELS[selectedHabitDayIndex]}
            </Text>
            <Text style={styles.heroBody}>{resolveHeroBody(totalCount, completedCount, nextIncompleteHabit?.title)}</Text>
            <ProgressTrack value={progressValue} palette={palette} style={styles.heroProgress} />
          </LinearGradient>
        </Pressable>

        <WeekdayPicker
          palette={palette}
          selectedIndex={selectedHabitDayIndex}
          onSelectDay={setSelectedHabitDayIndex}
          onCalendarPress={() =>
            router.push({ pathname: '/schedule-picker', params: { dateKey: selectedDateKey } } as never)
          }
        />
        <Text style={[styles.dayContext, { color: palette.mutedText }]}>
          Showing {WEEKDAY_LABELS[selectedHabitDayIndex]} habits, {Math.max(0, totalCount - completedCount)} left.
        </Text>

        {state.habits.map((habit) => {
          const iconName = resolveSymbolName(habit.icon);
          const isCompletedForSelectedDay = Boolean(habit.completionByDate[selectedDateKey]);
          const isNextHabit = nextIncompleteHabit?.id === habit.id;
          const status = resolveHabitStatus(habit.weeklyProgress);
          const isProtected = state.weeklyPlan.protectedHabitIds.includes(habit.id);

          return (
            <View key={habit.id}>
              <Pressable
                onPress={() => {
                  if (longPressHabitIdRef.current === habit.id) {
                    return;
                  }
                  completeHabit(habit.id);
                }}
                onLongPress={() => {
                  longPressHabitIdRef.current = habit.id;
                  openHabitActions(habit);
                }}
                onPressOut={() => {
                  if (longPressHabitIdRef.current === habit.id) {
                    longPressHabitIdRef.current = null;
                  }
                }}
                delayLongPress={280}>
                <View
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: 'rgba(255,255,255,0.035)',
                      borderColor: isCompletedForSelectedDay ? `${palette.accentSoft}88` : palette.border,
                      shadowColor: isCompletedForSelectedDay ? palette.accentStrong : palette.shadow,
                    },
                    isNextHabit ? styles.nextHabitCard : null,
                  ]}>
                  {isNextHabit ? (
                    <View style={[styles.nextTag, { backgroundColor: `${palette.accent}22`, borderColor: `${palette.accent}77` }]}>
                      <Text style={[styles.nextTagText, { color: palette.accent }]}>NEXT UP</Text>
                    </View>
                  ) : null}
                  <View style={styles.itemTop}>
                    <View style={[styles.itemIcon, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                      <SymbolView name={iconName} size={48} tintColor={palette.accent} />
                    </View>
                    <View style={styles.itemCopy}>
                      <Text style={[styles.itemTitle, { color: palette.text }]}>{habit.title}</Text>
                      <Text style={[styles.itemSub, { color: palette.mutedText }]}>{habit.subtitle}</Text>
                      <Text style={[styles.tapHint, { color: palette.mutedText }]}>Tap to complete, hold to edit</Text>
                    </View>
                    <View
                      style={[
                        styles.itemBadge,
                        {
                          borderColor: isCompletedForSelectedDay ? successColor : palette.border,
                          backgroundColor: 'transparent',
                        },
                      ]}>
                      <AnimatedCompleteBadge completed={isCompletedForSelectedDay} tintColor={successColor} />
                    </View>
                  </View>

                  <View style={styles.dotRow}>
                    {habit.weeklyProgress.map((isDone, index) => (
                      <AnimatedProgressDot
                        key={`${habit.id}-dot-${index}`}
                        filled={isDone}
                        color={isDone ? palette.accent : 'rgba(255,255,255,0.1)'}
                      />
                    ))}
                  </View>

                  <View style={styles.statusRow}>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <SymbolView name={resolveSymbolName(status.icon)} size={13} tintColor={palette.accent} />
                    <Text style={[styles.statusLabel, { color: palette.accent }]}>{status.label}</Text>
                    </View>
                    {isProtected ? (
                      <View
                        style={[
                          styles.protectedStatusTag,
                          { backgroundColor: `${palette.success}22`, borderColor: `${palette.success}77` },
                        ]}>
                        <Text style={[styles.protectedStatusTagText, { color: palette.success }]}>PROTECTED</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            </View>
          );
        })}

        <DashedAction
          label="Create New Habit"
          palette={palette}
          icon={
            <SymbolView
              name={resolveSymbolName({ ios: 'plus', android: 'add', web: 'add' })}
              size={20}
              tintColor={palette.mutedText}
            />
          }
          style={styles.dashed}
          onPress={openHabitModal}
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
  heroCard: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 18,
    marginBottom: 20,
  },
  streakPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 10,
  },
  streakText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  heroProgress: {
    height: 10,
  },
  dayContext: {
    marginTop: 2,
    marginBottom: 10,
    paddingHorizontal: 6,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  itemCard: {
    marginBottom: 10,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    ...(Platform.OS === 'ios'
      ? {
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }
      : {
          elevation: 0,
        }),
  },
  nextHabitCard: {
    borderWidth: 1.2,
  },
  nextTag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  nextTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  protectedStatusTag: {
    marginLeft: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  protectedStatusTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCopy: {
    flex: 1,
    marginHorizontal: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemSub: {
    marginTop: 2,
    fontSize: 13,
  },
  tapHint: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  itemBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 8,
  },
  dot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  dashed: {
    marginTop: 8,
    borderRadius: 26,
  },
});
