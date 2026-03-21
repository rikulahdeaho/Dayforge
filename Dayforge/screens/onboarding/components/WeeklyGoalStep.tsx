import { RefObject, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { feedbackSelection } from '@/components/dayforge/feedback';
import { SurfaceCard } from '@/components/dayforge/Primitives';
import { scrollFocusedInputIntoView } from '@/components/dayforge/scrollFocusedInputIntoView';
import { DayforgePalette } from '@/components/dayforge/types';
import { Fonts } from '@/constants/Typography';

export function WeeklyGoalStep({
  palette,
  scrollRef,
  suggestions,
  selectedGoal,
  onSelectGoal,
  isCustomGoal,
  customGoalValue,
  onChangeCustomGoal,
  targetOptions,
  selectedTarget,
  onSelectTarget,
  onDecreaseTarget,
  onIncreaseTarget,
}: {
  palette: DayforgePalette;
  scrollRef: RefObject<ScrollView | null>;
  suggestions: string[];
  selectedGoal: string;
  onSelectGoal: (value: string) => void;
  isCustomGoal: boolean;
  customGoalValue: string;
  onChangeCustomGoal: (value: string) => void;
  targetOptions: number[];
  selectedTarget: number;
  onSelectTarget: (value: number) => void;
  onDecreaseTarget: () => void;
  onIncreaseTarget: () => void;
}) {
  const hasGoal = selectedGoal.trim().length > 0;
  const [showCustomGoal, setShowCustomGoal] = useState(isCustomGoal);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerBlock}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>What are you building this week?</Text>
        <Text style={[styles.stepContext, { color: palette.mutedText }]}>Pick one focus for the week ahead.</Text>
      </View>

      <View style={styles.stack}>
        {suggestions.map((item) => {
          const selected = selectedGoal === item && !isCustomGoal;

          return (
            <Pressable
              key={item}
              onPress={() => {
                feedbackSelection();
                onSelectGoal(item);
              }}
              style={({ pressed }) => [
                styles.rowCard,
                {
                  borderColor: selected ? 'rgba(141,99,219,0.24)' : palette.border,
                  backgroundColor: selected ? 'rgba(141,99,219,0.22)' : 'rgba(255,255,255,0.035)',
                  transform: [{ scale: pressed ? 0.988 : 1 }],
                },
              ]}>
              <Text style={[styles.rowLabel, { color: palette.text }]}>{item}</Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => setShowCustomGoal((prev) => !prev)}
          style={({ pressed }) => [
            styles.createOwnRow,
            {
              borderColor: isCustomGoal || showCustomGoal ? 'rgba(141,99,219,0.22)' : palette.border,
              backgroundColor: isCustomGoal || showCustomGoal ? 'rgba(141,99,219,0.12)' : 'rgba(255,255,255,0.03)',
              transform: [{ scale: pressed ? 0.988 : 1 }],
            },
          ]}>
          <Text style={[styles.createOwnLabel, { color: palette.text }]}>Create your own</Text>
          <Text style={[styles.createOwnMeta, { color: palette.mutedText }]}>{showCustomGoal ? 'Hide' : 'Add'}</Text>
        </Pressable>

        {showCustomGoal ? (
          <SurfaceCard palette={palette} style={styles.customCard}>
            <TextInput
              value={customGoalValue}
              onChangeText={onChangeCustomGoal}
              onFocus={(event) => scrollFocusedInputIntoView(scrollRef, event.nativeEvent.target)}
              placeholder="Write your focus"
              placeholderTextColor={palette.mutedText}
              style={[styles.customInput, { color: palette.text, borderColor: 'rgba(141,99,219,0.18)' }]}
            />
          </SurfaceCard>
        ) : null}
      </View>

      {hasGoal ? (
        <SurfaceCard palette={palette} style={styles.previewCard}>
          <View style={styles.previewHeaderRow}>
            <View style={styles.previewCopy}>
              <Text style={[styles.previewEyebrow, { color: palette.mutedText }]}>This week</Text>
              <Text style={[styles.previewTitle, { color: palette.text }]} numberOfLines={2}>
                {selectedGoal}
              </Text>
            </View>

            <View style={styles.previewTargetPill}>
              <Text style={[styles.previewTarget, { color: palette.mutedText }]}>Target</Text>
              <Text style={[styles.previewTargetValue, { color: palette.text }]}>{selectedTarget}</Text>
            </View>
          </View>

          <View style={styles.targetGroup}>
            <Text style={[styles.targetLabel, { color: palette.mutedText }]}>Target</Text>
            <View style={[styles.stepperWrap, { borderColor: palette.border, backgroundColor: 'rgba(255,255,255,0.03)' }]}>
              <Pressable
                onPress={onDecreaseTarget}
                style={({ pressed }) => [
                  styles.stepperButton,
                  {
                    borderColor: palette.border,
                    backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
                  },
                ]}>
                <Text style={[styles.stepperSymbol, { color: palette.text }]}>-</Text>
              </Pressable>

              <View style={styles.stepperValueWrap}>
                <Text style={[styles.stepperValue, { color: palette.text }]}>{selectedTarget}</Text>
                <Text style={[styles.stepperUnit, { color: palette.mutedText }]}>times</Text>
              </View>

              <Pressable
                onPress={onIncreaseTarget}
                style={({ pressed }) => [
                  styles.stepperButton,
                  {
                    borderColor: palette.border,
                    backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
                  },
                ]}>
                <Text style={[styles.stepperSymbol, { color: palette.text }]}>+</Text>
              </Pressable>
            </View>

            <View style={styles.targetWrap}>
              {targetOptions.map((value) => {
                const selected = selectedTarget === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => {
                      feedbackSelection();
                      onSelectTarget(value);
                    }}
                    style={({ pressed }) => [
                      styles.targetChip,
                      {
                        borderColor: selected ? 'rgba(141,99,219,0.2)' : palette.border,
                        backgroundColor: selected ? 'rgba(141,99,219,0.2)' : 'rgba(255,255,255,0.03)',
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      },
                    ]}>
                    <Text style={[styles.targetText, { color: selected ? palette.text : palette.mutedText }]}>{value}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </SurfaceCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  headerBlock: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    fontFamily: Fonts.heading,
  },
  stepContext: {
    fontSize: 15,
    lineHeight: 22,
  },
  stack: {
    gap: 8,
  },
  rowCard: {
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  createOwnRow: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createOwnLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  createOwnMeta: {
    fontSize: 13,
    fontWeight: '600',
  },
  customCard: {
    padding: 0,
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  previewCard: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  previewCopy: {
    flex: 1,
    gap: 4,
  },
  previewEyebrow: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  previewTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    fontFamily: Fonts.heading,
  },
  previewTargetPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(141,99,219,0.12)',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  previewTarget: {
    fontSize: 11,
    fontWeight: '700',
  },
  previewTargetValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  targetGroup: {
    gap: 10,
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepperWrap: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSymbol: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '500',
  },
  stepperValueWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  stepperValue: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    fontFamily: Fonts.heading,
  },
  stepperUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
  targetWrap: {
    flexDirection: 'row',
    gap: 10,
  },
  targetChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  targetText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
