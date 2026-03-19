import { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
  const clamped = Math.max(0, Math.min(1, value));
  const animatedValue = useSharedValue(clamped);

  useEffect(() => {
    animatedValue.value = withTiming(clamped, {
      duration: 460,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedValue, clamped]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, animatedValue.value * 100))}%`,
  }));

  return (
    <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.14)' }, style]}>
      <Animated.View
        style={[
          styles.progressFill,
          animatedFillStyle,
          {
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
