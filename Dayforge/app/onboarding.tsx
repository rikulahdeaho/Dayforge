import { Redirect, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { feedbackSelection, feedbackSuccess, feedbackTap } from '@/components/dayforge/feedback';
import { scrollFocusedInputIntoView } from '@/components/dayforge/scrollFocusedInputIntoView';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';

type Step = 0 | 1 | 2 | 3;

const MAX_PERSONAL_GOALS = 2;
const MAX_STARTER_TASKS = 2;
const MAX_STARTER_HABITS = 2;
const CHECKMARK = '\u2713';

const personalGoalOptions = ['Get healthier', 'Build better routines', 'Improve focus', 'Reduce stress'];
const starterTaskOptions = [
  'Plan tomorrow in 10 minutes',
  'Review top 3 priorities',
  'Clear inbox to zero',
  'Take a 20-minute focus sprint',
];
const starterHabitOptions = ['Drink water', 'Read 10 pages', '10-minute walk', 'Evening reflection'];

function parsePositiveNumber(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.trunc(parsed);
}

function toggleMultiSelectItem(item: string, selected: string[], max: number) {
  if (selected.includes(item)) {
    return selected.filter((value) => value !== item);
  }
  if (selected.length >= max) {
    return selected;
  }
  return [...selected, item];
}

function renderProgressDots(currentStep: Step, palette: DayforgePalette) {
  return (
    <View style={styles.progressDots}>
      {[1, 2, 3].map((index) => {
        const active = currentStep >= index;
        return (
          <View
            key={index}
            style={[
              styles.progressDot,
              active ? styles.progressDotActive : null,
              {
                backgroundColor: active ? palette.accent : 'transparent',
                borderColor: active ? palette.accent : palette.border,
                opacity: active ? 1 : 1,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding, isHydrated, setSuccessMessage, skipOnboarding, state } = useAppState();

  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);

  const [selectedPersonalGoals, setSelectedPersonalGoals] = useState<string[]>([]);
  const [customPersonalGoalInput, setCustomPersonalGoalInput] = useState('');
  const [customPersonalGoalChip, setCustomPersonalGoalChip] = useState('');

  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:30');

  const [darkMode, setDarkMode] = useState(state.preferences.darkMode);
  const [weeklyGoalTitle, setWeeklyGoalTitle] = useState('');
  const [weeklyGoalTarget, setWeeklyGoalTarget] = useState('');

  const [selectedStarterTasks, setSelectedStarterTasks] = useState<string[]>([starterTaskOptions[0]]);
  const [selectedStarterHabits, setSelectedStarterHabits] = useState<string[]>([starterHabitOptions[0]]);

  const [showStep2Errors, setShowStep2Errors] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const nameInputRef = useRef<TextInput>(null);

  const palette = (darkMode ? Colors.dark : Colors.light) as DayforgePalette;

  const trimmedName = name.trim();
  const parsedWeeklyGoalTarget = parsePositiveNumber(weeklyGoalTarget);

  const profileStepValid = trimmedName.length >= 2;
  const preferencesStepValid = weeklyGoalTitle.trim().length > 0 && parsedWeeklyGoalTarget !== null;

  const canContinue = useMemo(() => {
    if (step === 0) {
      return true;
    }
    if (step === 1) {
      return profileStepValid;
    }
    if (step === 2) {
      return preferencesStepValid;
    }
    return true;
  }, [preferencesStepValid, profileStepValid, step]);

  const personalGoals = useMemo(() => {
    const options = [...personalGoalOptions];
    if (customPersonalGoalChip) {
      options.push(customPersonalGoalChip);
    }
    return options;
  }, [customPersonalGoalChip]);

  useEffect(() => {
    if (step === 1) {
      const timeout = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [step]);

  const setCustomGoalAsChip = (text: string) => {
    const trimmed = text.trim();
    const previousChip = customPersonalGoalChip;

    setCustomPersonalGoalInput(text);
    setCustomPersonalGoalChip(trimmed);
    setSelectedPersonalGoals((prev) => {
      const withoutPrevious = previousChip ? prev.filter((goal) => goal !== previousChip) : prev;

      if (!trimmed) {
        return withoutPrevious;
      }

      if (withoutPrevious.includes(trimmed)) {
        return withoutPrevious;
      }

      if (withoutPrevious.length >= MAX_PERSONAL_GOALS) {
        return withoutPrevious;
      }

      return [...withoutPrevious, trimmed];
    });
  };

  const goNext = () => {
    if (step === 1) {
      setNameTouched(true);
      if (!profileStepValid) {
        return;
      }
    }

    if (step === 2) {
      setShowStep2Errors(true);
      if (!preferencesStepValid) {
        return;
      }
    }

    setStep((prev) => (prev < 3 ? ((prev + 1) as Step) : prev));
    feedbackTap();
  };

  const goBack = () => {
    feedbackSelection();
    setStep((prev) => (prev > 0 ? ((prev - 1) as Step) : prev));
  };

  const finish = () => {
    const reminders = remindersEnabled
      ? `Daily reminder at ${reminderTime.trim() || '08:30'}`
      : 'Reminders are off for now.';

    completeOnboarding({
      name: trimmedName,
      personalGoals: selectedPersonalGoals.join(', '),
      reminders,
      darkMode,
      weeklyGoalTitle: weeklyGoalTitle.trim(),
      weeklyGoalTarget: parsedWeeklyGoalTarget ?? 1,
      tasks: selectedStarterTasks,
      habits: selectedStarterHabits,
    });

    setSuccessMessage("You're all set \uD83D\uDE80");
    feedbackSuccess();
    router.replace('/(tabs)');
  };

  const skipAll = () => {
    skipOnboarding();
    router.replace('/(tabs)');
  };
  const confirmSkipSetup = () => {
    Alert.alert(
      'Skip setup?',
      "We'll start you with default habits and tasks you can edit later.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip setup', style: 'destructive', onPress: skipAll },
      ]
    );
  };

  if (isHydrated && state.hasCompletedOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  const nameError =
    nameTouched && trimmedName.length === 0
      ? 'Name is required'
      : nameTouched && trimmedName.length > 0 && trimmedName.length < 2
        ? 'Name should be at least 2 characters'
        : null;

  const weeklyGoalNameError =
    showStep2Errors && weeklyGoalTitle.trim().length === 0 ? 'Goal name is required' : null;
  const weeklyTargetError =
    showStep2Errors && parsedWeeklyGoalTarget === null ? 'Target per week must be a number above 0' : null;

  const headerTitle = 'Dayforge';
  const headerSubtitle = `Step ${step} of 3`;

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safe}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: palette.text }]}>{headerTitle}</Text>
            <Text style={[styles.subtitle, { color: palette.mutedText }]}>{headerSubtitle}</Text>
          </View>

          {renderProgressDots(step, palette)}

          {step === 0 ? (
            <SurfaceCard palette={palette} style={styles.card}>
              <View style={styles.step0Wrap}>
                <View style={[styles.step0Logo, { borderColor: palette.border, backgroundColor: 'rgb(248, 248, 246)' }]}>
                  <Image
                    source={require('../assets/images/DayforgeLogo.png')}
                    style={styles.step0LogoImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.step0Headline, { color: palette.text }]}>
                  Dayforge: Build better days, <Text style={{ color: '#C892FF' }}>one step at a time.</Text>
                </Text>

                <Text style={[styles.fieldLabel, styles.step0AppearanceLabel, { color: palette.text }]}>Appearance</Text>
                <View style={[styles.appearanceWrap, styles.step0AppearanceWrap, { borderColor: palette.border }]}>
                  <Pressable
                    onPress={() => setDarkMode(false)}
                    style={({ pressed }) => [
                      styles.appearanceOption,
                      {
                        borderColor: !darkMode ? palette.accent : 'transparent',
                        backgroundColor: !darkMode ? 'rgba(127,34,255,0.14)' : 'transparent',
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}>
                    <Text style={[styles.appearanceText, { color: !darkMode ? '#fff' : palette.text }]}>Light</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setDarkMode(true)}
                    style={({ pressed }) => [
                      styles.appearanceOption,
                      {
                        borderColor: darkMode ? palette.accent : 'transparent',
                        backgroundColor: darkMode ? 'rgba(127,34,255,0.14)' : 'transparent',
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}>
                    <Text style={[styles.appearanceText, { color: darkMode ? '#fff' : palette.text }]}>Dark</Text>
                  </Pressable>
                </View>
                <Text style={[styles.step0SupportLine, { color: palette.mutedText }]}>
                  No account needed. Data stays on this device.
                </Text>
              </View>
            </SurfaceCard>
          ) : null}

          {step === 1 ? (
            <SurfaceCard palette={palette} style={styles.card}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Profile</Text>
              <Text style={[styles.stepContext, { color: palette.mutedText }]}>Let's personalize your daily flow</Text>

              <Text style={[styles.fieldLabel, { color: palette.text }]}>Name</Text>
              <TextInput
                ref={nameInputRef}
                value={name}
                onChangeText={setName}
                onBlur={() => setNameTouched(true)}
                onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
                onSubmitEditing={goNext}
                returnKeyType="done"
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
                {nameError ?? 'What should we call you?'}
              </Text>

              <Text style={[styles.fieldLabel, { color: palette.text }]}>Personal goals</Text>
              <Text style={[styles.helperText, { color: palette.mutedText }]}>Pick up to 2</Text>
              <View style={styles.chipWrap}>
                {personalGoals.map((goalOption) => {
                  const selected = selectedPersonalGoals.includes(goalOption);
                  const atLimit = !selected && selectedPersonalGoals.length >= MAX_PERSONAL_GOALS;

                  return (
                    <Pressable
                      key={goalOption}
                      onPress={() => {
                        if (atLimit) {
                          return;
                        }
                        feedbackSelection();
                        setSelectedPersonalGoals((prev) =>
                          toggleMultiSelectItem(goalOption, prev, MAX_PERSONAL_GOALS)
                        );
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
                        {selected ? `${CHECKMARK} ` : ''}
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
          ) : null}

          {step === 2 ? (
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
          ) : null}

          {step === 3 ? (
            <SurfaceCard palette={palette} style={styles.card}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Your first day</Text>
              <Text style={[styles.stepContext, { color: palette.mutedText }]}>Start with a few simple wins</Text>

              <Text style={[styles.fieldLabel, { color: palette.text }]}>Starter tasks</Text>
              <Text style={[styles.helperText, { color: palette.mutedText }]}>Pick up to 2 to start</Text>
              <View style={styles.chipWrap}>
                {starterTaskOptions.map((taskOption) => {
                  const selected = selectedStarterTasks.includes(taskOption);
                  const atLimit = !selected && selectedStarterTasks.length >= MAX_STARTER_TASKS;

                  return (
                    <Pressable
                      key={taskOption}
                      onPress={() => {
                        if (atLimit) {
                          return;
                        }
                        feedbackSelection();
                        setSelectedStarterTasks((prev) =>
                          toggleMultiSelectItem(taskOption, prev, MAX_STARTER_TASKS)
                        );
                      }}
                      style={({ pressed }) => [
                        styles.multiChip,
                        {
                          borderColor: selected ? palette.accent : palette.border,
                          backgroundColor: selected ? 'rgba(127,34,255,0.18)' : 'transparent',
                          opacity: atLimit ? 0.82 : 1,
                          transform: [{ scale: pressed ? 0.98 : selected ? 1.02 : 1 }],
                        },
                      ]}>
                      <Text style={[styles.multiChipText, { color: selected ? '#fff' : palette.text }]}>
                        {selected ? `${CHECKMARK} ` : ''}
                        {taskOption}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={[styles.helperText, styles.selectionCount, { color: palette.mutedText }]}>
                {selectedStarterTasks.length} selected
              </Text>

              <Text style={[styles.fieldLabel, styles.sectionSpacerTop, { color: palette.text }]}>Starter habits</Text>
              <Text style={[styles.helperText, { color: palette.mutedText }]}>Pick up to 2 to start</Text>
              <View style={styles.chipWrap}>
                {starterHabitOptions.map((habitOption) => {
                  const selected = selectedStarterHabits.includes(habitOption);
                  const atLimit = !selected && selectedStarterHabits.length >= MAX_STARTER_HABITS;

                  return (
                    <Pressable
                      key={habitOption}
                      onPress={() => {
                        if (atLimit) {
                          return;
                        }
                        feedbackSelection();
                        setSelectedStarterHabits((prev) =>
                          toggleMultiSelectItem(habitOption, prev, MAX_STARTER_HABITS)
                        );
                      }}
                      style={({ pressed }) => [
                        styles.multiChip,
                        {
                          borderColor: selected ? palette.accent : palette.border,
                          backgroundColor: selected ? 'rgba(127,34,255,0.18)' : 'transparent',
                          opacity: atLimit ? 0.82 : 1,
                          transform: [{ scale: pressed ? 0.98 : selected ? 1.02 : 1 }],
                        },
                      ]}>
                      <Text style={[styles.multiChipText, { color: selected ? '#fff' : palette.text }]}> 
                        {selected ? `${CHECKMARK} ` : ''}
                        {habitOption}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={[styles.helperText, styles.selectionCount, { color: palette.mutedText }]}>
                {selectedStarterHabits.length} selected
              </Text>
              <Text style={[styles.step3BrandMoment, { color: palette.mutedText }]}>A simple start builds momentum.</Text>
            </SurfaceCard>
          ) : null}

          <View style={styles.actions}>
            {step === 0 ? (
              <Pressable style={[styles.secondaryButton, { borderColor: palette.border }]} onPress={confirmSkipSetup}>
                <Text style={[styles.secondaryButtonText, styles.skipActionText, { color: palette.mutedText }]}>
                  Skip setup
                </Text>
              </Pressable>
            ) : step > 0 ? (
              <Pressable style={[styles.secondaryButton, { borderColor: palette.border }]} onPress={goBack}>
                <Text style={[styles.secondaryButtonText, { color: palette.text }]}>Back</Text>
              </Pressable>
            ) : (
              <View style={styles.actionSpacer} />
            )}

            {step < 3 ? (
              <Pressable
                style={[styles.primaryButton, { backgroundColor: palette.accent, opacity: canContinue ? 1 : 0.5 }]}
                onPress={goNext}
                disabled={!canContinue}>
                <Text style={styles.primaryButtonText}>{step === 0 ? 'Continue' : 'Next'}</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.primaryButton, styles.finishPrimaryButton, { backgroundColor: '#A66BFF' }]}
                onPress={finish}>
                <Text style={styles.primaryButtonText}>Start my day</Text>
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
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.85,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    width: '100%',
  },
  progressDot: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  progressDotActive: {
    flex: 1.35,
  },
  card: {
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
  },
  step0Wrap: {
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: 'center',
  },
  step0Logo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    marginBottom: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B87CFF',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  step0LogoText: {
    color: '#3F0E73',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  step0LogoImage: {
    width: 64,
    height: 64,
  },
  step0Headline: {
    fontSize: 44,
    lineHeight: 52,
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: 20,
    maxWidth: 520,
  },
  step0AppearanceLabel: {
    alignSelf: 'stretch',
    marginTop: 0,
    marginBottom: 8,
  },
  step0AppearanceWrap: {
    alignSelf: 'stretch',
  },
  step0SupportLine: {
    marginTop: 12,
    alignSelf: 'center',
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.82,
    marginBottom: 2,
  },
  heroTagline: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  localFirst: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  bulletWrap: {
    marginTop: 12,
    marginBottom: 14,
    gap: 8,
  },
  bulletText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: '700',
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
    shadowColor: '#7F22FF',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  multiChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  appearanceWrap: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    padding: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  appearanceOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appearanceText: {
    fontSize: 15,
    fontWeight: '700',
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
  previewText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  actionSpacer: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 48,
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
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishPrimaryButton: {
    shadowColor: '#9B5BFF',
    shadowOpacity: 0.42,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    minHeight: 52,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  skipActionText: {
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
  captionText: {
    marginTop: -2,
    marginBottom: 2,
  },
  selectionCount: {
    marginTop: -4,
    fontSize: 11,
    opacity: 0.7,
  },
  sectionSpacerTop: {
    marginTop: 14,
  },
  step3BrandMoment: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.78,
  },
});
