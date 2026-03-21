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
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed, highlight && styles.rowFocus]}>
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
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    minHeight: 42,
  },
  rowPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(127,34,255,0.1)',
    transform: [{ scale: 0.97 }],
  },
  rowFocus: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(127,34,255,0.14)',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  text: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
});
