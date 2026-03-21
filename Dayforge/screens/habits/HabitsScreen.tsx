import { SymbolView } from '@/components/dayforge/SymbolView';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { AnimatedCompleteCheck } from '@/components/dayforge/AnimatedCompleteCheck';
import { DateHeader } from '@/components/dayforge/DateHeader';
import { feedbackComplete, feedbackTap } from '@/components/dayforge/feedback';
import { FlowCTA, FlowStatusRow } from '@/components/dayforge/FlowCTA';
import { DayforgePalette, DashedAction, ProgressTrack } from '@/components/dayforge/Primitives';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import { WeekdayPicker } from '@/components/dayforge/WeekdayPicker';
import Colors from '@/constants/Colors';
import { Type } from '@/constants/Typography';
import {
  HABIT_ICON_ID_BY_IOS_NAME,
  resolveHabitStatus,
  resolveHeroBody,
  resolveStreakPillText,
  WEEKDAY_FULL_LABELS,
  WEEKDAY_LABELS,
} from '@/screens/habits/utils';
import { useAppState } from '@/store/appState';
import { getCurrentMondayBasedDayIndex, getDateKeyForMondayBasedDayIndex } from '@/store/appState.helpers';
import { useRouter } from 'expo-router';

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
            colors={['#251a39', '#2d2144', '#392950']}
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
              {Math.max(0, totalCount - completedCount)} left for {WEEKDAY_FULL_LABELS[selectedHabitDayIndex]}
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
                      borderColor: isCompletedForSelectedDay ? `${palette.accentSoft}33` : `${palette.border}AA`,
                      shadowColor: isCompletedForSelectedDay ? palette.accentStrong : palette.shadow,
                    },
                    isNextHabit ? styles.nextHabitCard : null,
                  ]}>
                  {isNextHabit ? (
                    <View style={[styles.nextTag, { backgroundColor: `${palette.accent}12`, borderColor: `${palette.accent}22` }]}>
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
                      <Text style={[styles.tapHint, { color: palette.mutedText }]}>Tap to complete.</Text>
                    </View>
                    <View
                      style={[
                        styles.itemBadge,
                        {
                          borderColor: isCompletedForSelectedDay ? successColor : palette.border,
                          backgroundColor: 'transparent',
                        },
                      ]}>
                      <AnimatedCompleteCheck completed={isCompletedForSelectedDay} tintColor={successColor} />
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
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 24,
    marginBottom: 24,
  },
  streakPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.09)',
    marginBottom: 12,
  },
  streakText: {
    color: '#fff',
    ...Type.metaStrong,
  },
  heroTitle: {
    color: '#fff',
    ...Type.heroTitle,
    marginBottom: 8,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.76)',
    ...Type.body,
    marginBottom: 20,
  },
  heroProgress: {
    height: 12,
  },
  dayContext: {
    marginTop: 0,
    marginBottom: 16,
    paddingHorizontal: 6,
    ...Type.meta,
  },
  itemCard: {
    marginBottom: 12,
    borderRadius: 24,
    borderWidth: 0.75,
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...(Platform.OS === 'ios'
      ? {
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }
      : {
          elevation: 0,
        }),
  },
  nextHabitCard: {
    borderWidth: 0.9,
  },
  nextTag: {
    alignSelf: 'flex-start',
    borderWidth: 0.75,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 12,
  },
  nextTagText: {
    ...Type.metaStrong,
  },
  protectedStatusTag: {
    marginLeft: 6,
    borderWidth: 0.75,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  protectedStatusTagText: {
    ...Type.meta,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    marginHorizontal: 12,
  },
  itemTitle: {
    ...Type.cardTitle,
  },
  itemSub: {
    marginTop: 2,
    ...Type.meta,
  },
  tapHint: {
    marginTop: 8,
    ...Type.meta,
    opacity: 0.72,
  },
  itemBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 0.75,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    flex: 1,
    height: 7,
    borderRadius: 999,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusLabel: {
    ...Type.metaStrong,
    opacity: 0.9,
  },
  dashed: {
    marginTop: 8,
    borderRadius: 26,
  },
});
