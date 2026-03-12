import { SymbolView } from 'expo-symbols';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import {
  DashedAction,
  DayforgePalette,
  GlowButton,
  GradientCard,
  ProgressTrack,
  SectionTitle,
  SurfaceCard,
} from '@/components/dayforge/Primitives';

const schedule = [
  { day: 'MON', date: '26' },
  { day: 'TUE', date: '27', selected: true },
  { day: 'WED', date: '28' },
  { day: 'THU', date: '29' },
  { day: 'FRI', date: '01' },
  { day: 'SAT', date: '02' },
];

const tasks = [
  { id: '1', label: 'Morning meditation (15 mins)', done: false },
  { id: '2', label: 'Drink 2L of water', done: true },
  { id: '3', label: 'Finalize portfolio case study', done: false },
];

type PlatformIconName = {
  ios: string;
  android: string;
  web: string;
};

function resolveSymbolName(icon: PlatformIconName) {
  return (
    Platform.select({
      ios: icon.ios,
      android: icon.android,
      default: icon.web,
    }) ?? icon.web
  );
}

export default function PlanScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme] as DayforgePalette;

  const handleAddTask = () => {
    Alert.alert('Add task', 'Handler toimii. Tallennusta ei ole vielä käytössä.');
  };

  const handleStartJournaling = () => {
    Alert.alert('Start Journaling', 'Handler toimii. Tallennusta ei ole vielä käytössä.');
  };

  const handleUpdateProgress = () => {
    Alert.alert('Update progress', 'Handler toimii. Tallennusta ei ole vielä käytössä.');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <SectionTitle title="Week 9" palette={palette} />
            <Text style={[styles.dateRange, { color: palette.mutedText }]}>February 26 - March 3</Text>
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
            <Text style={[styles.progressValue, { color: palette.mutedText }]}>3 / 5 completed</Text>
          </View>
          <ProgressTrack value={0.6} palette={palette} tint={palette.accentStrong} style={styles.summaryProgress} />
        </SurfaceCard>

        <SectionTitle title="Weekly Focus" action="..." palette={palette} />
        <GradientCard palette={palette} style={styles.focusCard}>
          <View style={styles.focusTop}>
            <View style={styles.objectiveTag}>
              <Text style={styles.objectiveTagText}>CURRENT OBJECTIVE</Text>
            </View>
          </View>
          <Text style={styles.focusGoal}>Apply to 3 jobs</Text>
          <View style={styles.rowBetween}>
            <ProgressTrack value={0.33} palette={palette} style={styles.focusProgress} />
            <Text style={styles.focusValue}>1 / 3</Text>
          </View>
          <View style={styles.ctaWrap}>
            <Pressable style={styles.whiteButton} onPress={handleUpdateProgress}>
              <Text style={[styles.whiteButtonText, { color: palette.accentStrong }]}>Update progress</Text>
            </Pressable>
          </View>
        </GradientCard>

        <SectionTitle title="Schedule" action="Full View" palette={palette} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scheduleList}>
          {schedule.map((item) => (
            <View
              key={`${item.day}-${item.date}`}
              style={[
                styles.scheduleCard,
                {
                  backgroundColor: item.selected ? palette.accentStrong : palette.card,
                  borderColor: item.selected ? palette.accentSoft : palette.border,
                  shadowColor: item.selected ? palette.accentStrong : 'transparent',
                },
              ]}>
              <Text
                style={[
                  styles.scheduleDay,
                  { color: item.selected ? '#ffffff' : palette.mutedText },
                ]}>
                {item.day}
              </Text>
              <Text
                style={[
                  styles.scheduleDate,
                  { color: item.selected ? '#ffffff' : palette.text },
                ]}>
                {item.date}
              </Text>
              {item.selected ? <View style={styles.scheduleDot} /> : null}
            </View>
          ))}
        </ScrollView>

        <SectionTitle title="Today's Tasks" action="4 remaining" palette={palette} />
        {tasks.map((task) => (
          <SurfaceCard key={task.id} palette={palette} style={styles.taskCard}>
            <View style={styles.taskRow}>
              <View
                style={[
                  styles.taskCheck,
                  {
                    borderColor: task.done ? palette.accent : palette.border,
                    backgroundColor: task.done ? palette.accent : 'transparent',
                  },
                ]}>
                {task.done ? (
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
                    color: task.done ? palette.mutedText : palette.text,
                    textDecorationLine: task.done ? 'line-through' : 'none',
                  },
                ]}>
                {task.label}
              </Text>
            </View>
          </SurfaceCard>
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
          onPress={handleAddTask}
        />

        <SurfaceCard palette={palette} style={styles.reflectionCard}>
          <View style={styles.reflectionBadge}>
            <SymbolView
              name={resolveSymbolName({ ios: 'brain.head.profile', android: 'psychology', web: 'psychology' })}
              size={18}
              tintColor="#fff"
            />
          </View>
          <Text style={[styles.reflectionTitle, { color: palette.text }]}>Daily Reflection</Text>
          <Text style={[styles.reflectionBody, { color: palette.mutedText }]}>Take a moment for yourself. How are you feeling today?</Text>
          <GlowButton
            label="Start Journaling"
            palette={palette}
            style={styles.reflectButton}
            textStyle={styles.reflectButtonText}
            onPress={handleStartJournaling}
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
  content: {
    paddingHorizontal: 18,
    paddingBottom: 132,
  },
  header: {
    marginTop: 4,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateRange: {
    marginTop: -8,
    fontSize: 20,
  },
  bellWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  progressCard: {
    marginBottom: 20,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 22,
    fontWeight: '700',
  },
  progressValue: {
    fontSize: 18,
  },
  summaryProgress: {
    marginTop: 14,
    height: 8,
  },
  focusCard: {
    marginBottom: 20,
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
    fontFamily: 'SpaceMono',
    fontSize: 32,
    lineHeight: 36,
    marginBottom: 12,
  },
  focusProgress: {
    flex: 1,
    marginRight: 12,
    height: 9,
  },
  focusValue: {
    color: '#fff',
    fontFamily: 'SpaceMono',
    fontSize: 18,
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
    fontSize: 20,
    fontWeight: '700',
  },
  scheduleList: {
    paddingBottom: 12,
    gap: 10,
  },
  scheduleCard: {
    width: 68,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 12,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  scheduleDay: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
  },
  scheduleDate: {
    marginTop: 4,
    fontFamily: 'SpaceMono',
    fontSize: 28,
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
    borderRadius: 22,
    paddingVertical: 14,
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
    fontSize: 22,
  },
  addTask: {
    marginTop: 2,
    marginBottom: 20,
  },
  reflectionCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 18,
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
    fontFamily: 'SpaceMono',
    fontSize: 30,
    lineHeight: 34,
    marginBottom: 8,
  },
  reflectionBody: {
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 27,
    marginBottom: 16,
  },
  reflectButton: {
    width: '80%',
    paddingVertical: 13,
  },
  reflectButtonText: {
    fontSize: 20,
    lineHeight: 24,
  },
});
