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
 *    - "What went well today?" (multiline input)
 *    - "What are you grateful for?" (multiline input)
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

import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayforgePalette, GlowButton } from '@/components/dayforge/Primitives';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';
import { Mood, PlatformIconName } from '@/types';

const moods: { id: Mood; emoji: string; label: string }[] = [
  { id: 'sad', emoji: '😔', label: 'SAD' },
  { id: 'neutral', emoji: '😐', label: 'NEUTRAL' },
  { id: 'good', emoji: '😊', label: 'GOOD' },
  { id: 'happy', emoji: '✨', label: 'HAPPY' },
];

function resolveSymbolName(icon: PlatformIconName) {
  return (
    Platform.select({
      ios: icon.ios,
      android: icon.android,
      default: icon.web,
    }) ?? icon.web
  ) as any;
}

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

function formatReflectionDate() {
  return new Date().toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ReflectionScreen() {
  const palette = Colors.dark as DayforgePalette;
  const { saveReflection, setMood, setReflectionField, setSuccessMessage, state, successMessage } = useAppState();
  const headerDate = formatReflectionDate();
  const visibleHistory = state.reflectionHistory.slice(0, 3);

  const handleSaveReflection = () => {
    const result = saveReflection();

    if (!result.ok) {
      Alert.alert('Mood required', 'Please select how you are feeling before saving.');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <LinearGradient
          colors={['rgba(127,34,255,0.22)', 'rgba(127,34,255,0.05)', 'transparent']}
          start={{ x: 0.8, y: 0 }}
          end={{ x: 0.2, y: 1 }}
          style={styles.topGlow}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <View style={styles.dateRow}>
            <SymbolView
              name={resolveSymbolName({ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' })}
              size={16}
              tintColor={palette.accent}
            />
            <Text style={[styles.dateText, { color: palette.accent }]}>{headerDate}</Text>
          </View>
          <Text style={[styles.heroTitle, { color: palette.text }]}>How are you feeling?</Text>
        </View>

        <View style={styles.moodRow}>
          {moods.map((mood) => {
            const selected = state.reflectionDraft.mood === mood.id;
            return (
              <Pressable
                key={mood.id}
                onPress={() => {
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
                      backgroundColor: selected ? 'rgba(127,34,255,0.28)' : 'rgba(255,255,255,0.02)',
                      borderColor: selected ? palette.accent : palette.border,
                      shadowColor: selected ? palette.accentStrong : 'transparent',
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

        <View style={styles.entrySection}>
          <Text style={[styles.entryHeading, { color: palette.text }]}>What went well today?</Text>
          <View
            style={[
              styles.textAreaShell,
              {
                backgroundColor: 'rgba(255,255,255,0.035)',
                borderColor: palette.border,
              },
            ]}>
            <TextInput
              multiline
              numberOfLines={4}
              value={state.reflectionDraft.wentWell}
              onChangeText={(text) => {
                setReflectionField('wentWell', text);
                if (successMessage) {
                  setSuccessMessage(null);
                }
              }}
              placeholder="Focus on the wins, big or small..."
              placeholderTextColor={palette.mutedText}
              style={[styles.textArea, { color: palette.text }]}
            />
          </View>
        </View>

        <View style={styles.entrySection}>
          <Text style={[styles.entryHeading, { color: palette.text }]}>What are you grateful for?</Text>
          <View
            style={[
              styles.textAreaShell,
              {
                backgroundColor: 'rgba(255,255,255,0.035)',
                borderColor: palette.border,
              },
            ]}>
            <TextInput
              multiline
              numberOfLines={4}
              value={state.reflectionDraft.gratefulFor}
              onChangeText={(text) => {
                setReflectionField('gratefulFor', text);
                if (successMessage) {
                  setSuccessMessage(null);
                }
              }}
              placeholder="Something that made you smile..."
              placeholderTextColor={palette.mutedText}
              style={[styles.textArea, { color: palette.text }]}
            />
          </View>
        </View>

        <GlowButton
          label="Save Reflection"
          palette={palette}
          style={styles.saveButton}
          textStyle={styles.saveButtonText}
          onPress={handleSaveReflection}
        />
        {successMessage ? <Text style={[styles.successText, { color: palette.accent }]}>{successMessage}</Text> : null}

        <View style={styles.historyHeader}>
          <Text style={[styles.historyHeading, { color: palette.text }]}>Past Entries</Text>
          <Text style={[styles.historyAction, { color: palette.accent }]}>VIEW ALL</Text>
        </View>

        {visibleHistory.map((entry) => (
          <View
            key={entry.id}
            style={[
              styles.historyItem,
              {
                backgroundColor: 'rgba(255,255,255,0.035)',
                borderColor: palette.border,
                shadowColor: palette.shadow,
              },
            ]}>
            <View style={[styles.historyEmoji, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <Text style={styles.moodEmoji}>{moodEmoji(entry.mood)}</Text>
            </View>
            <View style={styles.historyCopy}>
              <Text style={[styles.historyDate, { color: palette.text }]}>{entry.dateLabel}</Text>
              <Text numberOfLines={1} style={[styles.historyPreview, { color: palette.mutedText }]}>
                {entry.preview}
              </Text>
            </View>
            <SymbolView
              name={resolveSymbolName({ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' })}
              size={18}
              tintColor={palette.mutedText}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  topGlow: {
    position: 'absolute',
    top: -60,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 999,
  },
  bottomGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 160,
    height: 220,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 128,
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
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
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
    shadowOpacity: 0.38,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    marginTop: 10,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  entrySection: {
    marginBottom: 24,
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
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
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
});
