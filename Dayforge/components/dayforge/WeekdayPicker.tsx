import { useEffect } from 'react';
import { SymbolView } from './SymbolView';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DayforgePalette, SurfaceCard } from './Primitives';
import { resolveSymbolName } from './resolveSymbolName';
import { feedbackSelection } from './feedback';

interface WeekdayPickerProps {
  palette: DayforgePalette;
  selectedIndex: number;
  onSelectDay: (index: number) => void;
  onCalendarPress?: () => void;
}

const weekdayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeekdayPicker({ palette, selectedIndex, onSelectDay, onCalendarPress }: WeekdayPickerProps) {
  const todayIndex = (new Date().getDay() + 6) % 7;

  useEffect(() => {
    onSelectDay(todayIndex);
  }, [onSelectDay, todayIndex]);

  return (
    <SurfaceCard palette={palette} style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <Text style={[styles.calendarTitle, { color: palette.text }]}>Schedule</Text>
        <Pressable
          testID="calendarIconButton"
          accessibilityLabel="calendarIconButton"
          onPress={onCalendarPress}
          disabled={!onCalendarPress}
          style={[styles.calendarIconButton, { backgroundColor: palette.cardStrong, borderColor: palette.border }]}>
          <SymbolView
            name={resolveSymbolName({ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' })}
            size={18}
            tintColor={palette.text}
          />
        </Pressable>
      </View>
      <View style={styles.weekRow}>
        {weekdayKeys.map((label, index) => {
          const selected = selectedIndex === index;
          const isToday = todayIndex === index;
          const today = new Date();
          const date = new Date(today);
          const mondayBasedTodayIndex = (today.getDay() + 6) % 7;
          date.setDate(today.getDate() - mondayBasedTodayIndex + index);
          const dateNum = date.getDate();
          return (
            <View key={`${label}-${index}`} style={styles.dayColumn}>
              <Pressable
                onPress={() => {
                  feedbackSelection();
                  onSelectDay(index);
                }}
                style={({ pressed }) => [
                  styles.dayCircle,
                  {
                    backgroundColor: selected ? palette.accentStrong : palette.cardStrong,
                    borderColor: selected ? palette.accentSoft : 'transparent',
                    shadowColor: selected ? palette.accentStrong : 'transparent',
                    shadowOpacity: selected ? 0.35 : 0,
                    transform: [{ scale: pressed ? 0.96 : selected ? 1.02 : 1 }],
                  },
                ]}>
                <Text style={[styles.dayLabel, { color: selected ? '#fff' : palette.mutedText }]}>{label}</Text>
                <Text style={[styles.dayDate, { color: selected ? '#fff' : palette.text }]}>{dateNum}</Text>
              </Pressable>
              {isToday ? <View style={[styles.todayDot, { backgroundColor: palette.accentSoft }]} /> : <View style={styles.dotSpacer} />}
            </View>
          );
        })}
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    marginBottom: 16,
    borderRadius: 26,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  calendarHeader: {
    marginBottom: 10,
    marginHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  dayColumn: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  dayDate: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  dotSpacer: {
    width: 5,
    height: 5,
    opacity: 0,
  },
});
