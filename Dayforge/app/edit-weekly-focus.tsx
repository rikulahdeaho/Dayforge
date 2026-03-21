import { SymbolView } from '@/components/dayforge/SymbolView';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { scrollFocusedInputIntoView } from '@/components/dayforge/scrollFocusedInputIntoView';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';

export default function EditWeeklyFocusScreen() {
  const router = useRouter();
  const { state, updateGoal } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const [goalTitle, setGoalTitle] = useState(state.goal.title);
  const [goalTarget, setGoalTarget] = useState(String(state.goal.target));
  const scrollRef = useRef<ScrollView>(null);

  const saveGoal = () => {
    if (!goalTitle.trim()) {
      Alert.alert('Goal missing', 'Please enter your weekly focus title.');
      return;
    }

    updateGoal({ title: goalTitle, target: Number(goalTarget) });
    router.back();
  };

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safe}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: palette.text }]}>Edit Weekly Focus</Text>
            <Text style={[styles.subtitle, { color: palette.mutedText }]}>Update title and target</Text>
          </View>

          <SurfaceCard palette={palette} style={styles.formCard}>
            <View style={[styles.iconWrap, { backgroundColor: palette.cardStrong }]}>
              <SymbolView
                name={resolveSymbolName({ ios: 'target', android: 'track_changes', web: 'track_changes' })}
                size={30}
                tintColor={palette.accent}
              />
            </View>
            <Text style={[styles.label, { color: palette.text }]}>Focus title</Text>
            <TextInput
              value={goalTitle}
              onChangeText={setGoalTitle}
              onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
              placeholder="Example: Build momentum with deep work"
              placeholderTextColor={palette.mutedText}
              style={[styles.input, { color: palette.text, borderColor: palette.border }]}
              autoFocus
            />

            <Text style={[styles.label, { color: palette.text }]}>Weekly target</Text>
            <TextInput
              value={goalTarget}
              onChangeText={setGoalTarget}
              onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
              placeholder="Example: 5"
              keyboardType="number-pad"
              placeholderTextColor={palette.mutedText}
              style={[styles.input, { color: palette.text, borderColor: palette.border }]}
            />

            <View style={styles.actionRow}>
              <Pressable style={[styles.secondaryBtn, { borderColor: palette.border }]} onPress={() => router.back()}>
                <Text style={[styles.secondaryBtnText, { color: palette.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={saveGoal}
                disabled={!goalTitle.trim()}
                style={[styles.primaryBtn, { backgroundColor: palette.accent, opacity: goalTitle.trim() ? 1 : 0.5 }]}>
                <Text style={styles.primaryBtnText}>Save Focus</Text>
              </Pressable>
            </View>
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
    paddingTop: 28,
    paddingBottom: 36,
  },
  headerRow: {
    marginBottom: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  formCard: {
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
