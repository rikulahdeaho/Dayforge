import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { Fonts } from '@/constants/Typography';
import { feedbackSelection } from '@/components/dayforge/feedback';

export function StarterSelectionStep({
  palette,
  starterTaskOptions,
  starterHabitOptions,
  selectedStarterTasks,
  selectedStarterHabits,
  maxStarterTasks,
  maxStarterHabits,
  checkmark,
  onToggleTask,
  onToggleHabit,
}: {
  palette: DayforgePalette;
  starterTaskOptions: string[];
  starterHabitOptions: string[];
  selectedStarterTasks: string[];
  selectedStarterHabits: string[];
  maxStarterTasks: number;
  maxStarterHabits: number;
  checkmark: string;
  onToggleTask: (value: string) => void;
  onToggleHabit: (value: string) => void;
}) {
  return (
    <SurfaceCard palette={palette} style={styles.card}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>Your first day</Text>
      <Text style={[styles.stepContext, { color: palette.mutedText }]}>Start with a few simple wins</Text>

      <Text style={[styles.fieldLabel, { color: palette.text }]}>Starter tasks</Text>
      <Text style={[styles.helperText, { color: palette.mutedText }]}>Pick up to 2 to start</Text>
      <View style={styles.chipWrap}>
        {starterTaskOptions.map((taskOption) => {
          const selected = selectedStarterTasks.includes(taskOption);
          const atLimit = !selected && selectedStarterTasks.length >= maxStarterTasks;

          return (
            <Pressable
              key={taskOption}
              onPress={() => {
                if (atLimit) {
                  return;
                }
                feedbackSelection();
                onToggleTask(taskOption);
              }}
              style={({ pressed }) => [
                styles.multiChip,
                {
                  borderColor: selected ? palette.accent : palette.border,
                  backgroundColor: selected ? 'rgba(127,34,255,0.18)' : 'transparent',
                  opacity: atLimit ? 0.82 : 1,
                  transform: [{ scale: pressed ? 0.98 : selected ? 1.02 : 1 }],
                },
              ]}>
              <Text style={[styles.multiChipText, { color: selected ? '#fff' : palette.text }]}>
                {selected ? `${checkmark} ` : ''}
                {taskOption}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.helperText, styles.selectionCount, { color: palette.mutedText }]}>
        {selectedStarterTasks.length} selected
      </Text>

      <Text style={[styles.fieldLabel, styles.sectionSpacerTop, { color: palette.text }]}>Starter habits</Text>
      <Text style={[styles.helperText, { color: palette.mutedText }]}>Pick up to 2 to start</Text>
      <View style={styles.chipWrap}>
        {starterHabitOptions.map((habitOption) => {
          const selected = selectedStarterHabits.includes(habitOption);
          const atLimit = !selected && selectedStarterHabits.length >= maxStarterHabits;

          return (
            <Pressable
              key={habitOption}
              onPress={() => {
                if (atLimit) {
                  return;
                }
                feedbackSelection();
                onToggleHabit(habitOption);
              }}
              style={({ pressed }) => [
                styles.multiChip,
                {
                  borderColor: selected ? palette.accent : palette.border,
                  backgroundColor: selected ? 'rgba(127,34,255,0.18)' : 'transparent',
                  opacity: atLimit ? 0.82 : 1,
                  transform: [{ scale: pressed ? 0.98 : selected ? 1.02 : 1 }],
                },
              ]}>
              <Text style={[styles.multiChipText, { color: selected ? '#fff' : palette.text }]}>
                {selected ? `${checkmark} ` : ''}
                {habitOption}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.helperText, styles.selectionCount, { color: palette.mutedText }]}>
        {selectedStarterHabits.length} selected
      </Text>
      <Text style={[styles.brandMoment, { color: palette.mutedText }]}>A simple start builds momentum.</Text>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: '700',
    fontFamily: Fonts.heading,
    marginBottom: 6,
  },
  stepContext: {
    fontSize: 14,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 6,
  },
  helperText: {
    marginBottom: 10,
    fontSize: 12,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  multiChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  multiChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectionCount: {
    marginTop: -4,
    fontSize: 11,
    opacity: 0.7,
  },
  sectionSpacerTop: {
    marginTop: 14,
  },
  brandMoment: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.78,
  },
});
