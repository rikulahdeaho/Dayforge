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
import { Fonts } from '@/constants/Typography';
import { parsePositiveNumber, toggleMultiSelectItem } from '@/screens/onboarding/utils';
import { useAppState } from '@/store/appState';

import { OnboardingProgress } from './components/OnboardingProgress';
import { ProfileStep } from './components/ProfileStep';
import { StarterSelectionStep } from './components/StarterSelectionStep';
import { WeeklyGoalStep } from './components/WeeklyGoalStep';
import { WelcomeStep } from './components/WelcomeStep';

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

          <OnboardingProgress step={step} palette={palette} />

          {step === 0 ? (
            <WelcomeStep palette={palette} darkMode={darkMode} onSetDarkMode={setDarkMode} />
          ) : null}

          {step === 1 ? (
            <ProfileStep
              palette={palette}
              name={name}
              setName={setName}
              nameTouched={nameTouched}
              nameError={nameError}
              nameInputRef={nameInputRef}
              scrollRef={scrollRef}
              personalGoals={personalGoals}
              selectedPersonalGoals={selectedPersonalGoals}
              maxPersonalGoals={MAX_PERSONAL_GOALS}
              checkmark={CHECKMARK}
              onToggleGoal={(goalOption) =>
                setSelectedPersonalGoals((prev) => toggleMultiSelectItem(goalOption, prev, MAX_PERSONAL_GOALS))
              }
              customPersonalGoalInput={customPersonalGoalInput}
              setCustomGoalAsChip={setCustomGoalAsChip}
              remindersEnabled={remindersEnabled}
              setRemindersEnabled={setRemindersEnabled}
              reminderTime={reminderTime}
              setReminderTime={setReminderTime}
            />
          ) : null}

          {step === 2 ? (
            <WeeklyGoalStep
              palette={palette}
              scrollRef={scrollRef}
              weeklyGoalTitle={weeklyGoalTitle}
              setWeeklyGoalTitle={setWeeklyGoalTitle}
              weeklyGoalTarget={weeklyGoalTarget}
              setWeeklyGoalTarget={setWeeklyGoalTarget}
              weeklyGoalNameError={weeklyGoalNameError}
              weeklyTargetError={weeklyTargetError}
              parsedWeeklyGoalTarget={parsedWeeklyGoalTarget}
            />
          ) : null}

          {step === 3 ? (
            <StarterSelectionStep
              palette={palette}
              starterTaskOptions={starterTaskOptions}
              starterHabitOptions={starterHabitOptions}
              selectedStarterTasks={selectedStarterTasks}
              selectedStarterHabits={selectedStarterHabits}
              maxStarterTasks={MAX_STARTER_TASKS}
              maxStarterHabits={MAX_STARTER_HABITS}
              checkmark={CHECKMARK}
              onToggleTask={(taskOption) =>
                setSelectedStarterTasks((prev) => toggleMultiSelectItem(taskOption, prev, MAX_STARTER_TASKS))
              }
              onToggleHabit={(habitOption) =>
                setSelectedStarterHabits((prev) => toggleMultiSelectItem(habitOption, prev, MAX_STARTER_HABITS))
              }
            />
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
    fontFamily: Fonts.heading,
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
