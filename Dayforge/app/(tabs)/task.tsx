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
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DEMO_SCHEDULE } from '@/data/mockData';
import {
  DashedAction,
  DayforgePalette,
  GlowButton,
  GradientCard,
  ProgressTrack,
  SectionTitle,
  SurfaceCard,
} from '@/components/dayforge/Primitives';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';
import { PlatformIconName } from '@/types';

function resolveSymbolName(icon: PlatformIconName) {
  return (
    Platform.select({
      ios: icon.ios,
      android: icon.android,
      default: icon.web,
    }) ?? icon.web
  ) as any;
}

export default function TaskScreen() {
  const router = useRouter();
  const palette = Colors.dark as DayforgePalette;
  const { state, addTask, incrementGoalProgress, selectScheduleDay, toggleTask } = useAppState();

  const goalProgress = state.goal.target > 0 ? state.goal.progress / state.goal.target : 0;
  const completedTasks = state.tasks.filter((task) => task.completed).length;
  const remainingTasks = state.tasks.length - completedTasks;
  const isGoalComplete = state.goal.progress >= state.goal.target;

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
        <View style={styles.header}>
          <View>
            <View style={styles.dateRow}>
              <SymbolView
                name={resolveSymbolName({ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' })}
                size={16}
                tintColor={palette.accent}
              />
              <Text style={[styles.dateRange, { color: palette.accent }]}>February 26 - March 3</Text>
            </View>
            <Text style={[styles.title, { color: palette.text }]}>Week 9</Text>
          </View>
          <View style={[styles.bellWrap, { backgroundColor: palette.cardStrong, borderColor: palette.border }]}>
            <SymbolView
              name={resolveSymbolName({ ios: 'bell.fill', android: 'notifications', web: 'notifications' })}
              size={22}
              tintColor={palette.accent}
            />
          </View>
        </View>

        <SurfaceCard palette={palette} style={styles.progressCard}>
          <View style={styles.rowBetween}>
            <Text style={[styles.progressLabel, { color: palette.text }]}>Goals in progress</Text>
            <Text style={[styles.progressValue, { color: palette.mutedText }]}>1 / 1 active</Text>
          </View>
          <ProgressTrack
            value={goalProgress}
            palette={palette}
            tint={palette.accentStrong}
            style={styles.summaryProgress}
          />
        </SurfaceCard>

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Weekly Focus</Text>
          <Text style={[styles.sectionAction, { color: palette.accent }]}>DETAILS</Text>
        </View>
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
            <Pressable
              disabled={isGoalComplete}
              style={[
                styles.whiteButton,
                { opacity: isGoalComplete ? 0.55 : 1 },
              ]}
              onPress={incrementGoalProgress}>
              <Text style={[styles.whiteButtonText, { color: palette.accentStrong }]}>Update progress</Text>
            </Pressable>
          </View>
        </GradientCard>

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Schedule</Text>
          <Text style={[styles.sectionAction, { color: palette.accent }]}>TAP DAY</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scheduleList}>
          {DEMO_SCHEDULE.map((item) => {
            const selected = item.id === state.selectedScheduleDay;

            return (
              <Pressable
                key={item.id}
                onPress={() => selectScheduleDay(item.id)}
                style={[
                  styles.scheduleCard,
                  {
                    backgroundColor: selected ? palette.accentStrong : palette.card,
                    borderColor: selected ? palette.accentSoft : palette.border,
                    shadowColor: selected ? palette.accentStrong : 'transparent',
                  },
                ]}>
                <Text style={[styles.scheduleDay, { color: selected ? '#ffffff' : palette.mutedText }]}>{item.day}</Text>
                <Text style={[styles.scheduleDate, { color: selected ? '#ffffff' : palette.text }]}>{item.date}</Text>
                {selected ? <View style={styles.scheduleDot} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Today's Tasks</Text>
          <Text style={[styles.sectionAction, { color: palette.accent }]}>{remainingTasks} REMAINING</Text>
        </View>
        {state.tasks.map((task) => (
          <Pressable key={task.id} onPress={() => toggleTask(task.id)}>
            <SurfaceCard palette={palette} style={styles.taskCard}>
              <View style={styles.taskRow}>
                <View
                  style={[
                    styles.taskCheck,
                    {
                      borderColor: task.completed ? palette.accent : palette.border,
                      backgroundColor: task.completed ? palette.accent : 'transparent',
                    },
                  ]}>
                  {task.completed ? (
                    <SymbolView
                      name={resolveSymbolName({ ios: 'checkmark', android: 'done', web: 'done' })}
                      size={15}
                      tintColor="#ffffff"
                    />
                  ) : null}
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
    top: -100,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 999,
    padding: 0,
    borderWidth: 0,
    shadowOpacity: 0,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 132,
  },
  header: {
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateRange: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },
  bellWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
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
  },
  whiteButton: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  whiteButtonText: {
    fontSize: 16,
    fontWeight: '700',
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
