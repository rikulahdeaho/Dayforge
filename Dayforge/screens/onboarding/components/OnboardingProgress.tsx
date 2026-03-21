import { StyleSheet, Text, View } from 'react-native';

import { DayforgePalette } from '@/components/dayforge/types';

export function OnboardingProgress({
  step,
  palette,
}: {
  step: 1 | 2 | 3 | 4;
  palette: DayforgePalette;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.counter, { color: palette.mutedText }]}>{step} of 4</Text>
      <View style={styles.progressDots}>
        {[1, 2, 3, 4].map((index) => {
          const active = step >= index;
          return (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: active ? 'rgba(141,99,219,0.78)' : 'rgba(255,255,255,0.03)',
                  borderColor: active ? 'rgba(141,99,219,0.38)' : palette.border,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    marginBottom: 18,
  },
  counter: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  progressDot: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
});
