import { SymbolView } from '@/components/dayforge/SymbolView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { scrollFocusedInputIntoView } from '@/components/dayforge/scrollFocusedInputIntoView';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';
import { type Mood } from '@/types';

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

export default function ReflectionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { state, removeReflection, updateReflection } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const scrollRef = useRef<ScrollView>(null);
  const entry = state.reflectionHistory.find((item) => item.id === params.id);
  const [isEditing, setIsEditing] = useState(false);
  const [wentWellDraft, setWentWellDraft] = useState('');
  const [gratefulForDraft, setGratefulForDraft] = useState('');

  useEffect(() => {
    if (!entry) {
      return;
    }

    setWentWellDraft(entry.wentWell || '');
    setGratefulForDraft(entry.gratefulFor || '');
  }, [entry]);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isEditing]);

  if (!entry) {
    return (
      <View style={[styles.safe, { backgroundColor: palette.background }]}>
        <TopGradientBackground />
        <View style={styles.center}>
          <Text style={[styles.missingText, { color: palette.mutedText }]}>Reflection not found.</Text>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: palette.accent }]}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: palette.text }]}>Reflection Detail</Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeButton, { borderColor: palette.border, backgroundColor: palette.cardStrong }]}>
            <SymbolView
              name={resolveSymbolName({ ios: 'xmark', android: 'close', web: 'close' })}
              size={18}
              tintColor={palette.text}
            />
          </Pressable>
        </View>

        <SurfaceCard palette={palette} style={styles.card}>
          <Text style={styles.emoji}>{moodEmoji(entry.mood)}</Text>
          <Text style={[styles.dateText, { color: palette.text }]}>{entry.fullDate}</Text>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={() => {
                if (isEditing) {
                  setWentWellDraft(entry.wentWell || '');
                  setGratefulForDraft(entry.gratefulFor || '');
                }
                setIsEditing((prev) => !prev);
              }}
              style={[styles.secondaryAction, { borderColor: palette.border, backgroundColor: palette.cardStrong }]}>
              <Text style={[styles.secondaryActionText, { color: palette.text }]}>{isEditing ? 'Cancel' : 'Edit'}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Alert.alert('Delete reflection?', 'This action cannot be undone.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      removeReflection(entry.id);
                      router.back();
                    },
                  },
                ]);
              }}
              style={[styles.deleteAction, { borderColor: palette.border }]}
            >
              <Text style={styles.deleteActionText}>Delete</Text>
            </Pressable>
          </View>

          <Text style={[styles.sectionLabel, { color: palette.accent }]}>{entry.wentWellPrompt || 'What went well'}</Text>
          {isEditing ? (
            <TextInput
              multiline
              onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target, 170)}
              value={wentWellDraft}
              onChangeText={setWentWellDraft}
              placeholder="Update your reflection..."
              placeholderTextColor={palette.mutedText}
              style={[styles.textArea, { color: palette.text, borderColor: palette.border, backgroundColor: palette.cardStrong }]}
            />
          ) : (
            <Text style={[styles.sectionBody, { color: palette.text }]}>{entry.wentWell || entry.preview}</Text>
          )}

          <Text style={[styles.sectionLabel, { color: palette.accent }]}>
            {entry.gratefulForPrompt || 'What I am grateful for'}
          </Text>
          {isEditing ? (
            <TextInput
              multiline
              onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target, 260)}
              value={gratefulForDraft}
              onChangeText={setGratefulForDraft}
              placeholder="Update your reflection..."
              placeholderTextColor={palette.mutedText}
              style={[styles.textArea, { color: palette.text, borderColor: palette.border, backgroundColor: palette.cardStrong }]}
            />
          ) : (
            <Text style={[styles.sectionBody, { color: palette.text }]}>{entry.gratefulFor || entry.preview}</Text>
          )}

          {isEditing ? (
            <Pressable
              onPress={() => {
                updateReflection({
                  reflectionId: entry.id,
                  wentWell: wentWellDraft,
                  gratefulFor: gratefulForDraft,
                });
                setIsEditing(false);
              }}
              style={[styles.saveAction, { backgroundColor: palette.accent }]}
            >
              <Text style={styles.saveActionText}>Save changes</Text>
            </Pressable>
          ) : null}
        </SurfaceCard>
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
    paddingTop: 68,
    paddingBottom: 240,
  },
  headerRow: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  emoji: {
    fontSize: 34,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  secondaryAction: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  deleteAction: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 84,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
  },
  saveAction: {
    marginTop: 14,
    borderRadius: 12,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  missingText: {
    fontSize: 16,
    marginBottom: 12,
  },
  backButton: {
    borderRadius: 10,
    minHeight: 40,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
