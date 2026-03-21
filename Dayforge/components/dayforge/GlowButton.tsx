import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

import { DayforgePalette } from './types';

export function GlowButton({
  label,
  palette,
  style,
  textStyle,
  onPress,
  disabled = false,
}: {
  label: string;
  palette: DayforgePalette;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        opacity: disabled ? 0.58 : 1,
      })}>
      <LinearGradient
        colors={[palette.accentStrong, palette.accent, palette.accentSoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.glowButton, { shadowColor: palette.accentStrong }, style]}>
        <Text style={[styles.glowButtonText, { color: palette.onAccent }, textStyle]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  glowButton: {
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  glowButtonText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
