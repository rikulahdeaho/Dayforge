import { Redirect, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
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

import { feedbackSelection, feedbackSuccess, feedbackTap } from '@/components/dayforge/feedback';
import { SurfaceCard } from '@/components/dayforge/Primitives';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { DayforgePalette } from '@/components/dayforge/types';
import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { toggleMultiSelectItem } from '@/screens/onboarding/utils';
import { useAppState } from '@/store/appState';

import { OnboardingProgress } from './components/OnboardingProgress';
import { ProfileStep } from './components/ProfileStep';
import { StarterSelectionStep } from './components/StarterSelectionStep';
import { WeeklyGoalStep } from './components/WeeklyGoalStep';
import { WelcomeStep } from './components/WelcomeStep';

type Step = 0 | 1 | 2 | 3 | 4;
type ReminderPickerTarget = 'morning' | 'evening' | 'weekly' | null;

const MAX_FOCUS_AREAS = 2;
const MAX_STARTER_TASKS = 2;
const MAX_STARTER_HABITS = 2;
const focusOptions = [
  'More focus',
  'Better routines',
  'Less stress',
  'More energy',
  'More clarity',
  'More consistency',
];
const weeklyGoalSuggestions = ['Apply to jobs', 'Exercise', 'Deep work hours', 'Read daily', 'Sleep earlier'];
const starterTaskOptions = ['Plan tomorrow', '20-minute focus sprint', 'Clear one task', 'Inbox reset'];
const starterHabitOptions = ['Drink water', '10-minute walk', 'Evening reflection', 'Stretch for 5 minutes'];
const targetOptions = [3, 5, 7, 10, 15];
const MIN_TARGET = 1;
const MAX_TARGET = 20;
const hourOptions = Array.from({ length: 24 }, (_, index) => index);
const minuteOptions = [0, 15, 30, 45];
const weeklyReminderDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function padTime(value: number) {
  return String(value).padStart(2, '0');
}

function parseTimeParts(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return { hour: 20, minute: 30 };
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  return {
    hour: Number.isFinite(hour) && hour >= 0 && hour <= 23 ? hour : 20,
    minute: minuteOptions.includes(minute) ? minute : 30,
  };
}

function buildTime(hour: number, minute: number) {
  return `${padTime(hour)}:${padTime(minute)}`;
}

function ReminderRow({
  palette,
  title,
  description,
  enabled,
  onToggle,
  valueLabel,
  onOpenPicker,
  dayLabel,
  onSelectDay,
}: {
  palette: DayforgePalette;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  valueLabel: string;
  onOpenPicker: () => void;
  dayLabel?: string;
  onSelectDay?: (value: string) => void;
}) {
  return (
    <SurfaceCard palette={palette} style={styles.reminderCard}>
      <View style={styles.reminderToggleCard}>
        <View style={styles.reminderHeaderCopy}>
          <Text style={[styles.reminderLabel, { color: palette.text }]}>{title}</Text>
          <Text style={[styles.reminderAssist, { color: palette.mutedText }]}>{description}</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: 'rgba(255,255,255,0.14)', true: palette.accent }}
          thumbColor="#F8F5FF"
        />
      </View>

      {enabled ? (
        <View style={styles.reminderControls}>
          <Pressable
            onPress={onOpenPicker}
            style={({ pressed }) => [
              styles.timeField,
              {
                borderColor: palette.border,
                backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
              },
            ]}>
            <Text style={[styles.timeFieldLabel, { color: palette.mutedText }]}>Time</Text>
            <Text style={[styles.timeFieldValue, { color: palette.text }]}>{valueLabel}</Text>
          </Pressable>

          {dayLabel && onSelectDay ? (
            <View style={styles.weekdayWrap}>
              {weeklyReminderDays.map((day) => {
                const selected = dayLabel === day;
                return (
                  <Pressable
                    key={day}
                    onPress={() => {
                      feedbackSelection();
                      onSelectDay(day);
                    }}
                    style={({ pressed }) => [
                      styles.weekdayChip,
                      {
                        borderColor: selected ? 'rgba(141,99,219,0.2)' : palette.border,
                        backgroundColor: selected ? 'rgba(141,99,219,0.2)' : 'rgba(255,255,255,0.025)',
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      },
                    ]}>
                    <Text style={[styles.weekdayText, { color: selected ? palette.text : palette.mutedText }]}>
                      {day.slice(0, 3)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      ) : null}
    </SurfaceCard>
  );
}

function TimePickerSheet({
  visible,
  palette,
  title,
  time,
  onClose,
  onSelectHour,
  onSelectMinute,
}: {
  visible: boolean;
  palette: DayforgePalette;
  title: string;
  time: string;
  onClose: () => void;
  onSelectHour: (value: number) => void;
  onSelectMinute: (value: number) => void;
}) {
  if (!visible) {
    return null;
  }

  const { hour, minute } = parseTimeParts(time);

  return (
    <View style={styles.sheetOverlay}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={[styles.sheetCard, { backgroundColor: palette.cardStrong, borderColor: palette.border }]}>
        <Text style={[styles.sheetTitle, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.sheetTimePreview, { color: palette.text }]}>{buildTime(hour, minute)}</Text>

        <Text style={[styles.sheetLabel, { color: palette.mutedText }]}>Hour</Text>
        <View style={styles.sheetOptionsWrap}>
          {hourOptions.map((value) => {
            const selected = hour === value;
            return (
              <Pressable
                key={value}
                onPress={() => {
                  feedbackSelection();
                  onSelectHour(value);
                }}
                style={({ pressed }) => [
                  styles.sheetChip,
                  {
                    borderColor: selected ? 'rgba(141,99,219,0.24)' : palette.border,
                    backgroundColor: selected ? 'rgba(141,99,219,0.22)' : 'rgba(255,255,255,0.025)',
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}>
                <Text style={[styles.sheetChipText, { color: selected ? palette.text : palette.mutedText }]}>
                  {padTime(value)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sheetLabel, { color: palette.mutedText }]}>Minute</Text>
        <View style={styles.sheetOptionsWrap}>
          {minuteOptions.map((value) => {
            const selected = minute === value;
            return (
              <Pressable
                key={value}
                onPress={() => {
                  feedbackSelection();
                  onSelectMinute(value);
                }}
                style={({ pressed }) => [
                  styles.sheetChip,
                  {
                    borderColor: selected ? 'rgba(141,99,219,0.24)' : palette.border,
                    backgroundColor: selected ? 'rgba(141,99,219,0.22)' : 'rgba(255,255,255,0.025)',
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}>
                <Text style={[styles.sheetChipText, { color: selected ? palette.text : palette.mutedText }]}>
                  {padTime(value)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={[styles.sheetDoneButton, { backgroundColor: palette.accent }]} onPress={onClose}>
          <Text style={styles.primaryButtonText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ReminderStep({
  palette,
  morningEnabled,
  setMorningEnabled,
  morningTime,
  onOpenMorningPicker,
  eveningEnabled,
  setEveningEnabled,
  eveningTime,
  onOpenEveningPicker,
  weeklyPlanEnabled,
  setWeeklyPlanEnabled,
  weeklyPlanTime,
  weeklyPlanDay,
  onSelectWeeklyPlanDay,
  onOpenWeeklyPlanPicker,
}: {
  palette: DayforgePalette;
  morningEnabled: boolean;
  setMorningEnabled: (value: boolean) => void;
  morningTime: string;
  onOpenMorningPicker: () => void;
  eveningEnabled: boolean;
  setEveningEnabled: (value: boolean) => void;
  eveningTime: string;
  onOpenEveningPicker: () => void;
  weeklyPlanEnabled: boolean;
  setWeeklyPlanEnabled: (value: boolean) => void;
  weeklyPlanTime: string;
  weeklyPlanDay: string;
  onSelectWeeklyPlanDay: (value: string) => void;
  onOpenWeeklyPlanPicker: () => void;
}) {
  return (
    <View style={styles.stepWrap}>
      <View style={styles.headerBlock}>
        <Text style={[styles.stepTitle, { color: palette.text }]}>Stay on track</Text>
        <Text style={[styles.stepSubtitle, { color: palette.mutedText }]}>
          Add any reminders you want for mornings, evenings, or weekly planning.
        </Text>
      </View>

      <Text style={[styles.microcopy, { color: palette.mutedText }]}>Every reminder here is optional.</Text>

      <ReminderRow
        palette={palette}
        title="Morning reminder"
        description="A gentle start for your day."
        enabled={morningEnabled}
        onToggle={setMorningEnabled}
        valueLabel={morningTime}
        onOpenPicker={onOpenMorningPicker}
      />

      <ReminderRow
        palette={palette}
        title="Evening reminder"
        description="A check-in for your close-out."
        enabled={eveningEnabled}
        onToggle={setEveningEnabled}
        valueLabel={eveningTime}
        onOpenPicker={onOpenEveningPicker}
      />

      <ReminderRow
        palette={palette}
        title="Weekly plan reminder"
        description="A prompt to set direction for the week ahead."
        enabled={weeklyPlanEnabled}
        onToggle={setWeeklyPlanEnabled}
        valueLabel={weeklyPlanTime}
        dayLabel={weeklyPlanDay}
        onSelectDay={onSelectWeeklyPlanDay}
        onOpenPicker={onOpenWeeklyPlanPicker}
      />
    </View>
  );
}

function ReadyState({ palette }: { palette: DayforgePalette }) {
  return (
    <View style={styles.readyStateWrap}>
      <View style={[styles.readyStateCard, { borderColor: palette.border, backgroundColor: 'rgba(17,12,29,0.76)' }]}>
        <Text style={[styles.readyHeadline, { color: palette.text }]}>You’re ready.</Text>
        <Text style={[styles.readySubheadline, { color: palette.mutedText }]}>Let’s begin.</Text>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding, isHydrated, setSuccessMessage, skipOnboarding, state } = useAppState();

  const [step, setStep] = useState<Step>(0);
  const [darkMode, setDarkMode] = useState(true);
  const [name, setName] = useState('');
  const [selectedFocuses, setSelectedFocuses] = useState<string[]>([]);

  const [selectedGoal, setSelectedGoal] = useState('Apply to jobs');
  const [customGoalValue, setCustomGoalValue] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(5);

  const [selectedStarterTasks, setSelectedStarterTasks] = useState<string[]>([starterTaskOptions[0]]);
  const [selectedStarterHabits, setSelectedStarterHabits] = useState<string[]>(['Drink water']);
  const [morningReminderEnabled, setMorningReminderEnabled] = useState(false);
  const [morningReminderTime, setMorningReminderTime] = useState('08:00');
  const [eveningReminderEnabled, setEveningReminderEnabled] = useState(false);
  const [eveningReminderTime, setEveningReminderTime] = useState('20:30');
  const [weeklyPlanReminderEnabled, setWeeklyPlanReminderEnabled] = useState(false);
  const [weeklyPlanReminderTime, setWeeklyPlanReminderTime] = useState('17:00');
  const [weeklyPlanReminderDay, setWeeklyPlanReminderDay] = useState('Sunday');
  const [pickerTarget, setPickerTarget] = useState<ReminderPickerTarget>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const nameInputRef = useRef<TextInput>(null);

  const palette = (darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const isCustomGoal = customGoalValue.trim().length > 0 && selectedGoal === customGoalValue.trim();
  const progressStep = step === 0 ? 1 : step;

  const canContinue = useMemo(() => {
    if (step === 0) {
      return true;
    }
    if (step === 1) {
      return selectedFocuses.length > 0;
    }
    if (step === 2) {
      return selectedGoal.trim().length > 0;
    }
    if (step === 3) {
      return selectedStarterTasks.length > 0 || selectedStarterHabits.length > 0;
    }
    return true;
  }, [selectedFocuses.length, selectedGoal, selectedStarterHabits.length, selectedStarterTasks.length, step]);

  useEffect(() => {
    setDarkMode(state.preferences.darkMode);
  }, [state.preferences.darkMode]);

  useEffect(() => {
    if (step === 1) {
      const timeout = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [step]);

  const goNext = () => {
    if (!canContinue || isFinishing) {
      return;
    }

    feedbackTap();
    setStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev));
  };

  const goBack = () => {
    if (isFinishing) {
      return;
    }

    feedbackSelection();
    setStep((prev) => (prev > 0 ? ((prev - 1) as Step) : prev));
  };

  const skipAll = () => {
    skipOnboarding();
    router.replace('/(tabs)');
  };

  const confirmSkipSetup = () => {
    Alert.alert('Skip setup?', "We'll start you with a simple default setup you can refine later.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Skip setup', style: 'destructive', onPress: skipAll },
    ]);
  };

  const handleSelectGoal = (value: string) => {
    setSelectedGoal(value);
  };

  const handleChangeCustomGoal = (value: string) => {
    setCustomGoalValue(value);
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      setSelectedGoal(trimmed);
    } else if (selectedGoal === customGoalValue.trim()) {
      setSelectedGoal(weeklyGoalSuggestions[0]);
    }
  };

  const decreaseTarget = () => {
    setSelectedTarget((prev) => Math.max(MIN_TARGET, prev - 1));
  };

  const increaseTarget = () => {
    setSelectedTarget((prev) => Math.min(MAX_TARGET, prev + 1));
  };

  const updateTimeHour = (target: Exclude<ReminderPickerTarget, null>, hour: number) => {
    const currentTime =
      target === 'morning' ? morningReminderTime : target === 'evening' ? eveningReminderTime : weeklyPlanReminderTime;
    const parts = parseTimeParts(currentTime);
    const nextValue = buildTime(hour, parts.minute);

    if (target === 'morning') {
      setMorningReminderTime(nextValue);
    } else if (target === 'evening') {
      setEveningReminderTime(nextValue);
    } else {
      setWeeklyPlanReminderTime(nextValue);
    }
  };

  const updateTimeMinute = (target: Exclude<ReminderPickerTarget, null>, minute: number) => {
    const currentTime =
      target === 'morning' ? morningReminderTime : target === 'evening' ? eveningReminderTime : weeklyPlanReminderTime;
    const parts = parseTimeParts(currentTime);
    const nextValue = buildTime(parts.hour, minute);

    if (target === 'morning') {
      setMorningReminderTime(nextValue);
    } else if (target === 'evening') {
      setEveningReminderTime(nextValue);
    } else {
      setWeeklyPlanReminderTime(nextValue);
    }
  };

  const finish = (options?: { remindersEnabled?: boolean }) => {
    if (isFinishing) {
      return;
    }

    const reminderParts: string[] = [];
    if (morningReminderEnabled) {
      reminderParts.push(`Morning at ${morningReminderTime}`);
    }
    if (eveningReminderEnabled) {
      reminderParts.push(`Evening at ${eveningReminderTime}`);
    }
    if (weeklyPlanReminderEnabled) {
      reminderParts.push(`Weekly plan on ${weeklyPlanReminderDay} at ${weeklyPlanReminderTime}`);
    }
    const reminders = reminderParts.length > 0 ? reminderParts.join(' | ') : 'Reminders are off for now.';

    completeOnboarding({
      name: name.trim(),
      personalGoals: selectedFocuses.join(', '),
      reminders,
      darkMode,
      weeklyGoalTitle: selectedGoal.trim(),
      weeklyGoalTarget: selectedTarget,
      tasks: selectedStarterTasks,
      habits: selectedStarterHabits,
    });

    setSuccessMessage("You're ready.");
    feedbackSuccess();
    setIsFinishing(true);

    setTimeout(() => {
      router.replace('/(tabs)');
    }, 1250);
  };

  const finishWithoutReminder = () => {
    setMorningReminderEnabled(false);
    setEveningReminderEnabled(false);
    setWeeklyPlanReminderEnabled(false);
    finish({ remindersEnabled: false });
  };

  if (isHydrated && state.hasCompletedOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <View pointerEvents="none" style={styles.radialGlowWrap}>
        <View style={[styles.radialGlowLarge, step === 4 ? styles.radialGlowLargeMuted : null]} />
        <View style={[styles.radialGlowSmall, step === 4 ? styles.radialGlowSmallMuted : null]} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safe}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, step === 0 ? styles.contentWelcome : null]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {step > 0 ? <OnboardingProgress step={progressStep as 1 | 2 | 3 | 4} palette={palette} /> : null}

          {step === 0 ? <WelcomeStep palette={palette} darkMode={darkMode} onSetDarkMode={setDarkMode} /> : null}

          {step === 1 ? (
            <ProfileStep
              palette={palette}
              name={name}
              setName={setName}
              nameInputRef={nameInputRef}
              scrollRef={scrollRef}
              focusOptions={focusOptions}
              selectedFocuses={selectedFocuses}
              maxPersonalGoals={MAX_FOCUS_AREAS}
              onToggleGoal={(goalOption) =>
                setSelectedFocuses((prev) => toggleMultiSelectItem(goalOption, prev, MAX_FOCUS_AREAS))
              }
            />
          ) : null}

          {step === 2 ? (
            <WeeklyGoalStep
              palette={palette}
              scrollRef={scrollRef}
              suggestions={weeklyGoalSuggestions}
              selectedGoal={selectedGoal}
              onSelectGoal={handleSelectGoal}
              isCustomGoal={isCustomGoal}
              customGoalValue={customGoalValue}
              onChangeCustomGoal={handleChangeCustomGoal}
              targetOptions={targetOptions}
              selectedTarget={selectedTarget}
              onSelectTarget={setSelectedTarget}
              onDecreaseTarget={decreaseTarget}
              onIncreaseTarget={increaseTarget}
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
              onToggleTask={(taskOption) =>
                setSelectedStarterTasks((prev) => toggleMultiSelectItem(taskOption, prev, MAX_STARTER_TASKS))
              }
              onToggleHabit={(habitOption) =>
                setSelectedStarterHabits((prev) => toggleMultiSelectItem(habitOption, prev, MAX_STARTER_HABITS))
              }
            />
          ) : null}

          {step === 4 ? (
            <ReminderStep
              palette={palette}
              morningEnabled={morningReminderEnabled}
              setMorningEnabled={setMorningReminderEnabled}
              morningTime={morningReminderTime}
              onOpenMorningPicker={() => setPickerTarget('morning')}
              eveningEnabled={eveningReminderEnabled}
              setEveningEnabled={setEveningReminderEnabled}
              eveningTime={eveningReminderTime}
              onOpenEveningPicker={() => setPickerTarget('evening')}
              weeklyPlanEnabled={weeklyPlanReminderEnabled}
              setWeeklyPlanEnabled={setWeeklyPlanReminderEnabled}
              weeklyPlanTime={weeklyPlanReminderTime}
              weeklyPlanDay={weeklyPlanReminderDay}
              onSelectWeeklyPlanDay={setWeeklyPlanReminderDay}
              onOpenWeeklyPlanPicker={() => setPickerTarget('weekly')}
            />
          ) : null}
          <View style={styles.ctaDock}>
            {step === 0 ? (
              <>
                <Text style={[styles.welcomeNote, { color: palette.mutedText }]}>No account needed. Data stays on this device.</Text>
                <Pressable style={[styles.primaryButton, styles.dockButton, { backgroundColor: palette.accent }]} onPress={goNext}>
                  <Text style={styles.primaryButtonText}>Get started</Text>
                </Pressable>
                <Pressable style={[styles.secondaryButton, styles.dockButton, { borderColor: palette.border }]} onPress={confirmSkipSetup}>
                  <Text style={[styles.secondaryButtonText, { color: palette.mutedText }]}>Skip setup</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={[
                    styles.primaryButton,
                    styles.inlineButton,
                    { backgroundColor: palette.accent, opacity: canContinue ? 1 : 0.74 },
                  ]}
                  onPress={step === 4 ? () => finish() : goNext}
                  disabled={!canContinue || isFinishing}>
                <Text style={styles.primaryButtonText}>
                  {step === 3 ? 'Start my day' : step === 4 ? 'Finish setup' : 'Continue'}
                </Text>
              </Pressable>

                <Pressable
                  style={[styles.secondaryButton, styles.inlineButton, { borderColor: palette.border }]}
                  onPress={step === 4 ? finishWithoutReminder : goBack}>
                  <Text style={[styles.secondaryButtonText, { color: step === 4 ? palette.mutedText : palette.text }]}>
                    {step === 4 ? 'Not now' : 'Back'}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TimePickerSheet
        visible={pickerTarget !== null}
        palette={palette}
        title={
          pickerTarget === 'morning'
            ? 'Morning reminder'
            : pickerTarget === 'evening'
              ? 'Evening reminder'
              : 'Weekly plan reminder'
        }
        time={
          pickerTarget === 'morning'
            ? morningReminderTime
            : pickerTarget === 'evening'
              ? eveningReminderTime
              : weeklyPlanReminderTime
        }
        onClose={() => setPickerTarget(null)}
        onSelectHour={(value) => {
          if (pickerTarget) {
            updateTimeHour(pickerTarget, value);
          }
        }}
        onSelectMinute={(value) => {
          if (pickerTarget) {
            updateTimeMinute(pickerTarget, value);
          }
        }}
      />

      {isFinishing ? <ReadyState palette={palette} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 46,
    paddingBottom: 32,
  },
  contentWelcome: {
    paddingTop: 32,
  },
  radialGlowWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  radialGlowLarge: {
    position: 'absolute',
    top: 60,
    left: '15%',
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: 'rgba(111,75,184,0.08)',
  },
  radialGlowSmall: {
    position: 'absolute',
    top: 170,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(141,99,219,0.04)',
  },
  radialGlowLargeMuted: {
    backgroundColor: 'rgba(111,75,184,0.045)',
  },
  radialGlowSmallMuted: {
    backgroundColor: 'rgba(141,99,219,0.022)',
  },
  stepWrap: {
    gap: 14,
  },
  headerBlock: {
    gap: 8,
  },
  stepTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    fontFamily: Fonts.heading,
  },
  stepSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  microcopy: {
    fontSize: 14,
    lineHeight: 21,
  },
  reminderCard: {
    paddingVertical: 16,
    gap: 14,
  },
  reminderToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  reminderHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  reminderLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  reminderAssist: {
    fontSize: 13,
    lineHeight: 18,
  },
  timePickerCard: {
    gap: 12,
  },
  reminderControls: {
    gap: 12,
  },
  timeField: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  timeFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeFieldValue: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    fontFamily: Fonts.heading,
  },
  weekdayWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weekdayChip: {
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ctaDock: {
    marginTop: 20,
    borderRadius: 30,
    padding: 8,
    gap: 8,
    backgroundColor: 'rgba(14,10,24,0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: Platform.OS === 'android' ? 28 : 16,
  },
  dockButton: {
    minHeight: 50,
  },
  welcomeNote: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  inlineButton: {
    flex: 1,
    minHeight: 44,
  },
  primaryButton: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8D63DB',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.018)',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#F7F4FC',
    fontSize: 15,
    fontWeight: '800',
  },
  readyStateWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,5,12,0.34)',
    paddingHorizontal: 24,
  },
  readyStateCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  readyHeadline: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    fontFamily: Fonts.heading,
  },
  readySubheadline: {
    fontSize: 17,
    lineHeight: 24,
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheetCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    gap: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Fonts.heading,
  },
  sheetTimePreview: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    fontFamily: Fonts.heading,
  },
  sheetLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  sheetOptionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sheetChip: {
    minWidth: 54,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sheetChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sheetDoneButton: {
    marginTop: 6,
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
