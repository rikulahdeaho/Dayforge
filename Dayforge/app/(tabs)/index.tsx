/**
 * Today Screen - Daily Dashboard & Summary
 *
 * Overview:
 * - Displays a real-time summary of today's progress
 * - Shows habit completion status, task count, and weekly goal progress
 * - Serves as the main entry point to other screens
 *
 * Content:
 * 1. Hero card with streak badge and habit completion count
 * 2. Quick grid showing habits completed, remaining tasks, weekly goal, and reflection reminder
 * 3. Task preview list (first 3 tasks from today's list)
 * 4. Reflection CTA card with button to start journaling
 * 5. Profile icon in header (links to Profile screen)
 *
 * Interactions:
 * - Tap profile icon → navigate to Profile screen
 * - Tap habit card → navigate to Habits screen
 * - Tap task card → navigate to Plan screen
 * - Tap weekly goal card → navigate to Plan screen
 * - Tap reflection CTA → navigate to Reflect screen
 * - All data updates live from in-memory state (no persistence)
 */

import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { DayforgePalette, GlowButton, GradientCard, ProgressTrack, SectionTitle, SurfaceCard } from '@/components/dayforge/Primitives';
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

export default function TodayScreen() {
  const router = useRouter();
  const palette = Colors.dark as DayforgePalette;
  const { state } = useAppState();

  const completedHabits = state.habits.filter((habit) => habit.completedToday).length;
  const totalHabits = state.habits.length;
  const habitProgress = totalHabits ? completedHabits / totalHabits : 0;
  const remainingTasks = state.tasks.filter((task) => !task.completed).length;
  const todayDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const motivationalCopy =
    remainingTasks === 0
      ? 'You completed everything today. Keep this momentum going.'
      : `Almost there! ${Math.max(0, totalHabits - completedHabits)} more habits to hit your goal.`;

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
            <View style={styles.kickerRow}>
              <SymbolView
                name={resolveSymbolName({ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' })}
                size={16}
                tintColor={palette.accent}
              />
              <Text style={[styles.kicker, { color: palette.accent }]}>{todayDate}</Text>
            </View>
            <Text style={[styles.title, { color: palette.text }]}>Today</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={[styles.avatar, { backgroundColor: palette.cardStrong, borderColor: palette.border }]}>
            <SymbolView
              name={resolveSymbolName({ ios: 'person.fill', android: 'person', web: 'person' })}
              size={26}
              tintColor={palette.text}
            />
          </Pressable>
        </View>

        <GradientCard palette={palette} style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.streakPill}>
              <SymbolView
                name={resolveSymbolName({ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' })}
                size={14}
                tintColor="#ffffff"
              />
              <Text style={styles.streakText}>{completedHabits + 3} DAY STREAK</Text>
            </View>
            <Text style={styles.heroSubtle}>Session Progress</Text>
          </View>
          <Text style={styles.heroTitle}>
            {completedHabits}/{totalHabits} habits done
          </Text>
          <Text style={styles.heroBody}>{motivationalCopy}</Text>
          <ProgressTrack value={habitProgress} palette={palette} style={styles.heroProgress} />
        </GradientCard>

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Task Preview</Text>
          <Text style={[styles.sectionAction, { color: palette.accent }]}>OPEN</Text>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/plan')}>
          <SurfaceCard palette={palette} style={styles.previewCard}>
            {state.tasks.slice(0, 3).map((task) => (
              <View key={task.id} style={styles.previewRow}>
                <View
                  style={[
                    styles.previewDot,
                    {
                      backgroundColor: task.completed ? palette.accent : 'transparent',
                      borderColor: task.completed ? palette.accent : palette.border,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.previewText,
                    {
                      color: task.completed ? palette.mutedText : palette.text,
                      textDecorationLine: task.completed ? 'line-through' : 'none',
                    },
                  ]}>
                  {task.title}
                </Text>
              </View>
            ))}
          </SurfaceCard>
        </Pressable>

        <SurfaceCard palette={palette} style={styles.reflectionCtaCard}>
          <View style={[styles.reflectionBadge, { backgroundColor: palette.accentStrong }]}> 
            <SymbolView
              name={resolveSymbolName({ ios: 'book.pages.fill', android: 'menu_book', web: 'menu_book' })}
              size={20}
              tintColor="#fff"
            />
          </View>
          <Text style={[styles.reflectionTitle, { color: palette.text }]}>Daily Reflection</Text>
          <Text style={[styles.reflectionBody, { color: palette.mutedText }]}>Take two minutes to capture what went well today.</Text>
          <GlowButton
            label="Start Journaling"
            palette={palette}
            style={styles.reflectButton}
            textStyle={styles.reflectButtonText}
            onPress={() => router.push('/(tabs)/reflect')}
          />
        </SurfaceCard>
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
    right: -90,
    width: 290,
    height: 290,
    borderRadius: 999,
  },
  bottomGlow: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: 120,
    height: 240,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 128,
  },
  header: {
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kickerRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kicker: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  heroCard: {
    borderRadius: 30,
    paddingVertical: 20,
    marginBottom: 24,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  streakPill: {
    height: 42,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakText: {
    color: '#ffffff',
    fontSize: 12,
    letterSpacing: 0.6,
    fontWeight: '700',
  },
  heroSubtle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 13,
    fontWeight: '500',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  heroProgress: {
    height: 12,
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
  quickGrid: {
    marginBottom: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCell: {
    width: '48.4%',
  },
  quickCard: {
    minHeight: 104,
  },
  quickLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  quickValue: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    lineHeight: 24,
  },
  previewCard: {
    marginBottom: 22,
    borderRadius: 26,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 10,
  },
  previewText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  reflectionCtaCard: {
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
    marginBottom: 16,
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

