import { Image, StyleSheet, Switch, Text, View } from 'react-native';

import { DayforgePalette } from '@/components/dayforge/types';
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
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View />

        <View style={[styles.modeToggle, { borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.025)' }]}>
          <Text style={[styles.modeLabel, { color: palette.mutedText }]}>Dark mode</Text>
          <Switch
            value={darkMode}
            onValueChange={onSetDarkMode}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(141,99,219,0.72)' }}
            thumbColor="#F8F5FF"
          />
        </View>
      </View>

      <View style={styles.hero}>
        <View style={[styles.brandBadge, { borderColor: 'rgba(141,99,219,0.36)', backgroundColor: '#F6F3FB' }]}>
          <Image source={require('../../../assets/images/DayforgeLogo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={[styles.eyebrow, { color: palette.mutedText }]}>DAYFORGE</Text>
        <Text style={[styles.headline, { color: palette.text }]}>Build better days.</Text>
        <Text style={[styles.subheadline, { color: palette.mutedText }]}>Small steps. Clear direction.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 560,
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  brandBadge: {
    width: 104,
    height: 104,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#8D63DB',
    shadowOpacity: 0.32,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  logoImage: {
    width: 54,
    height: 54,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 56,
    paddingBottom: 120,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 2.8,
    fontWeight: '700',
    marginBottom: 14,
  },
  headline: {
    fontSize: 48,
    lineHeight: 54,
    textAlign: 'center',
    fontWeight: '800',
    fontFamily: Fonts.heading,
    marginBottom: 14,
  },
  subheadline: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
});
