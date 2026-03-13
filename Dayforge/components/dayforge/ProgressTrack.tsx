import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { DayforgePalette } from './types';

export function ProgressTrack({
  value,
  palette,
  style,
  tint,
}: {
  value: number;
  palette: DayforgePalette;
  style?: StyleProp<ViewStyle>;
  tint?: string;
}) {
  return (
    <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.14)' }, style]}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${Math.max(0, Math.min(100, value * 100))}%`,
            backgroundColor: tint ?? '#ffffff',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});