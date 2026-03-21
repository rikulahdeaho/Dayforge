import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { DayforgePalette } from './types';

type GradientCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  palette: DayforgePalette;
  colors?: [string, string, string];
};

export function GradientCard({ children, palette, style, colors }: GradientCardProps) {
  return (
    <LinearGradient
      colors={colors ?? [palette.accentStrong, palette.accent, '#5c447f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        {
          borderColor: 'rgba(255,255,255,0.08)',
          shadowColor: palette.accentStrong,
        },
        style,
      ]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    ...(Platform.OS === 'ios'
      ? {
          shadowOpacity: 0.14,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
        }
      : {
          elevation: 0,
        }),
  },
});
