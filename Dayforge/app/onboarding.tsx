import { Redirect, useRouter } from 'expo-router';
import { type Dispatch, type SetStateAction, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { scrollFocusedInputIntoView } from '@/components/dayforge/scrollFocusedInputIntoView';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';

type Step = 0 | 1 | 2;

function splitItems(raw: string) {
  return raw
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const personalGoalOptions = ['Get healthier', 'Build better routines', 'Improve focus', 'Reduce stress'];
const starterTaskOptions = [
  'Plan tomorrow in 10 minutes',
  'Review top 3 priorities',
  'Clear inbox to zero',
  'Take a 20-minute focus sprint',
];
const starterHabitOptions = ['Drink water', 'Read 10 pages', '10-minute walk', 'Evening reflection'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding, isHydrated, skipOnboarding, state } = useAppState();

  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState('');
  const [selectedPersonalGoals, setSelectedPersonalGoals] = useState<string[]>([]);
  const [customPersonalGoal, setCustomPersonalGoal] = useState('');
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:30');
  const [darkMode, setDarkMode] = useState(state.preferences.darkMode);
  const [weeklyGoalTitle, setWeeklyGoalTitle] = useState('');
  const [weeklyGoalTarget, setWeeklyGoalTarget] = useState('');
  const [selectedStarterTasks, setSelectedStarterTasks] = useState<string[]>([]);
  const [selectedStarterHabits, setSelectedStarterHabits] = useState<string[]>([]);
  const [customStarterTasks, setCustomStarterTasks] = useState('');
  const [customStarterHabits, setCustomStarterHabits] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const palette = (darkMode ? Colors.dark : Colors.light) as DayforgePalette;

  const canContinue = useMemo(() => {
    if (step === 0) {
      return name.trim().length > 0;
    }
    if (step === 1) {
      return weeklyGoalTitle.trim().length > 0;
    }
    return true;
  }, [name, step, weeklyGoalTitle]);

  const toggleMultiSelectItem = (item: string, setter: Dispatch<SetStateAction<string[]>>) => {
    setter((prev) => (prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]));
  };

  const goNext = () => {
    setStep((prev) => (prev < 2 ? ((prev + 1) as Step) : prev));
  };

  const goBack = () => {
    setStep((prev) => (prev > 0 ? ((prev - 1) as Step) : prev));
  };

  const finish = () => {
    const combinedPersonalGoals = [
      ...selectedPersonalGoals,
      ...splitItems(customPersonalGoal),
    ]
      .filter(Boolean)
      .join(', ');
    const reminders = remindersEnabled
      ? `Reminders enabled (${reminderTime.trim() || '08:30'})`
      : 'Reminders disabled';

    const tasks = [...selectedStarterTasks, ...splitItems(customStarterTasks)];
    const habits = [...selectedStarterHabits, ...splitItems(customStarterHabits)];

    completeOnboarding({
      name,
      personalGoals: combinedPersonalGoals,
      reminders,
      darkMode,
      weeklyGoalTitle,
      weeklyGoalTarget: Number(weeklyGoalTarget),
      tasks,
      habits,
    });
    router.replace('/(tabs)');
  };

  const skipAll = () => {
    skipOnboarding();
    router.replace('/(tabs)');
  };

  if (isHydrated && state.hasCompletedOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safe}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: palette.text }]}>Welcome to Dayforge</Text>
            <Text style={[styles.subtitle, { color: palette.mutedText }]}>Step {step + 1} of 3</Text>
          </View>
          <Pressable style={[styles.skipButton, { borderColor: palette.border }]} onPress={skipAll}>
            <Text style={[styles.skipText, { color: palette.mutedText }]}>Skip all</Text>
          </Pressable>
        </View>

        {step === 0 ? (
          <SurfaceCard palette={palette} style={styles.card}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Profile</Text>
            <Text style={[styles.fieldLabel, { color: palette.text }]}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
              placeholder="What should we call you?"
              placeholderTextColor={palette.mutedText}
              style={[styles.input, { color: palette.text, borderColor: palette.border }]}
            />

            <Text style={[styles.fieldLabel, { color: palette.text }]}>Personal goals</Text>
            <View style={styles.chipWrap}>
              {personalGoalOptions.map((goalOption) => {
                const selected = selectedPersonalGoals.includes(goalOption);
                return (
                  <Pressable
                    key={goalOption}
                    onPress={() => toggleMultiSelectItem(goalOption, setSelectedPersonalGoals)}
                    style={[
                      styles.multiChip,
                      {
                        borderColor: selected ? palette.accent : palette.border,
                        backgroundColor: selected ? 'rgba(127,34,255,0.18)' : 'transparent',
                      },
                    ]}>
                    <Text style={[styles.multiChipText, { color: selected ? '#fff' : palette.text }]}>{goalOption}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={customPersonalGoal}
              onChangeText={setCustomPersonalGoal}
              onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
              placeholder="Or add your own goal"
              placeholderTextColor={palette.mutedText}
              style={[styles.input, { color: palette.text, borderColor: palette.border }]}
            />

            <Text style={[styles.fieldLabel, { color: palette.text }]}>Reminders</Text>
            <Pressable
              onPress={() => setRemindersEnabled((prev) => !prev)}
              style={[styles.checkboxRow, { borderColor: palette.border }]}>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: remindersEnabled ? palette.accent : palette.border,
                    backgroundColor: remindersEnabled ? palette.accent : 'transparent',
                  },
                ]}>
                {remindersEnabled ? <Text style={styles.checkboxCheck}>✓</Text> : null}
              </View>
              <Text style={[styles.checkboxLabel, { color: palette.text }]}>Enable reminder time (dummy for now)</Text>
            </Pressable>
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
        ) : null}

        {step === 1 ? (
          <SurfaceCard palette={palette} style={styles.card}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Preferences</Text>
            <View style={[styles.switchRow, { borderColor: palette.border }]}>
              <Text style={[styles.switchLabel, { color: palette.text }]}>Dark mode</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: palette.border, true: palette.accent }}
                thumbColor="#ffffff"
              />
            </View>
            <TextInput
              value={weeklyGoalTitle}
              onChangeText={setWeeklyGoalTitle}
              onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
              placeholder="Weekly goal"
              placeholderTextColor={palette.mutedText}
              style={[styles.input, { color: palette.text, borderColor: palette.border }]}
            />
            <TextInput
              value={weeklyGoalTarget}
              onChangeText={setWeeklyGoalTarget}
              onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
              placeholder="Weekly goal target (number)"
              keyboardType="number-pad"
              placeholderTextColor={palette.mutedText}
              style={[styles.input, { color: palette.text, borderColor: palette.border }]}
            />
          </SurfaceCard>
        ) : null}

        {step === 2 ? (
          <SurfaceCard palette={palette} style={styles.card}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Starter items</Text>
            <Text style={[styles.fieldLabel, { color: palette.text }]}>Starter tasks</Text>
            <View style={styles.chipWrap}>
              {starterTaskOptions.map((taskOption) => {
                const selected = selectedStarterTasks.includes(taskOption);
                return (
                  <Pressable
                    key={taskOption}
                    onPress={() => toggleMultiSelectItem(taskOption, setSelectedStarterTasks)}
                    style={[
                      styles.multiChip,
                      {
                        borderColor: selected ? palette.accent : palette.border,
                        backgroundColor: selected ? 'rgba(127,34,255,0.18)' : 'transparent',
                      },
                    ]}>
                    <Text style={[styles.multiChipText, { color: selected ? '#fff' : palette.text }]}>{taskOption}</Text>
                  </Pressable>
                );
              })}
            </View>
{/*             <TextInput
              value={customStarterTasks}
              onChangeText={setCustomStarterTasks}
              multiline
              placeholder="Add your own tasks (comma or new line)"
              placeholderTextColor={palette.mutedText}
              style={[styles.input, styles.multilineInput, { color: palette.text, borderColor: palette.border }]}
            /> */}

            <Text style={[styles.fieldLabel, { color: palette.text }]}>Starter habits</Text>
            <View style={styles.chipWrap}>
              {starterHabitOptions.map((habitOption) => {
                const selected = selectedStarterHabits.includes(habitOption);
                return (
                  <Pressable
                    key={habitOption}
                    onPress={() => toggleMultiSelectItem(habitOption, setSelectedStarterHabits)}
                    style={[
                      styles.multiChip,
                      {
                        borderColor: selected ? palette.accent : palette.border,
                        backgroundColor: selected ? 'rgba(127,34,255,0.18)' : 'transparent',
                      },
                    ]}>
                    <Text style={[styles.multiChipText, { color: selected ? '#fff' : palette.text }]}>{habitOption}</Text>
                  </Pressable>
                );
              })}
            </View>
{/*             <TextInput
              value={customStarterHabits}
              onChangeText={setCustomStarterHabits}
              multiline
              placeholder="Add your own habits (comma or new line)"
              placeholderTextColor={palette.mutedText}
              style={[styles.input, styles.multilineInput, { color: palette.text, borderColor: palette.border }]}
            /> */}
          </SurfaceCard>
        ) : null}

        <View style={styles.actions}>
          {step > 0 ? (
            <Pressable style={[styles.secondaryButton, { borderColor: palette.border }]} onPress={goBack}>
              <Text style={[styles.secondaryButtonText, { color: palette.text }]}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.actionSpacer} />
          )}

          {step < 2 ? (
            <Pressable
              style={[styles.primaryButton, { backgroundColor: palette.accent, opacity: canContinue ? 1 : 0.5 }]}
              onPress={goNext}
              disabled={!canContinue}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.primaryButton, { backgroundColor: palette.accent }]} onPress={finish}>
              <Text style={styles.primaryButtonText}>Finish setup</Text>
            </Pressable>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 72,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '500',
  },
  skipButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
    marginBottom: 10,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
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
  multilineInput: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  switchRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  checkboxRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    marginBottom: 8,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  actionSpacer: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
