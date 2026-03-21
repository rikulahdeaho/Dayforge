import { RefObject } from 'react';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { Fonts } from '@/constants/Typography';
import { scrollFocusedInputIntoView } from '@/components/dayforge/scrollFocusedInputIntoView';

export function WeeklyGoalStep({
  palette,
  scrollRef,
  weeklyGoalTitle,
  setWeeklyGoalTitle,
  weeklyGoalTarget,
  setWeeklyGoalTarget,
  weeklyGoalNameError,
  weeklyTargetError,
  parsedWeeklyGoalTarget,
}: {
  palette: DayforgePalette;
  scrollRef: RefObject<ScrollView | null>;
  weeklyGoalTitle: string;
  setWeeklyGoalTitle: (value: string) => void;
  weeklyGoalTarget: string;
  setWeeklyGoalTarget: (value: string) => void;
  weeklyGoalNameError: string | null;
  weeklyTargetError: string | null;
  parsedWeeklyGoalTarget: number | null;
}) {
  return (
    <SurfaceCard palette={palette} style={styles.card}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>Weekly goal</Text>
      <Text style={[styles.stepContext, { color: palette.mutedText }]}>Set the goal you want to track</Text>

      <Text style={[styles.fieldLabel, { color: palette.text }]}>Goal name</Text>
      <TextInput
        value={weeklyGoalTitle}
        onChangeText={setWeeklyGoalTitle}
        onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
        placeholder="e.g. Apply to jobs"
        maxLength={64}
        placeholderTextColor={palette.mutedText}
        style={[
          styles.input,
          {
            color: palette.text,
            borderColor: weeklyGoalNameError ? 'rgba(255,107,107,0.7)' : palette.border,
          },
        ]}
      />
      {weeklyGoalNameError ? <Text style={[styles.helperText, styles.errorText]}>{weeklyGoalNameError}</Text> : null}

      <Text style={[styles.fieldLabel, { color: palette.text }]}>Target per week</Text>
      <TextInput
        value={weeklyGoalTarget}
        onChangeText={setWeeklyGoalTarget}
        onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
        placeholder="e.g. 5"
        keyboardType="number-pad"
        placeholderTextColor={palette.mutedText}
        style={[
          styles.input,
          {
            color: palette.text,
            borderColor: weeklyTargetError ? 'rgba(255,107,107,0.7)' : palette.border,
          },
        ]}
      />
      {weeklyTargetError ? <Text style={[styles.helperText, styles.errorText]}>{weeklyTargetError}</Text> : null}
      <Text style={[styles.helperText, styles.captionText, { color: palette.mutedText }]}>
        This helps calculate your weekly progress.
      </Text>

      {weeklyGoalTitle.trim().length > 0 && parsedWeeklyGoalTarget !== null ? (
        <Text style={[styles.previewText, { color: palette.text }]}>
          You'll track: {weeklyGoalTitle.trim()} ({parsedWeeklyGoalTarget}/week)
        </Text>
      ) : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: '700',
    fontFamily: Fonts.heading,
    marginBottom: 6,
  },
  stepContext: {
    fontSize: 14,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
    marginBottom: 4,
  },
  helperText: {
    marginBottom: 10,
    fontSize: 12,
  },
  errorText: {
    color: '#FF6B6B',
  },
  captionText: {
    marginTop: -2,
    marginBottom: 2,
  },
  previewText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
  },
});
