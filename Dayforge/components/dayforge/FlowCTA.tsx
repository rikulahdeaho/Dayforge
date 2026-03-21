import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/store/appState';

import { feedbackTap } from './feedback';
import { getFlowCTA, getFlowStatus, type FlowStep } from './flow';
import { GlowButton } from './GlowButton';
import { DayforgePalette } from './types';

export function FlowStatusRow({ palette }: { palette: DayforgePalette }) {
  const { state } = useAppState();
  const status = getFlowStatus(state);
  const inlineStatus = status.secondary ? `${status.primary} · ${status.secondary}` : status.primary;

  return (
    <View style={styles.statusWrap}>
      <Text style={[styles.stateRowText, { color: palette.text }]}>{inlineStatus}</Text>
    </View>
  );
}

export function FlowCTA({ palette, currentStep }: { palette: DayforgePalette; currentStep?: FlowStep }) {
  const router = useRouter();
  const { state } = useAppState();
  const action = getFlowCTA(state);
  const isAlreadyOnStep = currentStep === action.step;

  if (isAlreadyOnStep) {
    return null;
  }

  return (
    <View style={styles.ctaWrap}>
      <GlowButton
        label={action.label}
        palette={palette}
        style={styles.ctaButton}
        textStyle={styles.ctaButtonText}
        onPress={() => {
          feedbackTap();
          router.push(action.route as never);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  statusWrap: {
    marginBottom: 8,
  },
  ctaWrap: {
    marginBottom: 16,
  },
  stateRowText: {
    paddingHorizontal: 6,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  ctaButton: {
    borderRadius: 16,
    paddingVertical: 11,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
});
