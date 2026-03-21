import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text, View } from 'react-native';

import type { DayforgePalette } from './types';
import { Type } from '@/constants/Typography';

type WeeklyChartBar = {
  id: string;
  label: string;
  value: number;
  totalCompleted: number;
};

type WeeklyProgressChartProps = {
  bars: WeeklyChartBar[];
  palette: DayforgePalette;
  todayIndex?: number;
};

export function WeeklyProgressChart({ bars, palette, todayIndex }: WeeklyProgressChartProps) {
  return (
    <View style={styles.weeklyChartWrap}>
      {bars.map((bar, index) => {
        const isToday = typeof todayIndex === 'number' && todayIndex === index;
        return (
        <View key={bar.id} style={styles.weeklyChartColumn}>
          <View
            style={[
              styles.weeklyChartTrack,
              {
                backgroundColor: palette.progressTrack,
                borderColor: isToday ? `${palette.accentSoft}55` : 'transparent',
                shadowColor: isToday ? palette.accent : 'transparent',
                shadowOpacity: isToday ? 0.16 : 0,
              },
            ]}>
            {bar.totalCompleted > 0 ? (
              <LinearGradient
                colors={[`${palette.accentSoft}B8`, `${palette.accent}CC`]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={[
                  styles.weeklyChartFill,
                  {
                    height: `${bar.value}%`,
                    opacity: isToday ? 1 : 0.88,
                  },
                ]}
              />
            ) : null}
          </View>
          <View style={styles.weekdayRow}>
            <Text
              style={[
                styles.weekdayLabel,
                { color: isToday ? palette.text : palette.mutedText, fontWeight: isToday ? '700' : '600' },
              ]}>
              {bar.label}
            </Text>
            {isToday ? <View style={[styles.todayDot, { backgroundColor: palette.accentSoft }]} /> : null}
          </View>
        </View>
      )})}
    </View>
  );
}

const styles = StyleSheet.create({
  weeklyChartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  weeklyChartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  weeklyChartTrack: {
    width: '88%',
    height: 66,
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 0.75,
    ...(Platform.OS === 'ios'
      ? {
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 0 },
        }
      : {
          elevation: 0,
        }),
  },
  weeklyChartFill: {
    width: '100%',
    borderRadius: 10,
    minHeight: 8,
  },
  weekdayRow: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  weekdayLabel: {
    ...Type.meta,
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
});
