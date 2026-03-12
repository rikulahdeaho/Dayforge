import { SymbolView } from 'expo-symbols';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { DashedAction, DayforgePalette, GlowButton, ProgressTrack, SectionTitle, SurfaceCard } from '@/components/dayforge/Primitives';

const items = [
  { id: '1', title: 'Morning Meditation', subtitle: '15 mins', streak: '7 day streak', progress: 1, icon: { ios: 'figure.mind.and.body', android: 'self_improvement', web: 'self_improvement' } },
  { id: '2', title: 'Read 20 Pages', subtitle: 'Nightly', streak: '5/7 days', progress: 0.72, icon: { ios: 'book.fill', android: 'menu_book', web: 'menu_book' } },
  { id: '3', title: 'Drink 2L Water', subtitle: 'All day', streak: 'On track', progress: 0.95, icon: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' } },
  { id: '4', title: 'Workout', subtitle: '30 mins', streak: '4/7 days', progress: 0.57, icon: { ios: 'figure.run', android: 'fitness_center', web: 'fitness_center' } },
];

export default function HabitsScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme] as DayforgePalette;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.date, { color: palette.mutedText }]}>CURATE YOUR ROUTINE</Text>
        <SectionTitle title="Habits" action="Manage" palette={palette} />

        <SurfaceCard palette={palette} style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryTitle, { color: palette.text }]}>6 Active Habits</Text>
            <Text style={[styles.summarySub, { color: palette.accent }]}>4 completed today</Text>
          </View>
          <ProgressTrack value={0.66} palette={palette} tint={palette.accentStrong} style={styles.summaryProgress} />
        </SurfaceCard>

        {items.map((item) => (
          <SurfaceCard key={item.id} palette={palette} style={styles.itemCard}>
            <View style={styles.itemTop}>
              <View style={[styles.itemIcon, { backgroundColor: palette.cardStrong }]}>
                <SymbolView name={item.icon as any} size={22} tintColor={palette.accent} />
              </View>
              <View style={styles.itemCopy}>
                <Text style={[styles.itemTitle, { color: palette.text }]}>{item.title}</Text>
                <Text style={[styles.itemSub, { color: palette.mutedText }]}>
                  {item.subtitle} - {item.streak}
                </Text>
              </View>
              <View style={[styles.itemBadge, { borderColor: palette.accent, backgroundColor: palette.cardStrong }]}>
                <SymbolView name={{ ios: 'checkmark', android: 'done', web: 'done' }} size={16} tintColor={palette.accent} />
              </View>
            </View>
            <ProgressTrack value={item.progress} palette={palette} tint={palette.accent} style={styles.itemProgress} />
          </SurfaceCard>
        ))}

        <DashedAction
          label="Create New Habit"
          palette={palette}
          icon={<SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={20} tintColor={palette.mutedText} />}
          style={styles.dashed}
        />

        <GlowButton label="Add Custom Habit" palette={palette} textStyle={styles.ctaText} />
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
  date: {
    marginTop: 6,
    fontFamily: 'SpaceMono',
    letterSpacing: 1.8,
    fontSize: 14,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  summarySub: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryProgress: {
    height: 9,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCopy: {
    flex: 1,
    marginHorizontal: 10,
  },
  itemTitle: {
    fontSize: 21,
    fontWeight: '700',
  },
  itemSub: {
    marginTop: 2,
    fontSize: 16,
  },
  itemBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemProgress: {
    height: 8,
  },
  dashed: {
    marginVertical: 10,
  },
  ctaText: {
    fontSize: 18,
    lineHeight: 24,
  },
});
