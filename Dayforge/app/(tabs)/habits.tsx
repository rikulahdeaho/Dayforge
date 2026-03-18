/**
 * Habits Screen - Recurring Habit Tracker & Completion Log
 *
 * Overview:
 * - Dedicated interface for tracking recurring daily habits
 * - Shows habit completion status for today and weekly mini calendar
 * - Displays weekly progress visualization (7-day dot indicator)
 *
 * Content:
 * 1. Header with "Today's Habits" title and profile icon
 * 2. Purple gradient hero card showing:
 *    - Streak badge ("STREAK ACTIVE")
 *    - Completion count (e.g., "3/4 completed today")
 *    - Progress bar (visual representation of habit completion ratio)
 *    - Motivational message
 * 3. Weekly mini calendar with 7 day circles (tap to select day context)
 * 4. Habit cards for each habit:
 *    - Icon + title + subtitle
 *    - Right-side action button (+ if incomplete, ✓ if complete)
 *    - 7-dot weekly progress indicator
 *    - Status label (e.g., "PERFECT WEEK", "5/7 DAYS", "ON TRACK")
 * 5. "Create New Habit" dashed button
 *
 * Interactions:
 * - Tap day circle in calendar → select day (updates context for weekly tracking)
 * - Tap habit card action button (+ or ✓) → toggle habit complete/incomplete for today
 * - Habit completion updates progress bar and completion count in real-time
 * - Tap "Create New Habit" → append new demo habit ("New Habit", "Daily routine", "Getting started")
 * - Session-only state: habit status resets on app reload to demo defaults
 */

import { SymbolView } from 'expo-symbols';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { DateHeader } from '@/components/dayforge/DateHeader';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import { DayforgePalette, DashedAction, ProgressTrack } from '@/components/dayforge/Primitives';
import { WeekdayPicker } from '@/components/dayforge/WeekdayPicker';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';
import { getCurrentMondayBasedDayIndex, getDateKeyForMondayBasedDayIndex } from '@/store/appState.helpers';
import { selectCompletedHabitsCount, selectHabitProgress, selectTotalHabitsCount } from '@/store/appState.selectors';
import { useRouter } from 'expo-router';

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

export default function HabitsScreen() {
  const router = useRouter();
  const { removeHabit, state, toggleHabit } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const [selectedHabitDayIndex, setSelectedHabitDayIndex] = useState(getCurrentMondayBasedDayIndex);
  const longPressHabitIdRef = useRef<string | null>(null);
  const successColor = palette.success;
  const headerDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const completedCount = selectCompletedHabitsCount(state);
  const totalCount = selectTotalHabitsCount(state);
  const progressValue = selectHabitProgress(state);

  const openHabitModal = () => {
    router.push('/add-habit');
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

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DateHeader palette={palette} dateText={headerDate} title="Today's Habits" />

        <LinearGradient
          colors={[palette.accentStrong, palette.accent, '#7f22ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}>
          <View style={styles.streakPill}>
            <SymbolView
              name={resolveSymbolName({ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' })}
              size={14}
              tintColor="#fff"
            />
            <Text style={styles.streakText}>STREAK ACTIVE</Text>
          </View>
          <Text style={styles.heroTitle}>
            {completedCount}/{totalCount} completed today
          </Text>
          <Text style={styles.heroBody}>Keep the chain alive. Every check-in builds your momentum.</Text>
          <ProgressTrack value={progressValue} palette={palette} style={styles.heroProgress} />
        </LinearGradient>

        <WeekdayPicker
          palette={palette}
          selectedIndex={selectedHabitDayIndex}
          onSelectDay={setSelectedHabitDayIndex}
        />

        {state.habits.map((habit) => {
          const iconName = resolveSymbolName({ ios: habit.icon, android: 'task_alt', web: 'task_alt' });
          const selectedDateKey = getDateKeyForMondayBasedDayIndex(selectedHabitDayIndex);
          const isCompletedForSelectedDay = Boolean(habit.completionByDate[selectedDateKey]);

          return (
            <View key={habit.id}>
              <Pressable
                onPress={() => {
                  if (longPressHabitIdRef.current === habit.id) {
                    return;
                  }
                  toggleHabit(habit.id, selectedHabitDayIndex);
                }}
                onLongPress={() => {
                  longPressHabitIdRef.current = habit.id;
                  confirmDeleteHabit(habit.id, habit.title);
                }}
                onPressOut={() => {
                  if (longPressHabitIdRef.current === habit.id) {
                    longPressHabitIdRef.current = null;
                  }
                }}
                delayLongPress={280}>
                <View style={[styles.itemCard, { backgroundColor: 'rgba(255,255,255,0.035)', borderColor: palette.border }]}>
                  <View style={styles.itemTop}>
                    <View style={[styles.itemIcon, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                      <SymbolView name={iconName} size={48} tintColor={palette.accent} />
                    </View>
                    <View style={styles.itemCopy}>
                      <Text style={[styles.itemTitle, { color: palette.text }]}>{habit.title}</Text>
                      <Text style={[styles.itemSub, { color: palette.mutedText }]}>{habit.subtitle}</Text>
                      <Text style={[styles.tapHint, { color: palette.mutedText }]}>Tap to complete • Hold to delete</Text>
                    </View>
                    <Pressable
                      onPress={() => toggleHabit(habit.id, selectedHabitDayIndex)}
                      style={[
                        styles.itemBadge,
                        {
                          borderColor: isCompletedForSelectedDay ? successColor : palette.border,
                          backgroundColor: 'transparent',
                        },
                      ]}>
                      <AnimatedCompleteBadge completed={isCompletedForSelectedDay} tintColor={successColor} />
                    </Pressable>
                  </View>
                  <View style={styles.dotRow}>
                    {habit.weeklyProgress.map((isDone, index) => (
                      <View
                        key={`${habit.id}-dot-${index}`}
                        style={[
                          styles.dot,
                          {
                            backgroundColor: isDone ? palette.accent : 'rgba(255,255,255,0.08)',
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.statusLabel, { color: palette.accent }]}>{habit.statusLabel}</Text>
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

  itemCard: {
    marginBottom: 10,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
