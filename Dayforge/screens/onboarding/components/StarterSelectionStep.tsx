import { Pressable, StyleSheet, Text, View } from 'react-native';

import { feedbackSelection } from '@/components/dayforge/feedback';
import { SurfaceCard } from '@/components/dayforge/Primitives';
import { DayforgePalette } from '@/components/dayforge/types';
import { Fonts } from '@/constants/Typography';

type SelectionGroupProps = {
  title: string;
  subtitle?: string;
  options: string[];
  selectedItems: string[];
  maxSelections: number;
  palette: DayforgePalette;
  onToggle: (value: string) => void;
};

function SelectionGroup({
  title,
  subtitle,
  options,
  selectedItems,
  maxSelections,
  palette,
  onToggle,
}: SelectionGroupProps) {
  return (
    <SurfaceCard palette={palette} style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <Text style={[styles.groupTitle, { color: palette.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.groupSubtitle, { color: palette.mutedText }]}>{subtitle}</Text> : null}
      </View>

      <View style={styles.optionStack}>
        {options.map((option) => {
          const selected = selectedItems.includes(option);
          const atLimit = !selected && selectedItems.length >= maxSelections;

          return (
            <Pressable
              key={option}
              onPress={() => {
                if (atLimit) {
                  return;
                }
                feedbackSelection();
                onToggle(option);
              }}
              style={({ pressed }) => [
                styles.selectionRow,
                {
                  borderColor: selected ? 'rgba(141,99,219,0.22)' : palette.border,
                  backgroundColor: selected ? 'rgba(141,99,219,0.22)' : 'rgba(255,255,255,0.025)',
                  opacity: atLimit ? 0.55 : 1,
                  transform: [{ scale: pressed ? 0.987 : 1 }],
                },
              ]}>
              <Text style={[styles.selectionLabel, { color: palette.text }]}>{option}</Text>
              <View
                style={[
                  styles.checkWrap,
                  {
                    borderColor: selected ? 'rgba(194,170,243,0.4)' : palette.border,
                    backgroundColor: selected ? 'rgba(194,170,243,0.15)' : 'transparent',
                  },
                ]}>
                {selected ? <Text style={styles.checkText}>✓</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </SurfaceCard>
  );
}

export function StarterSelectionStep({
  palette,
  starterTaskOptions,
  starterHabitOptions,
  selectedStarterTasks,
  selectedStarterHabits,
  maxStarterTasks,
  maxStarterHabits,
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
  onToggleTask: (value: string) => void;
  onToggleHabit: (value: string) => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headerBlock}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Choose your first small wins</Text>
        <Text style={[styles.stepContext, { color: palette.mutedText }]}>Start small. Build momentum.</Text>
      </View>

      <SelectionGroup
        title="Today’s starter task"
        subtitle="Choose up to two."
        options={starterTaskOptions}
        selectedItems={selectedStarterTasks}
        maxSelections={maxStarterTasks}
        palette={palette}
        onToggle={onToggleTask}
      />

      <SelectionGroup
        title="Starter habits"
        subtitle="Choose up to two."
        options={starterHabitOptions}
        selectedItems={selectedStarterHabits}
        maxSelections={maxStarterHabits}
        palette={palette}
        onToggle={onToggleHabit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 18,
  },
  headerBlock: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    fontFamily: Fonts.heading,
  },
  stepContext: {
    fontSize: 16,
    lineHeight: 24,
  },
  groupCard: {
    gap: 18,
  },
  groupHeader: {
    gap: 6,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  groupSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  optionStack: {
    gap: 10,
  },
  selectionRow: {
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectionLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#F3EEFC',
    fontSize: 12,
    fontWeight: '800',
  },
});
