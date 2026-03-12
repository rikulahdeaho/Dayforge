import { SymbolView } from 'expo-symbols';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { DashedAction, DayforgePalette, GradientCard, ProgressTrack, SectionTitle, SurfaceCard } from '@/components/dayforge/Primitives';

const days = [
  { key: 'S', date: 11 },
  { key: 'M', date: 12, active: true },
  { key: 'T', date: 13 },
  { key: 'W', date: 14 },
  { key: 'T', date: 15 },
  { key: 'F', date: 16 },
  { key: 'S', date: 17 },
];

const habits = [
  {
    id: 'meditation',
    title: 'Morning Meditation',
    subtitle: '15 mins - Morning',
    icon: { ios: 'figure.mind.and.body', android: 'self_improvement', web: 'self_improvement' },
    complete: true,
    status: 'PERFECT WEEK',
    dots: [1, 1, 1, 1, 1, 1, 1],
  },
  {
    id: 'read',
    title: 'Read 20 Pages',
    subtitle: 'Nightly habit',
    icon: { ios: 'book.fill', android: 'menu_book', web: 'menu_book' },
    complete: false,
    status: '5/7 DAYS',
    dots: [1, 1, 1, 0, 1, 1, 0],
  },
  {
    id: 'water',
    title: 'Drink 2L Water',
    subtitle: 'Throughout the day',
    icon: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
    complete: true,
    status: 'ON TRACK',
    dots: [1, 1, 1, 1, 1, 1, 1],
  },
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

export default function TodayScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme] as DayforgePalette;

  const handleCreateNewHabit = () => {
    Alert.alert('Create New Habit', 'Handler toimii. Tallennusta ei ole vielä käytössä.');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.kicker, { color: palette.mutedText }]}>MONDAY, MAY 12</Text>
            <SectionTitle title="Today's Habits" palette={palette} />
          </View>
          <View style={[styles.avatar, { backgroundColor: palette.cardStrong, borderColor: palette.border }]}>
            <SymbolView
              name={resolveSymbolName({ ios: 'person.fill', android: 'person', web: 'person' })}
              size={26}
              tintColor={palette.text}
            />
          </View>
        </View>

        <GradientCard palette={palette} style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.streakPill}>
              <SymbolView
                name={resolveSymbolName({ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' })}
                size={14}
                tintColor="#ffffff"
              />
              <Text style={styles.streakText}>7 DAY STREAK</Text>
            </View>
            <Text style={styles.heroSubtle}>May Progress</Text>
          </View>
          <Text style={styles.heroTitle}>4/6 habits done</Text>
          <Text style={styles.heroBody}>Almost there! Two more to hit your goal.</Text>
          <ProgressTrack value={0.66} palette={palette} style={styles.heroProgress} />
        </GradientCard>

        <View style={styles.dayRow}>
          {days.map((day, index) => (
            <View key={`${day.key}-${day.date}-${index}`} style={styles.dayWrap}>
              <Text style={[styles.dayKey, { color: day.active ? palette.accent : palette.mutedText }]}>{day.key}</Text>
              <View
                style={[
                  styles.dayCircle,
                  {
                    backgroundColor: day.active ? palette.accentStrong : palette.cardStrong,
                    borderColor: day.active ? palette.accentSoft : 'transparent',
                    shadowColor: day.active ? palette.accentStrong : 'transparent',
                  },
                ]}>
                <Text style={[styles.dayDate, { color: palette.text }]}>{day.date}</Text>
              </View>
            </View>
          ))}
        </View>

        <SectionTitle title="Daily Habits" palette={palette} />
        {habits.map((habit) => (
          <SurfaceCard key={habit.id} palette={palette} style={styles.habitCard}>
            <View style={styles.habitTop}>
              <View style={[styles.habitIcon, { backgroundColor: palette.cardStrong }]}>
                <SymbolView name={resolveSymbolName(habit.icon)} size={26} tintColor={palette.accent} />
              </View>
              <View style={styles.habitCopy}>
                <Text style={[styles.habitTitle, { color: palette.text }]}>{habit.title}</Text>
                <Text style={[styles.habitSubtitle, { color: palette.mutedText }]}>{habit.subtitle}</Text>
              </View>
              <LinearGradient
                colors={habit.complete ? [palette.accentStrong, palette.accent] : [palette.cardStrong, palette.cardStrong]}
                style={[
                  styles.habitAction,
                  {
                    borderColor: habit.complete ? palette.accentSoft : palette.border,
                    shadowColor: habit.complete ? palette.accentStrong : 'transparent',
                  },
                ]}>
                <SymbolView
                  name={resolveSymbolName(
                    habit.complete
                      ? { ios: 'checkmark', android: 'done', web: 'done' }
                      : { ios: 'plus', android: 'add', web: 'add' }
                  )}
                  size={20}
                  tintColor={habit.complete ? '#ffffff' : palette.mutedText}
                />
              </LinearGradient>
            </View>

            <View style={[styles.divider, { backgroundColor: palette.border }]} />

            <View style={styles.habitBottom}>
              <View style={styles.dotRow}>
                {habit.dots.map((dot, index) => (
                  <View
                    key={`${habit.id}-${index}`}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: dot ? palette.accent : '#34405d',
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.habitStatus, { color: palette.accent }]}>{habit.status}</Text>
            </View>
          </SurfaceCard>
        ))}

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
          style={styles.addHabit}
          onPress={handleCreateNewHabit}
        />
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
    paddingBottom: 128,
  },
  header: {
    marginTop: 4,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kicker: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    letterSpacing: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  heroCard: {
    paddingVertical: 20,
    marginBottom: 22,
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
    fontSize: 13,
    letterSpacing: 0.6,
    fontWeight: '700',
  },
  heroSubtle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 16,
    fontWeight: '500',
  },
  heroTitle: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 30,
    lineHeight: 34,
    marginBottom: 6,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 17,
    marginBottom: 18,
  },
  heroProgress: {
    height: 12,
  },
  dayRow: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayWrap: {
    alignItems: 'center',
    gap: 8,
  },
  dayKey: {
    fontSize: 18,
    fontFamily: 'SpaceMono',
  },
  dayCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  dayDate: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    lineHeight: 20,
  },
  habitCard: {
    marginBottom: 14,
  },
  habitTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitCopy: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  habitTitle: {
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 2,
  },
  habitSubtitle: {
    fontSize: 18,
  },
  habitAction: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  divider: {
    marginTop: 16,
    marginBottom: 14,
    height: 1,
  },
  habitBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  habitStatus: {
    fontSize: 15,
    fontFamily: 'SpaceMono',
  },
  addHabit: {
    marginTop: 8,
  },
});

