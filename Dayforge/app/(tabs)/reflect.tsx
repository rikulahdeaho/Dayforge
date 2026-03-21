/**
 * Reflect Screen - Daily Journaling & Mood Tracking
 *
 * Overview:
 * - Calm, focused interface for daily reflection and mood logging
 * - Collects mood state and two open-ended journal prompts
 * - Maintains session-only reflection history (visible during app session)
 *
 * Content:
 * 1. Header with today's date and settings icon
 * 2. "How are you feeling?" mood selector with 4 options:
 *    - Sad (😔)
 *    - Neutral (😐)
 *    - Good (😊)
 *    - Happy (🤩)
 *    - Only one mood can be selected at a time (single-select with visual highlight)
 * 3. Today's Prompts section with two large text input cards:
 *    - Prompt 1 rotates daily and captures wins/progress
 *    - Prompt 2 rotates daily and captures gratitude/meaning
 * 4. "Save Reflection" glowing CTA button
 * 5. Success feedback message (appears briefly after save)
 * 6. History section showing today's and prior session reflections:
 *    - Mood emoji
 *    - Date label
 *    - Preview text (truncated to 84 chars)
 *    - Each item is a read-only card
 *
 * Interactions:
 * - Tap mood emoji/label → select that mood (single choice only)
 * - Type in prompt inputs → controlled text state (editable any time)
 * - Tap "Save Reflection" → validates mood is selected, creates history entry, prepends to list
 * - After save: mood/inputs are cleared, success message appears briefly
 * - History items are display-only (session persists until app reload)
 * - Session-only state: all reflections reset on app reload to demo defaults
 */

import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Animated, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


import { DateHeader } from '@/components/dayforge/DateHeader';
import { feedbackSelection, feedbackSuccess, feedbackTap } from '@/components/dayforge/feedback';
import { scrollFocusedInputIntoView } from '@/components/dayforge/scrollFocusedInputIntoView';
import { SymbolView } from '@/components/dayforge/SymbolView';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import { DayforgePalette, GlowButton } from '@/components/dayforge/Primitives';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';
import { getDailyReflectionPrompts } from '@/store/appState.helpers';
import { Mood } from '@/types';

const moods: { id: Mood; emoji: string; label: string }[] = [
  { id: 'sad', emoji: '😔', label: 'SAD' },
  { id: 'neutral', emoji: '😐', label: 'NEUTRAL' },
  { id: 'good', emoji: '😊', label: 'GOOD' },
  { id: 'happy', emoji: '✨', label: 'HAPPY' },
];

function moodEmoji(mood: Mood) {
  switch (mood) {
    case 'sad':
      return '😔';
    case 'neutral':
      return '😐';
    case 'good':
      return '😊';
    case 'happy':
      return '✨';
    default:
      return '😊';
  }
}

function moodSummary(mood: Mood) {
  switch (mood) {
    case 'sad':
      return 'Soft reset day';
    case 'neutral':
      return 'Steady and grounded';
    case 'good':
      return 'Strong forward motion';
    case 'happy':
      return 'Bright and energized';
    default:
      return 'Steady progress';
  }
}

function moodAuraColor(mood: Mood | null) {
  switch (mood) {
    case 'happy':
      return 'rgba(255, 208, 117, 0.14)';
    case 'good':
      return 'rgba(124, 58, 237, 0.12)';
    case 'neutral':
      return 'rgba(95, 111, 138, 0.1)';
    case 'sad':
      return 'rgba(31, 41, 55, 0.2)';
    default:
      return 'rgba(124, 58, 237, 0.08)';
  }
}

function moodVisuals(mood: Mood | null) {
  switch (mood) {
    case 'happy':
      return {
        panelColors: ['rgba(255,188,80,0.28)', 'rgba(124,58,237,0.24)', 'rgba(18,8,45,0.8)'],
        orbA: 'rgba(255,190,92,0.35)',
        orbB: 'rgba(160,87,255,0.34)',
        selectedRing: '#f59e0b',
      } as const;
    case 'good':
      return {
        panelColors: ['rgba(154,96,255,0.3)', 'rgba(88,28,255,0.24)', 'rgba(14,8,35,0.82)'],
        orbA: 'rgba(147,88,255,0.34)',
        orbB: 'rgba(99,102,241,0.3)',
        selectedRing: '#a855f7',
      } as const;
    case 'neutral':
      return {
        panelColors: ['rgba(97,120,160,0.25)', 'rgba(62,74,99,0.2)', 'rgba(13,15,30,0.82)'],
        orbA: 'rgba(113,128,150,0.26)',
        orbB: 'rgba(96,111,135,0.24)',
        selectedRing: '#94a3b8',
      } as const;
    case 'sad':
      return {
        panelColors: ['rgba(58,74,111,0.23)', 'rgba(35,47,72,0.2)', 'rgba(7,10,24,0.86)'],
        orbA: 'rgba(82,102,138,0.24)',
        orbB: 'rgba(56,77,113,0.24)',
        selectedRing: '#60a5fa',
      } as const;
    default:
      return {
        panelColors: ['rgba(122,74,255,0.24)', 'rgba(60,33,130,0.2)', 'rgba(12,6,28,0.82)'],
        orbA: 'rgba(125,86,255,0.26)',
        orbB: 'rgba(89,75,189,0.24)',
        selectedRing: '#8b5cf6',
      } as const;
  }
}


export default function ReflectionScreen() {
  const router = useRouter();
  const { saveReflection, setMood, setReflectionField, setSuccessMessage, state, successMessage } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const scrollRef = useRef<ScrollView>(null);
  const rewardScale = useRef(new Animated.Value(1)).current;
  const orbAScale = useRef(new Animated.Value(1)).current;
  const orbBScale = useRef(new Animated.Value(1)).current;
  const orbCScale = useRef(new Animated.Value(1)).current;
  const orbDScale = useRef(new Animated.Value(1)).current;
  const dailyPrompts = getDailyReflectionPrompts();
  const visual = moodVisuals(state.reflectionDraft.mood);
  const headerDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const visibleHistory = state.reflectionHistory.slice(0, 3);
  const hasReflectionText = Boolean(state.reflectionDraft.wentWell.trim() || state.reflectionDraft.gratefulFor.trim());
  const canSaveReflection = Boolean(state.reflectionDraft.mood && hasReflectionText);
  const solidCardSurface = state.preferences.darkMode ? 'rgba(20,12,40,0.94)' : 'rgba(248,245,255,0.97)';
  const solidInputSurface = state.preferences.darkMode ? 'rgba(18,11,36,0.98)' : 'rgba(255,255,255,0.99)';

  useEffect(() => {
    if (state.reflectionDraft.mood) {
      const orbScales = [orbAScale, orbBScale, orbCScale, orbDScale];
      orbScales.forEach((scale) => {
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.12,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [state.reflectionDraft.mood]);

  const handleSaveReflection = () => {
    const result = saveReflection();

    if (!result.ok) {
      if (result.reason === 'mood-required') {
        Alert.alert('Mood required', 'Please select how you are feeling before saving.');
        return;
      }

      Alert.alert('Add a quick note', 'Write at least one reflection before saving.');
      return;
    }

    Animated.sequence([
      Animated.timing(rewardScale, {
        toValue: 1.06,
        duration: 170,
        useNativeDriver: true,
      }),
      Animated.timing(rewardScale, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    feedbackSuccess();
  };

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View pointerEvents="none" style={styles.fxLayer}>
          <Animated.View style={[styles.fxOrbA, { backgroundColor: visual.orbA, transform: [{ scale: orbAScale }], shadowColor: visual.orbA, shadowOpacity: 0.8, shadowRadius: 32, elevation: 20 }]} />
          <Animated.View style={[styles.fxOrbB, { backgroundColor: visual.orbB, transform: [{ scale: orbBScale }], shadowColor: visual.orbB, shadowOpacity: 0.8, shadowRadius: 32, elevation: 20 }]} />
          <Animated.View style={[styles.fxOrbC, { backgroundColor: visual.orbA, transform: [{ scale: orbCScale }], shadowColor: visual.orbA, shadowOpacity: 0.7, shadowRadius: 28, elevation: 18 }]} />
          <Animated.View style={[styles.fxOrbD, { backgroundColor: visual.orbB, transform: [{ scale: orbDScale }], shadowColor: visual.orbB, shadowOpacity: 0.7, shadowRadius: 28, elevation: 18 }]} />
          <LinearGradient
            colors={['rgba(8,4,18,0.26)', 'rgba(8,4,18,0.14)', 'rgba(8,4,18,0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.fxVeil}
          />
        </View>

        <DateHeader palette={palette} dateText={headerDate} title="How are you feeling?" />

        <View style={[styles.progressiveGuide, { borderColor: palette.border, backgroundColor: solidCardSurface }]}>
          <Text style={[styles.progressiveGuideText, { color: palette.text }]}>1. Mood</Text>
          <Text style={[styles.progressiveGuideDot, { color: palette.mutedText }]}>•</Text>
          <Text style={[styles.progressiveGuideText, { color: palette.text }]}>2. What went well</Text>
          <Text style={[styles.progressiveGuideDot, { color: palette.mutedText }]}>•</Text>
          <Text style={[styles.progressiveGuideText, { color: palette.text }]}>3. Gratitude</Text>
        </View>

        <LinearGradient
          colors={visual.panelColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.moodPanel,
            {
              backgroundColor: solidCardSurface,
              borderColor: palette.border,
            },
          ]}>
          <View style={styles.moodRow}>
            {moods.map((mood) => {
              const selected = state.reflectionDraft.mood === mood.id;
              return (
                <Pressable
                  key={mood.id}
                  onPress={() => {
                    feedbackSelection();
                    setMood(mood.id);
                    if (successMessage) {
                      setSuccessMessage(null);
                    }
                  }}
                  style={styles.moodOption}>
                  <View
                    style={[
                      styles.moodBubble,
                      {
                        backgroundColor: selected ? 'rgba(127,34,255,0.35)' : 'rgba(255,255,255,0.02)',
                        borderColor: selected ? visual.selectedRing : palette.border,
                        shadowColor: selected ? visual.selectedRing : 'transparent',
                        borderWidth: selected ? 2 : 1,
                        transform: [{ scale: selected ? 1.05 : 1 }],
                        shadowOpacity: selected ? 0.55 : 0.24,
                        shadowRadius: selected ? 20 : 12,
                        elevation: selected ? 12 : 4,
                      },
                    ]}>
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  </View>
                  <Text
                    style={[
                      styles.moodLabel,
                      {
                        color: selected ? palette.text : palette.mutedText,
                        fontWeight: selected ? '700' : '500',
                      },
                    ]}>
                    {mood.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>

        {!state.reflectionDraft.mood ? (
          <Text style={[styles.hintText, { color: palette.mutedText }]}>Choose a mood to tune today&apos;s journaling vibe.</Text>
        ) : null}

        <View style={styles.entrySection}>
          <Text style={[styles.stepBadge, { color: palette.accent }]}>STEP 2</Text>
          <Text style={[styles.entryHeading, { color: palette.text }]}>{dailyPrompts.wentWellPrompt.question}</Text>
          <View
            style={[
              styles.textAreaShell,
              {
                backgroundColor: solidInputSurface,
                borderColor: palette.border,
              },
            ]}>
            <TextInput
              multiline
              numberOfLines={4}
              onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
              value={state.reflectionDraft.wentWell}
              onChangeText={(text) => {
                setReflectionField('wentWell', text);
                if (successMessage) {
                  setSuccessMessage(null);
                }
              }}
              placeholder={dailyPrompts.wentWellPrompt.placeholder}
              placeholderTextColor={palette.mutedText}
              style={[styles.textArea, { color: palette.text }]}
            />
          </View>
        </View>

        <View style={styles.entrySection}>
          <Text style={[styles.stepBadge, { color: palette.accent }]}>STEP 3</Text>
          <Text style={[styles.entryHeading, { color: palette.text }]}>{dailyPrompts.gratefulForPrompt.question}</Text>
          <View
            style={[
              styles.textAreaShell,
              {
                backgroundColor: solidInputSurface,
                borderColor: palette.border,
              },
            ]}>
            <TextInput
              multiline
              numberOfLines={4}
              onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target, 220)}
              value={state.reflectionDraft.gratefulFor}
              onChangeText={(text) => {
                setReflectionField('gratefulFor', text);
                if (successMessage) {
                  setSuccessMessage(null);
                }
              }}
              placeholder={dailyPrompts.gratefulForPrompt.placeholder}
              placeholderTextColor={palette.mutedText}
              style={[styles.textArea, { color: palette.text }]}
            />
          </View>
        </View>

        {!hasReflectionText ? (
          <Text style={[styles.motivationText, { color: palette.mutedText }]}>it will take 2 minutes to improve your streak. Capture one small win from today.</Text>
        ) : null}

        <Animated.View style={{ transform: [{ scale: rewardScale }] }}>
          <GlowButton
            label="Save Reflection"
            palette={palette}
            style={styles.saveButton}
            textStyle={styles.saveButtonText}
            onPress={handleSaveReflection}
            disabled={!canSaveReflection}
          />
        </Animated.View>

        <View style={styles.historyHeader}>
          <Text style={[styles.historyHeading, { color: palette.text }]}>Past Entries</Text>
          <Pressable
            onPress={() => {
              feedbackTap();
              router.push('/reflections' as never);
            }}>
            <Text style={[styles.historyAction, { color: palette.accent }]}>VIEW ALL</Text>
          </Pressable>
        </View>

        {visibleHistory.map((entry) => (
          <Pressable
            key={entry.id}
            onPress={() =>
              router.push({ pathname: '/reflection/[id]' as never, params: { id: entry.id } } as never)
            }
            style={[
              styles.historyItem,
              {
                backgroundColor: solidCardSurface,
                borderColor: entry === visibleHistory[0] ? palette.accent : palette.border,
                shadowColor: palette.shadow,
                borderWidth: entry === visibleHistory[0] ? 1.6 : 1,
              },
            ]}>
            <View style={[styles.historyEmoji, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <Text style={styles.moodEmoji}>{moodEmoji(entry.mood)}</Text>
            </View>
            <View style={styles.historyCopy}>
              <Text style={[styles.historyDate, { color: palette.text }]}>
                {entry.fullDate}
                {entry === visibleHistory[0] ? '  •  Latest' : ''}
              </Text>
              <Text numberOfLines={1} style={[styles.historyPreview, { color: palette.mutedText }]}>
                {entry.preview}
              </Text>
              <Text numberOfLines={1} style={[styles.historyMoodSummary, { color: palette.accentSoft }]}>
                {moodSummary(entry.mood)}
              </Text>
            </View>
            <SymbolView
              name={resolveSymbolName({ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' })}
              size={18}
              tintColor={palette.mutedText}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 65,
    paddingBottom: 128,
  },
  fxLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  fxOrbA: {
    position: 'absolute',
    top: 60,
    right: -40,
    width: 170,
    height: 170,
    borderRadius: 999,
    opacity: 0.68,
  },
  fxOrbB: {
    position: 'absolute',
    top: 220,
    left: -55,
    width: 210,
    height: 210,
    borderRadius: 999,
    opacity: 0.62,
  },
  fxVeil: {
    ...StyleSheet.absoluteFillObject,
  },
  fxOrbC: {
    position: 'absolute',
    top: 470,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 999,
    opacity: 0.48,
  },
  fxOrbD: {
    position: 'absolute',
    top: 760,
    left: -70,
    width: 200,
    height: 200,
    borderRadius: 999,
    opacity: 0.44,
  },
  headerBlock: {
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  dateRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },
  moodRow: {
    marginBottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  progressiveGuide: {
    marginBottom: 14,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  progressiveGuideText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  progressiveGuideDot: {
    fontSize: 12,
  },
  moodPanel: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 14,
    marginBottom: 14,
    overflow: 'hidden',
  },
  moodOption: {
    flex: 1,
    alignItems: 'center',
  },
  moodBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    marginTop: 10,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  hintText: {
    marginTop: 0,
    marginBottom: 18,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  entrySection: {
    marginBottom: 24,
  },
  stepBadge: {
    paddingHorizontal: 6,
    marginBottom: 6,
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  entryHeading: {
    paddingHorizontal: 6,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  textAreaShell: {
    borderRadius: 26,
    borderWidth: 1,
    minHeight: 106,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 76,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 4,
    marginBottom: 28,
    minHeight: 54,
  },
  motivationText: {
    marginTop: 0,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: '700',
  },
  saveButtonText: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: undefined }),
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  successText: {
    marginTop: -18,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  historyHeader: {
    paddingHorizontal: 6,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyHeading: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyAction: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  historyItem: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...(Platform.OS === 'ios'
      ? {
          shadowOpacity: 0.22,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 10 },
        }
      : {
          elevation: 0,
        }),
  },
  historyEmoji: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyCopy: {
    flex: 1,
    paddingRight: 10,
  },
  historyDate: {
    marginBottom: 3,
    fontSize: 15,
    fontWeight: '700',
  },
  historyPreview: {
    fontSize: 13,
    lineHeight: 18,
  },
  historyMoodSummary: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
  },
});
