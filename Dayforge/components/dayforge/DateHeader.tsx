import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DayforgePalette } from './types';
import { resolveSymbolName } from './resolveSymbolName';

type DateHeaderProps = {
  palette: DayforgePalette;
  dateText: string;
  title: string;
  subtitle?: string;
};

export function DateHeader({ palette, dateText, title, subtitle }: DateHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <View style={styles.dateRow}>
          <SymbolView
            name={resolveSymbolName({ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' })}
            size={16}
            tintColor={palette.accent}
          />
          <Text style={[styles.dateText, { color: palette.accent }]}>{dateText}</Text>
        </View>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: palette.mutedText }]}>{subtitle}</Text> : null}
      </View>
      <Pressable
        onPress={() => {}}
        style={[styles.bellWrap, { backgroundColor: palette.cardStrong, borderColor: palette.border }]}>
        <SymbolView
          name={resolveSymbolName({ ios: 'bell.fill', android: 'notifications', web: 'notifications' })}
          size={22}
          tintColor={palette.accent}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
  },
  bellWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});