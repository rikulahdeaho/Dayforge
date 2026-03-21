import { StyleSheet, View } from 'react-native';

import { DayforgePalette } from '@/components/dayforge/Primitives';

export function OnboardingProgress({
  step,
  palette,
}: {
  step: 0 | 1 | 2 | 3;
  palette: DayforgePalette;
}) {
  return (
    <View style={styles.progressDots}>
      {[1, 2, 3].map((index) => {
        const active = step >= index;
        return (
          <View
            key={index}
            style={[
              styles.progressDot,
              active && styles.progressDotActive,
              {
                backgroundColor: active ? palette.accent : 'transparent',
                borderColor: active ? palette.accent : palette.border,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    width: '100%',
  },
  progressDot: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  progressDotActive: {
    flex: 1.35,
  },
});
