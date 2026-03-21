import { useEffect } from 'react';

import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { resolveSymbolName } from './resolveSymbolName';
import { SymbolView } from './SymbolView';

export function AnimatedCompleteCheck({ completed, tintColor }: { completed: boolean; tintColor: string }) {
  const scale = useSharedValue(completed ? 1 : 0.8);

  useEffect(() => {
    if (completed) {
      scale.value = withSequence(
        withTiming(0.8, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(1.2, { duration: 140, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 120, easing: Easing.inOut(Easing.quad) })
      );
      return;
    }

    scale.value = withTiming(0.8, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [completed, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!completed) {
    return null;
  }

  return (
    <Animated.View style={animatedStyle}>
      <SymbolView
        name={resolveSymbolName({ ios: 'checkmark', android: 'done', web: 'done' })}
        size={15}
        tintColor={tintColor}
      />
    </Animated.View>
  );
}
