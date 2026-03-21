import { StyleSheet, Text, View } from 'react-native';

import { DayforgePalette } from './types';
import { Fonts } from '@/constants/Typography';

export function SectionTitle({
  title,
  action,
  palette,
}: {
  title: string;
  action?: string;
  palette: DayforgePalette;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text>
      {action ? <Text style={[styles.sectionAction, { color: palette.accent }]}>{action}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 6,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 38,
    fontFamily: Fonts.heading,
    fontWeight: '700',
    lineHeight: 42,
  },
  sectionAction: {
    fontSize: 16,
    fontWeight: '600',
  },
});
