import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { scrollFocusedInputIntoView } from '@/components/dayforge/scrollFocusedInputIntoView';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';

const habitIconOptions = [
  {
    id: 'figure.mind.and.body',
    label: 'Mind',
    icon: { ios: 'figure.mind.and.body', android: 'self_improvement', web: 'self_improvement' },
  },
  {
    id: 'book.fill',
    label: 'Read',
    icon: { ios: 'book.fill', android: 'menu_book', web: 'menu_book' },
  },
  {
    id: 'drop.fill',
    label: 'Water',
    icon: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  },
  {
    id: 'dumbbell.fill',
    label: 'Workout',
    icon: { ios: 'dumbbell.fill', android: 'fitness_center', web: 'fitness_center' },
  },
  {
    id: 'moon.stars.fill',
    label: 'Sleep',
    icon: { ios: 'moon.stars.fill', android: 'bedtime', web: 'bedtime' },
  },
  {
    id: 'heart.fill',
    label: 'Health',
    icon: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  },
];

export default function AddHabitScreen() {
  const router = useRouter();
  const { addHabit, state } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const [habitTitle, setHabitTitle] = useState('');
  const [habitSubtitle, setHabitSubtitle] = useState('');
  const [habitIcon, setHabitIcon] = useState(habitIconOptions[0].id);
  const scrollRef = useRef<ScrollView>(null);

  const saveHabit = () => {
    if (!habitTitle.trim()) {
      Alert.alert('Habit name missing', 'Please enter a habit name.');
      return;
    }

    addHabit({ title: habitTitle, subtitle: habitSubtitle, icon: habitIcon });
    router.back();
  };

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safe}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: palette.text }]}>Create Habit</Text>
            <Text style={[styles.subtitle, { color: palette.mutedText }]}>Set a name, subtitle and icon</Text>
          </View>

          <SurfaceCard palette={palette} style={styles.formCard}>
            <Text style={[styles.label, { color: palette.text }]}>Habit name</Text>
            <TextInput
              value={habitTitle}
              onChangeText={setHabitTitle}
              onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
              placeholder="Example: Morning walk"
              placeholderTextColor={palette.mutedText}
              style={[styles.input, { color: palette.text, borderColor: palette.border }]}
              autoFocus
            />

            <Text style={[styles.label, { color: palette.text }]}>Subtitle</Text>
            <TextInput
              value={habitSubtitle}
              onChangeText={setHabitSubtitle}
              onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
              placeholder="Example: 20 minutes before breakfast"
              placeholderTextColor={palette.mutedText}
              style={[styles.input, { color: palette.text, borderColor: palette.border }]}
            />

            <Text style={[styles.label, { color: palette.text }]}>Icon</Text>
            <View style={styles.iconGrid}>
              {habitIconOptions.map((option) => {
                const selected = option.id === habitIcon;

                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setHabitIcon(option.id)}
                    style={[
                      styles.iconOption,
                      {
                        borderColor: selected ? palette.accent : palette.border,
                        backgroundColor: selected ? 'rgba(76, 175, 255, 0.16)' : 'transparent',
                      },
                    ]}>
                    <SymbolView name={resolveSymbolName(option.icon)} size={18} tintColor={palette.accent} />
                    <Text style={[styles.iconLabel, { color: palette.text }]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.actionRow}>
              <Pressable style={[styles.secondaryBtn, { borderColor: palette.border }]} onPress={() => router.back()}>
                <Text style={[styles.secondaryBtnText, { color: palette.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={saveHabit}
                disabled={!habitTitle.trim()}
                style={[styles.primaryBtn, { backgroundColor: palette.accent, opacity: habitTitle.trim() ? 1 : 0.5 }]}>
                <Text style={styles.primaryBtnText}>Save Habit</Text>
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
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 10,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  iconOption: {
    minWidth: 98,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
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
