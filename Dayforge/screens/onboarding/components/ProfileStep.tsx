import { RefObject } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { Fonts } from '@/constants/Typography';
import { feedbackSelection } from '@/components/dayforge/feedback';
import { scrollFocusedInputIntoView } from '@/components/dayforge/scrollFocusedInputIntoView';

export function ProfileStep({
  palette,
  name,
  setName,
  nameTouched,
  nameError,
  nameInputRef,
  scrollRef,
  personalGoals,
  selectedPersonalGoals,
  maxPersonalGoals,
  checkmark,
  onToggleGoal,
  customPersonalGoalInput,
  setCustomGoalAsChip,
  remindersEnabled,
  setRemindersEnabled,
  reminderTime,
  setReminderTime,
}: {
  palette: DayforgePalette;
  name: string;
  setName: (value: string) => void;
  nameTouched: boolean;
  nameError: string | null;
  nameInputRef: RefObject<TextInput | null>;
  scrollRef: RefObject<ScrollView | null>;
  personalGoals: string[];
  selectedPersonalGoals: string[];
  maxPersonalGoals: number;
  checkmark: string;
  onToggleGoal: (goal: string) => void;
  customPersonalGoalInput: string;
  setCustomGoalAsChip: (text: string) => void;
  remindersEnabled: boolean;
  setRemindersEnabled: (value: boolean) => void;
  reminderTime: string;
  setReminderTime: (value: string) => void;
}) {
  return (
    <SurfaceCard palette={palette} style={styles.card}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>Profile</Text>
      <Text style={[styles.stepContext, { color: palette.mutedText }]}>Let's personalize your daily flow</Text>

      <Text style={[styles.fieldLabel, { color: palette.text }]}>Name</Text>
      <TextInput
        ref={nameInputRef}
        value={name}
        onChangeText={setName}
        onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
        placeholder="e.g. Riku"
        placeholderTextColor={palette.mutedText}
        style={[
          styles.input,
          {
            color: palette.text,
            borderColor: nameError ? 'rgba(255,107,107,0.45)' : palette.border,
          },
        ]}
      />
      <Text style={[styles.helperText, { color: nameError ? '#FF6B6B' : palette.mutedText }]}>
        {nameTouched && nameError ? nameError : 'What should we call you?'}
      </Text>

      <Text style={[styles.fieldLabel, { color: palette.text }]}>Personal goals</Text>
      <Text style={[styles.helperText, { color: palette.mutedText }]}>Pick up to 2</Text>
      <View style={styles.chipWrap}>
        {personalGoals.map((goalOption) => {
          const selected = selectedPersonalGoals.includes(goalOption);
          const atLimit = !selected && selectedPersonalGoals.length >= maxPersonalGoals;

          return (
            <Pressable
              key={goalOption}
              onPress={() => {
                if (atLimit) {
                  return;
                }
                feedbackSelection();
                onToggleGoal(goalOption);
              }}
              style={({ pressed }) => [
                styles.multiChip,
                {
                  borderColor: selected ? palette.accent : palette.border,
                  backgroundColor: selected ? 'rgba(127,34,255,0.24)' : 'transparent',
                  opacity: atLimit ? 0.72 : 1,
                  transform: [{ scale: pressed ? 0.98 : selected ? 1.02 : 1 }],
                },
              ]}>
              <Text style={[styles.multiChipText, { color: selected ? '#fff' : palette.text }]}>
                {selected ? `${checkmark} ` : ''}
                {goalOption}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.inlineInputWrap, { borderColor: palette.border }]}>
        <Text style={[styles.inlineInputIcon, { color: palette.mutedText }]}>+</Text>
        <TextInput
          value={customPersonalGoalInput}
          onChangeText={setCustomGoalAsChip}
          onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
          placeholder="Add your own goal"
          placeholderTextColor={palette.mutedText}
          style={[styles.inlineInput, { color: palette.text }]}
        />
      </View>

      <Text style={[styles.fieldLabel, { color: palette.text }]}>Reminders</Text>
      <View style={[styles.switchRow, { borderColor: palette.border }]}>
        <Text style={[styles.switchLabel, { color: palette.text }]}>Enable reminders</Text>
        <Switch
          value={remindersEnabled}
          onValueChange={setRemindersEnabled}
          trackColor={{ false: palette.border, true: palette.accent }}
          thumbColor="#ffffff"
        />
      </View>
      {remindersEnabled ? (
        <TextInput
          value={reminderTime}
          onChangeText={setReminderTime}
          onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
          placeholder="08:30"
          placeholderTextColor={palette.mutedText}
          style={[styles.input, { color: palette.text, borderColor: palette.border }]}
        />
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
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  multiChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  multiChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inlineInputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inlineInputIcon: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  inlineInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 14,
  },
  switchRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
});
