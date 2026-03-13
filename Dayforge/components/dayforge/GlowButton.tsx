import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

import { DayforgePalette } from './types';

export function GlowButton({
  label,
  palette,
  style,
  textStyle,
  onPress,
}: {
  label: string;
  palette: DayforgePalette;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={[palette.accentStrong, palette.accent, '#9f4dff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.glowButton, { shadowColor: palette.accentStrong }, style]}>
        <Text style={[styles.glowButtonText, { color: '#fff' }, textStyle]}>{label}</Text>
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
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  glowButtonText: {
    fontSize: 20,
    fontFamily: 'SpaceMono',
    lineHeight: 24,
  },
});