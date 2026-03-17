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
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { DateHeader } from '@/components/dayforge/DateHeader';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import { DayforgePalette, DashedAction, ProgressTrack } from '@/components/dayforge/Primitives';
import { WeekdayPicker } from '@/components/dayforge/WeekdayPicker';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';
import { getCurrentMondayBasedDayIndex } from '@/store/appState.helpers';
import { selectCompletedHabitsCount, selectHabitProgress, selectTotalHabitsCount } from '@/store/appState.selectors';

const habitIconOptions = [
  {
    id: 'figure.mind.and.body',
    label: 'Mind',
    icon: { ios: 'figure.mind.and.body', android: 'self_improvement', web: 'self_improvement' },
  },
  {
    id: 'book.fill',
    label: 'Read',
    icon: { ios: 'book.fill', android: 'menu_book', web: 'menu_book' },
  },
  {
    id: 'drop.fill',
    label: 'Water',
    icon: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  },
  {
    id: 'dumbbell.fill',
    label: 'Workout',
    icon: { ios: 'dumbbell.fill', android: 'fitness_center', web: 'fitness_center' },
  },
  {
    id: 'moon.stars.fill',
    label: 'Sleep',
    icon: { ios: 'moon.stars.fill', android: 'bedtime', web: 'bedtime' },
  },
  {
    id: 'heart.fill',
    label: 'Health',
    icon: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  },
];

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
  const palette = Colors.dark as DayforgePalette;
  const { addHabit, state, toggleHabit } = useAppState();
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitSubtitle, setHabitSubtitle] = useState('');
  const [habitIcon, setHabitIcon] = useState(habitIconOptions[0].id);
  const [selectedHabitDayIndex, setSelectedHabitDayIndex] = useState(getCurrentMondayBasedDayIndex);
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
    setIsHabitModalOpen(true);
  };

  const closeHabitModal = () => {
    setIsHabitModalOpen(false);
    setHabitTitle('');
    setHabitSubtitle('');
    setHabitIcon(habitIconOptions[0].id);
  };

  const submitHabit = () => {
    if (!habitTitle.trim()) {
      return;
    }

    addHabit({ title: habitTitle, subtitle: habitSubtitle, icon: habitIcon });
    closeHabitModal();
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

          return (
            <View key={habit.id}>
              <Pressable onPress={() => toggleHabit(habit.id, selectedHabitDayIndex)}>
                <View style={[styles.itemCard, { backgroundColor: 'rgba(255,255,255,0.035)', borderColor: palette.border }]}>
                  <View style={styles.itemTop}>
                    <View style={[styles.itemIcon, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                      <SymbolView name={iconName} size={48} tintColor={palette.accent} />
                    </View>
                    <View style={styles.itemCopy}>
                      <Text style={[styles.itemTitle, { color: palette.text }]}>{habit.title}</Text>
                      <Text style={[styles.itemSub, { color: palette.mutedText }]}>{habit.subtitle}</Text>
                      <Text style={[styles.tapHint, { color: palette.mutedText }]}>Tap to complete</Text>
                    </View>
                    <Pressable
                      onPress={() => toggleHabit(habit.id, selectedHabitDayIndex)}
                      style={[
                        styles.itemBadge,
                        {
                          borderColor: habit.completedToday ? successColor : palette.border,
                          backgroundColor: 'transparent',
                        },
                      ]}>
                      <AnimatedCompleteBadge completed={habit.completedToday} tintColor={successColor} />
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

        <Modal visible={isHabitModalOpen} transparent animationType="fade" onRequestClose={closeHabitModal}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { backgroundColor: palette.cardStrong, borderColor: palette.border }]}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>Create New Habit</Text>
              <TextInput
                value={habitTitle}
                onChangeText={setHabitTitle}
                placeholder="Habit name"
                placeholderTextColor={palette.mutedText}
                style={[styles.modalInput, { color: palette.text, borderColor: palette.border }]}
                autoFocus
              />
              <TextInput
                value={habitSubtitle}
                onChangeText={setHabitSubtitle}
                placeholder="Subtitle (optional)"
                placeholderTextColor={palette.mutedText}
                style={[styles.modalInput, { color: palette.text, borderColor: palette.border }]}
              />
              <Text style={[styles.iconPickerTitle, { color: palette.mutedText }]}>Select icon</Text>
              <View style={styles.iconGrid}>
                {habitIconOptions.map((option) => {
                  const selected = option.id === habitIcon;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setHabitIcon(option.id)}
                      style={[
                        styles.iconOption,
                        {
                          borderColor: selected ? palette.accent : palette.border,
                          backgroundColor: selected ? 'rgba(76, 175, 255, 0.15)' : 'transparent',
                        },
                      ]}>
                      <SymbolView name={resolveSymbolName(option.icon)} size={18} tintColor={palette.accent} />
                      <Text style={[styles.iconLabel, { color: palette.text }]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.modalActions}>
                <Pressable style={[styles.modalButton, { borderColor: palette.border }]} onPress={closeHabitModal}>
                  <Text style={[styles.modalButtonText, { color: palette.mutedText }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.modalButton,
                    styles.modalButtonPrimary,
                    { opacity: habitTitle.trim() ? 1 : 0.5, backgroundColor: palette.accent },
                  ]}
                  disabled={!habitTitle.trim()}
                  onPress={submitHabit}>
                  <Text style={styles.modalButtonPrimaryText}>Add Habit</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
  },
  iconPickerTitle: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  iconOption: {
    minWidth: 88,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
