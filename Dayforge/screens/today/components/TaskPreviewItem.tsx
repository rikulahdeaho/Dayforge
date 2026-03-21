import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnimatedCompleteCheck } from '@/components/dayforge/AnimatedCompleteCheck';
import { DayforgePalette } from '@/components/dayforge/Primitives';
import { getDateKeyForMondayBasedDayIndex } from '@/store/appState.helpers';
import { Task } from '@/types';

export function TaskPreviewItem({
  task,
  palette,
  dayIndex,
  onToggle,
  highlight,
}: {
  task: Task;
  palette: DayforgePalette;
  dayIndex: number;
  onToggle: () => void;
  highlight?: boolean;
}) {
  const completedForDay = Boolean(task.completionByDate[getDateKeyForMondayBasedDayIndex(dayIndex)]);

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.row,
        pressed && [styles.rowPressed, { backgroundColor: palette.surfaceMuted }],
        highlight && [styles.rowFocus, { borderColor: `${palette.accentSoft}52`, backgroundColor: palette.surfaceMuted }],
      ]}>
      <View
        style={[
          styles.dot,
          {
            borderColor: completedForDay ? palette.success : palette.border,
          },
        ]}>
        <AnimatedCompleteCheck completed={completedForDay} tintColor={palette.success} />
      </View>
      <Text
        style={[
          styles.text,
          {
            color: completedForDay ? palette.mutedText : palette.text,
            textDecorationLine: completedForDay ? 'line-through' : 'none',
          },
        ]}>
        {task.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    minHeight: 42,
  },
  rowPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  rowFocus: {
    borderWidth: 0.75,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.25,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  text: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
});
