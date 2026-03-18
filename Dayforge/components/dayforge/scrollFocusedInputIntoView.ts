import type { RefObject } from 'react';
import { Platform, type ScrollView } from 'react-native';

export function scrollFocusedInputIntoView(
  scrollRef: RefObject<ScrollView | null>,
  target: number | null | undefined,
  customKeyboardOffset?: number
) {
  if (!target) {
    return;
  }

  const keyboardOffset = customKeyboardOffset ?? (Platform.select({ ios: 110, android: 130, default: 120 }) ?? 120);

  requestAnimationFrame(() => {
    const scrollResponder = (scrollRef.current as any)?.getScrollResponder?.() ?? scrollRef.current;
    scrollResponder?.scrollResponderScrollNativeHandleToKeyboard?.(target, keyboardOffset, true);
  });
}
