import { RefObject, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { feedbackSelection } from '@/components/dayforge/feedback';
import { SurfaceCard } from '@/components/dayforge/Primitives';
import { scrollFocusedInputIntoView } from '@/components/dayforge/scrollFocusedInputIntoView';
import { DayforgePalette } from '@/components/dayforge/types';
import { Fonts } from '@/constants/Typography';

export function ProfileStep({
  palette,
  name,
  setName,
  nameInputRef,
  scrollRef,
  focusOptions,
  selectedFocuses,
  maxPersonalGoals,
  onToggleGoal,
}: {
  palette: DayforgePalette;
  name: string;
  setName: (value: string) => void;
  nameInputRef: RefObject<TextInput | null>;
  scrollRef: RefObject<ScrollView | null>;
  focusOptions: string[];
  selectedFocuses: string[];
  maxPersonalGoals: number;
  onToggleGoal: (goal: string) => void;
}) {
  const [inputFocused, setInputFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerBlock}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>What do you want more of?</Text>
        <Text style={[styles.stepContext, { color: palette.mutedText }]}>Choose up to two things to shape your start.</Text>
      </View>

      <SurfaceCard palette={palette} style={styles.inputCard}>
        <TextInput
          ref={nameInputRef}
          value={name}
          onChangeText={setName}
          onFocus={(event) => {
            setInputFocused(true);
            scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target);
          }}
          onBlur={() => setInputFocused(false)}
          placeholder="What should we call you?"
          placeholderTextColor={palette.mutedText}
          style={[
            styles.input,
            {
              color: palette.text,
              borderColor: inputFocused ? 'rgba(141,99,219,0.34)' : 'transparent',
              backgroundColor: inputFocused ? 'rgba(141,99,219,0.08)' : 'rgba(255,255,255,0.02)',
            },
          ]}
        />
      </SurfaceCard>

      <View style={styles.goalGrid}>
        {focusOptions.map((goalOption) => {
          const selected = selectedFocuses.includes(goalOption);
          const atLimit = !selected && selectedFocuses.length >= maxPersonalGoals;

          return (
            <Pressable
              key={goalOption}
              onPress={() => {
                if (atLimit) {
                  return;
                }
                feedbackSelection();
                onToggleGoal(goalOption);
              }}
              style={({ pressed }) => [
                styles.optionCard,
                {
                  borderColor: selected ? 'rgba(141,99,219,0.24)' : palette.border,
                  backgroundColor: selected ? 'rgba(141,99,219,0.22)' : 'rgba(255,255,255,0.035)',
                  shadowColor: '#8D63DB',
                  shadowOpacity: Platform.OS === 'ios' && selected ? 0.18 : 0,
                  opacity: atLimit ? 0.55 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}>
              <View style={styles.optionTopRow}>
                <Text style={[styles.optionLabel, { color: palette.text }]}>{goalOption}</Text>
                <View
                  style={[
                    styles.checkDot,
                    {
                      borderColor: selected ? 'rgba(194,170,243,0.46)' : 'rgba(255,255,255,0.12)',
                      backgroundColor: selected ? 'rgba(194,170,243,0.18)' : 'rgba(255,255,255,0.03)',
                    },
                  ]}>
                  {selected ? <View style={styles.checkDotInner} /> : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 18,
  },
  headerBlock: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    fontFamily: Fonts.heading,
  },
  stepContext: {
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 16,
  },
  inputCard: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '48%',
    minHeight: 74,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 0,
  },
  optionTopRow: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  optionLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  checkDot: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDotInner: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E8DFFF',
  },
});
