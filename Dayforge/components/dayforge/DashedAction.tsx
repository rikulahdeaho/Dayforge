import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { DayforgePalette } from './types';

export function DashedAction({
  label,
  icon,
  palette,
  style,
  onPress,
}: {
  label: string;
  icon?: ReactNode;
  palette: DayforgePalette;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.dashed,
        {
          borderColor: palette.border,
          backgroundColor: 'rgba(27, 16, 48, 0.35)',
        },
        style,
      ]}>
      <View style={styles.dashedInner}>
        {icon}
        <Text style={[styles.dashedLabel, { color: palette.mutedText }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dashed: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 24,
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dashedLabel: {
    fontSize: 20,
    fontWeight: '600',
  },
});