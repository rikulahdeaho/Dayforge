import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import type { DayforgePalette } from './types';

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
                backgroundColor: 'rgba(255,255,255,0.07)',
                borderColor: isToday ? `${palette.accentSoft}AA` : 'transparent',
                shadowColor: isToday ? palette.accent : 'transparent',
                shadowOpacity: isToday ? 0.35 : 0,
              },
            ]}>
            {bar.totalCompleted > 0 ? (
              <LinearGradient
                colors={[`${palette.accentSoft}D9`, `${palette.accent}F2`]}
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
    gap: 6,
    marginBottom: 10,
  },
  weeklyChartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  weeklyChartTrack: {
    width: '82%',
    height: 66,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  weeklyChartFill: {
    width: '100%',
    borderRadius: 10,
    minHeight: 8,
  },
  weekdayRow: {
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  weekdayLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
});
