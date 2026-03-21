import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { scrollFocusedInputIntoView } from '@/components/dayforge/scrollFocusedInputIntoView';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import Colors from '@/constants/Colors';
import { Type } from '@/constants/Typography';
import { useAppState } from '@/store/appState';
import { getCurrentMondayBasedDayIndex, getDateForMondayBasedDayIndex } from '@/store/appState.helpers';
import { TaskCategory } from '@/types';

const categories: { id: TaskCategory; label: string }[] = [
  { id: 'must-do', label: 'Must do' },
  { id: 'good-to-do', label: 'Good to do' },
  { id: 'wellbeing', label: 'Personal / wellbeing' },
];

export default function AddTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ dayIndex?: string }>();
  const { addTask, state } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;
  const [taskTitle, setTaskTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('must-do');
  const scrollRef = useRef<ScrollView>(null);

  const selectedDayIndex = useMemo(() => {
    const parsed = Number(params.dayIndex);
    if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 6) return parsed;
    return getCurrentMondayBasedDayIndex();
  }, [params.dayIndex]);

  const selectedDayLabel = getDateForMondayBasedDayIndex(selectedDayIndex).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const saveTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Task title missing', 'Please enter a task title.');
      return;
    }

    addTask({ title: taskTitle, dayIndex: selectedDayIndex, category });
    router.back();
  };

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safe}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: palette.text }]}>Add Task</Text>
            <Text style={[styles.subtitle, { color: palette.mutedText }]}>For {selectedDayLabel}</Text>
          </View>

          <SurfaceCard palette={palette} style={styles.formCard}>
            <Text style={[styles.label, { color: palette.text }]}>Task title</Text>
            <TextInput
              value={taskTitle}
              onChangeText={setTaskTitle}
              onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
              placeholder="Example: Send proposal email"
              placeholderTextColor={palette.mutedText}
              style={[styles.input, { color: palette.text, borderColor: palette.border }]}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveTask}
            />
            <Text style={[styles.hint, { color: palette.mutedText }]}>This task will be added to the selected day.</Text>

            <Text style={[styles.label, { color: palette.text, marginTop: 14 }]}>Category</Text>
            <View style={styles.categoryWrap}>
              {categories.map((item) => {
                const selected = category === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setCategory(item.id)}
                    style={[
                      styles.categoryPill,
                      {
                        borderColor: selected ? palette.accent : palette.border,
                        backgroundColor: selected ? palette.cardStrong : 'transparent',
                      },
                    ]}>
                    <Text style={[styles.categoryText, { color: selected ? palette.text : palette.mutedText }]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.actionRow}>
              <Pressable style={[styles.secondaryBtn, { borderColor: palette.border }]} onPress={() => router.back()}>
                <Text style={[styles.secondaryBtnText, { color: palette.text }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveTask} disabled={!taskTitle.trim()} style={[styles.primaryBtn, { backgroundColor: palette.accent, opacity: taskTitle.trim() ? 1 : 0.5 }]}>
                <Text style={[styles.primaryBtnText, { color: palette.onAccent }]}>Save Task</Text>
              </Pressable>
            </View>
          </SurfaceCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 12, paddingTop: 28, paddingBottom: 36 },
  headerRow: { marginBottom: 14 },
  title: { ...Type.screenTitleCompact },
  subtitle: { marginTop: 4, ...Type.bodySmall },
  formCard: { borderRadius: 28 },
  label: { ...Type.label, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, ...Type.body, marginBottom: 8 },
  hint: { ...Type.meta },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 },
  categoryText: { ...Type.metaStrong },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  secondaryBtn: { flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { ...Type.label },
  primaryBtn: { flex: 1, minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { ...Type.label },
});
