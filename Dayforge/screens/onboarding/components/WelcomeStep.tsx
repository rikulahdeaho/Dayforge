import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { Fonts } from '@/constants/Typography';

export function WelcomeStep({
  palette,
  darkMode,
  onSetDarkMode,
}: {
  palette: DayforgePalette;
  darkMode: boolean;
  onSetDarkMode: (value: boolean) => void;
}) {
  return (
    <SurfaceCard palette={palette} style={styles.card}>
      <View style={styles.wrap}>
        <View style={[styles.logo, { borderColor: palette.border, backgroundColor: 'rgb(248, 248, 246)' }]}>
          <Image source={require('../../../assets/images/DayforgeLogo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={[styles.headline, { color: palette.text }]}>
          Dayforge: Build better days, <Text style={{ color: '#C892FF' }}>one step at a time.</Text>
        </Text>

        <Text style={[styles.fieldLabel, { color: palette.text }]}>Appearance</Text>
        <View style={[styles.appearanceWrap, { borderColor: palette.border }]}>
          <Pressable
            onPress={() => onSetDarkMode(false)}
            style={({ pressed }) => [
              styles.appearanceOption,
              {
                borderColor: !darkMode ? palette.accent : 'transparent',
                backgroundColor: !darkMode ? 'rgba(127,34,255,0.14)' : 'transparent',
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}>
            <Text style={[styles.appearanceText, { color: !darkMode ? '#fff' : palette.text }]}>Light</Text>
          </Pressable>
          <Pressable
            onPress={() => onSetDarkMode(true)}
            style={({ pressed }) => [
              styles.appearanceOption,
              {
                borderColor: darkMode ? palette.accent : 'transparent',
                backgroundColor: darkMode ? 'rgba(127,34,255,0.14)' : 'transparent',
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}>
            <Text style={[styles.appearanceText, { color: darkMode ? '#fff' : palette.text }]}>Dark</Text>
          </Pressable>
        </View>
        <Text style={[styles.supportLine, { color: palette.mutedText }]}>No account needed. Data stays on this device.</Text>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  wrap: {
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: 'center',
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    marginBottom: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B87CFF',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  logoImage: {
    width: 64,
    height: 64,
  },
  headline: {
    fontSize: 44,
    lineHeight: 52,
    textAlign: 'center',
    fontWeight: '800',
    fontFamily: Fonts.heading,
    marginBottom: 20,
    maxWidth: 520,
  },
  fieldLabel: {
    alignSelf: 'stretch',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  appearanceWrap: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    padding: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  appearanceOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appearanceText: {
    fontSize: 15,
    fontWeight: '700',
  },
  supportLine: {
    marginTop: 12,
    alignSelf: 'center',
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.82,
    marginBottom: 2,
  },
});
