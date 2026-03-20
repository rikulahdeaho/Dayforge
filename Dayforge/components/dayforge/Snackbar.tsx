import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DayforgePalette } from './types';

type SnackbarProps = {
  message: string | null;
  visible: boolean;
  onDismiss: () => void;
  palette: DayforgePalette;
  durationMs?: number;
};

export function Snackbar({ message, visible, onDismiss, palette, durationMs = 5000 }: SnackbarProps) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible && Boolean(message));
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (visible && message) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      timeoutRef.current = setTimeout(() => {
        onDismiss();
      }, durationMs);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }

    if (!mounted) {
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -16,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  }, [durationMs, message, mounted, onDismiss, opacity, translateY, visible]);

  if (!mounted || !message) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: palette.cardStrong,
            borderColor: palette.border,
            shadowColor: palette.shadow,
            marginTop: Math.max(12, insets.top + 8),
            opacity,
            transform: [{ translateY }],
          },
        ]}>
        <Pressable style={styles.pressable} onPress={onDismiss}>
          <Text style={[styles.message, { color: palette.text }]}>{message}</Text>
          <Text style={[styles.dismissHint, { color: palette.mutedText }]}>Tap to dismiss</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pressable: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: '700',
  },
  dismissHint: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
});
