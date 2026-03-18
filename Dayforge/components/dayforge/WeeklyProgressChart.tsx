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
};

export function WeeklyProgressChart({ bars, palette }: WeeklyProgressChartProps) {
  return (
    <View style={styles.weeklyChartWrap}>
      {bars.map((bar) => (
        <View key={bar.id} style={styles.weeklyChartColumn}>
          <View style={[styles.weeklyChartTrack, { backgroundColor: 'rgba(255,255,255,0.07)' }]}>
            {bar.totalCompleted > 0 ? (
              <View
                style={[
                  styles.weeklyChartFill,
                  {
                    backgroundColor: palette.accent,
                    height: `${bar.value}%`,
                    opacity: 0.84,
                  },
                ]}
              />
            ) : null}
          </View>
          <Text style={[styles.weekdayLabel, { color: palette.mutedText }]}>{bar.label}</Text>
        </View>
      ))}
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
    width: '100%',
    height: 66,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weeklyChartFill: {
    width: '100%',
    borderRadius: 10,
    minHeight: 8,
  },
  weekdayLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600',
  },
});
