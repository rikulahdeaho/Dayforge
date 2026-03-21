import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SurfaceCard, DayforgePalette } from '@/components/dayforge/Primitives';
import { SymbolView } from '@/components/dayforge/SymbolView';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import { Fonts, Type } from '@/constants/Typography';

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
            borderColor: `${palette.accentSoft}66`,
            borderWidth: 1,
          },
        ]}>
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: `${palette.accentStrong}33`, borderColor: `${palette.accentSoft}44` }]}>
            <SymbolView
              name={resolveSymbolName({ ios: 'book.pages.fill', android: 'menu_book', web: 'menu_book' })}
              size={18}
              tintColor={palette.accentSoft}
            />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: palette.text }]}>Daily Reflection</Text>
            <Text style={[styles.body, { color: palette.mutedText }]}>{motivation}</Text>
          </View>
        </View>

        <View style={[styles.statusRow, { borderColor: palette.border }]}>
          <Text style={[styles.statusText, { color: palette.text }]}>{status}</Text>
          <Text style={[styles.statusMeta, { color: palette.mutedText }]}>{meta}</Text>
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    ...Type.cardTitle,
    fontFamily: Fonts.heading,
    marginBottom: 2,
  },
  body: {
    ...Type.bodySmall,
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
    ...Type.metaStrong,
  },
  statusMeta: {
    ...Type.meta,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
});
