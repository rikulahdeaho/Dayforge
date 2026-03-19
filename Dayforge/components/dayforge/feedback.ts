import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function runHaptic(action: () => Promise<void>) {
  if (Platform.OS === 'web') {
    return;
  }
  void action().catch(() => {});
}

export function feedbackTap() {
  runHaptic(() => Haptics.selectionAsync());
}

export function feedbackSelection() {
  runHaptic(() => Haptics.selectionAsync());
}

export function feedbackComplete() {
  runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function feedbackSuccess() {
  runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
