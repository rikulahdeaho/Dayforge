import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SurfaceCard, DayforgePalette } from '@/components/dayforge/Primitives';
import { SymbolView } from '@/components/dayforge/SymbolView';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import { Fonts } from '@/constants/Typography';

export function ReflectionCtaCard({
  palette,
  motivation,
  status,
  meta,
  highlight,
  onOpen,
}: {
  palette: DayforgePalette;
  motivation: string;
  status: string;
  meta: string;
  highlight?: boolean;
  onOpen: () => void;
}) {
  return (
    <Pressable onPress={onOpen} style={({ pressed }) => [pressed && styles.pressed]}>
      <SurfaceCard
        palette={palette}
        style={[
          styles.card,
          highlight && {
            borderColor: `${palette.accentSoft}CC`,
            borderWidth: 1,
          },
        ]}>
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: palette.accentStrong }]}>
            <SymbolView
              name={resolveSymbolName({ ios: 'book.pages.fill', android: 'menu_book', web: 'menu_book' })}
              size={18}
              tintColor="#fff"
            />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: palette.text }]}>Daily Reflection</Text>
            <Text style={[styles.body, { color: palette.mutedText }]}>{motivation}</Text>
          </View>
        </View>

        <View style={[styles.statusRow, { borderColor: palette.border }]}>
          <Text style={[styles.statusText, { color: palette.text }]}>{status}</Text>
          <Text style={[styles.statusMeta, { color: palette.accent }]}>{meta}</Text>
        </View>
      </SurfaceCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: Fonts.heading,
    marginBottom: 2,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusRow: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusMeta: {
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
});
