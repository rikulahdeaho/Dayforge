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
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayforgePalette, DashedAction, ProgressTrack, SectionTitle, SurfaceCard } from '@/components/dayforge/Primitives';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';
import { PlatformIconName } from '@/types';

const weekdayKeys = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function resolveSymbolName(icon: PlatformIconName) {
  return (
    Platform.select({
      ios: icon.ios,
      android: icon.android,
      default: icon.web,
    }) ?? icon.web
  ) as any;
}

export default function HabitsScreen() {
  const palette = Colors.dark as DayforgePalette;
  const { addHabit, selectHabitDay, state, toggleHabit } = useAppState();

  const completedCount = state.habits.filter((habit) => habit.completedToday).length;
  const totalCount = state.habits.length;
  const progressValue = totalCount ? completedCount / totalCount : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <LinearGradient
          colors={['rgba(127,34,255,0.22)', 'rgba(127,34,255,0.05)', 'transparent']}
          start={{ x: 0.8, y: 0 }}
          end={{ x: 0.2, y: 1 }}
          style={styles.topGlow}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <View style={styles.dateRow}>
              <SymbolView
                name={resolveSymbolName({ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' })}
                size={16}
                tintColor={palette.accent}
              />
              <Text style={[styles.date, { color: palette.accent }]}>Today • Habit Tracker</Text>
            </View>
            <Text style={[styles.title, { color: palette.text }]}>Today's Habits</Text>
          </View>
          <View style={[styles.profileIcon, { backgroundColor: palette.cardStrong, borderColor: palette.border }]}>
            <SymbolView
              name={resolveSymbolName({ ios: 'person.fill', android: 'person', web: 'person' })}
              size={20}
              tintColor={palette.text}
            />
          </View>
        </View>

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

        <SurfaceCard palette={palette} style={styles.calendarCard}>
          <Text style={[styles.calendarTitle, { color: palette.text }]}>Weekly mini calendar</Text>
          <View style={styles.weekRow}>
            {weekdayKeys.map((label, index) => {
              const selected = state.selectedHabitDayIndex === index;
              return (
                <Pressable
                  key={`${label}-${index}`}
                  onPress={() => selectHabitDay(index)}
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: selected ? palette.accentStrong : palette.cardStrong,
                      borderColor: selected ? palette.accentSoft : 'transparent',
                    },
                  ]}>
                  <Text style={[styles.dayText, { color: selected ? '#fff' : palette.mutedText }]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </SurfaceCard>

        {state.habits.map((habit) => {
          const iconName = resolveSymbolName({ ios: habit.icon, android: 'task_alt', web: 'task_alt' });

          return (
            <SurfaceCard key={habit.id} palette={palette} style={styles.itemCard}>
              <View style={styles.itemTop}>
                <View style={[styles.itemIcon, { backgroundColor: palette.cardStrong }]}>
                  <SymbolView name={iconName} size={22} tintColor={palette.accent} />
                </View>
                <View style={styles.itemCopy}>
                  <Text style={[styles.itemTitle, { color: palette.text }]}>{habit.title}</Text>
                  <Text style={[styles.itemSub, { color: palette.mutedText }]}>{habit.subtitle}</Text>
                </View>
                <Pressable
                  onPress={() => toggleHabit(habit.id)}
                  style={[
                    styles.itemBadge,
                    {
                      borderColor: habit.completedToday ? palette.accent : palette.border,
                      backgroundColor: habit.completedToday ? palette.accent : palette.cardStrong,
                    },
                  ]}>
                  <SymbolView
                    name={resolveSymbolName(
                      habit.completedToday
                        ? { ios: 'checkmark', android: 'done', web: 'done' }
                        : { ios: 'plus', android: 'add', web: 'add' }
                    )}
                    size={16}
                    tintColor={habit.completedToday ? '#fff' : palette.mutedText}
                  />
                </Pressable>
              </View>

              <View style={styles.dotRow}>
                {habit.weeklyProgress.map((isDone, index) => (
                  <View
                    key={`${habit.id}-dot-${index}`}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isDone ? palette.accent : palette.cardStrong,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.statusLabel, { color: palette.accent }]}>{habit.statusLabel}</Text>
            </SurfaceCard>
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
          onPress={addHabit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  topGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 999,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 128,
  },
  headerRow: {
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dateRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
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
  calendarCard: {
    marginBottom: 16,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  calendarTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemCard: {
    marginBottom: 12,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
