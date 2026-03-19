import { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { DayforgePalette } from './types';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  palette: DayforgePalette;
};

export function SurfaceCard({ children, style, palette }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
          shadowColor: palette.shadow,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    ...(Platform.OS === 'ios'
      ? {
          shadowOpacity: 0.22,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
        }
      : {
          elevation: 0,
        }),
  },
});