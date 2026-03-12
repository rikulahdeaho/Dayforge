import { SymbolView } from 'expo-symbols';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { DayforgePalette, SectionTitle, SurfaceCard } from '@/components/dayforge/Primitives';

const accountRows = [
  {
    id: 'goals',
    title: 'Personal Goals',
    subtitle: 'Manage your weekly targets',
    icon: { ios: 'scope', android: 'track_changes', web: 'track_changes' },
    trailing: 'chevron',
  },
  {
    id: 'reminders',
    title: 'Reminders',
    subtitle: 'Daily habit and reflection alerts',
    icon: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
    trailing: 'chevron',
  },
];

const preferenceRows = [
  {
    id: 'dark',
    title: 'Dark Mode',
    subtitle: 'Keep this premium night palette',
    icon: { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' },
    trailing: 'toggle',
  },
  {
    id: 'export',
    title: 'Export Data',
    subtitle: 'CSV or JSON format',
    icon: { ios: 'square.and.arrow.up', android: 'ios_share', web: 'ios_share' },
    trailing: 'download',
  },
];

const supportRows = [
  {
    id: 'about',
    title: 'About Dayforge App',
    subtitle: '',
    icon: { ios: 'info.circle.fill', android: 'info', web: 'info' },
    trailing: 'external',
  },
  {
    id: 'github',
    title: 'GitHub Repository',
    subtitle: '',
    icon: { ios: 'chevron.left.forwardslash.chevron.right', android: 'code', web: 'code' },
    trailing: 'external',
  },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme] as DayforgePalette;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor={palette.text} />
          <Text style={[styles.title, { color: palette.text }]}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.profileWrap}>
          <View style={[styles.avatarRing, { borderColor: palette.accent }]}> 
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarFace}>AR</Text>
            </View>
          </View>
          <View style={[styles.editChip, { backgroundColor: palette.accentStrong }]}>
            <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={16} tintColor="#fff" />
          </View>
          <Text style={[styles.name, { color: palette.text }]}>Alex Rivers</Text>
          <Text style={[styles.member, { color: palette.accent }]}>Premium Member</Text>
        </View>

        <Text style={[styles.sectionKicker, { color: palette.mutedText }]}>ACCOUNT AND PRODUCTIVITY</Text>
        <SurfaceCard palette={palette} style={styles.groupCard}>
          {accountRows.map((row, idx) => (
            <View key={row.id}>
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: palette.cardStrong }]}>
                  <SymbolView name={row.icon as any} size={20} tintColor={palette.accent} />
                </View>
                <View style={styles.settingCopy}>
                  <Text style={[styles.settingTitle, { color: palette.text }]}>{row.title}</Text>
                  <Text style={[styles.settingSubtitle, { color: palette.mutedText }]}>{row.subtitle}</Text>
                </View>
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                  size={20}
                  tintColor={palette.mutedText}
                />
              </View>
              {idx < accountRows.length - 1 ? (
                <View style={[styles.settingDivider, { backgroundColor: palette.border }]} />
              ) : null}
            </View>
          ))}
        </SurfaceCard>

        <Text style={[styles.sectionKicker, { color: palette.mutedText }]}>PREFERENCES</Text>
        <SurfaceCard palette={palette} style={styles.groupCard}>
          {preferenceRows.map((row, idx) => (
            <View key={row.id}>
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: palette.cardStrong }]}>
                  <SymbolView name={row.icon as any} size={20} tintColor={palette.accent} />
                </View>
                <View style={styles.settingCopy}>
                  <Text style={[styles.settingTitle, { color: palette.text }]}>{row.title}</Text>
                  <Text style={[styles.settingSubtitle, { color: palette.mutedText }]}>{row.subtitle}</Text>
                </View>
                {row.trailing === 'toggle' ? (
                  <Switch
                    value
                    trackColor={{ false: palette.border, true: palette.accent }}
                    thumbColor="#ffffff"
                  />
                ) : (
                  <SymbolView
                    name={{ ios: 'arrow.down.circle', android: 'download', web: 'download' }}
                    size={20}
                    tintColor={palette.mutedText}
                  />
                )}
              </View>
              {idx < preferenceRows.length - 1 ? (
                <View style={[styles.settingDivider, { backgroundColor: palette.border }]} />
              ) : null}
            </View>
          ))}
        </SurfaceCard>

        <Text style={[styles.sectionKicker, { color: palette.mutedText }]}>SUPPORT</Text>
        <SurfaceCard palette={palette} style={styles.groupCard}>
          {supportRows.map((row, idx) => (
            <View key={row.id}>
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: palette.cardStrong }]}>
                  <SymbolView name={row.icon as any} size={20} tintColor={palette.accent} />
                </View>
                <View style={styles.settingCopy}>
                  <Text style={[styles.settingTitle, { color: palette.text }]}>{row.title}</Text>
                </View>
                <SymbolView
                  name={{ ios: 'arrow.up.forward.app', android: 'open_in_new', web: 'open_in_new' }}
                  size={20}
                  tintColor={palette.mutedText}
                />
              </View>
              {idx < supportRows.length - 1 ? (
                <View style={[styles.settingDivider, { backgroundColor: palette.border }]} />
              ) : null}
            </View>
          ))}
        </SurfaceCard>

        <Text style={styles.signOut}>Sign Out</Text>
        <Text style={[styles.version, { color: palette.mutedText }]}>Version 2.4.0 (Build 108)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 124,
  },
  titleRow: {
    marginTop: 4,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'SpaceMono',
    fontSize: 30,
    lineHeight: 34,
  },
  profileWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#d3b08a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFace: {
    fontFamily: 'SpaceMono',
    fontSize: 34,
    color: '#301505',
  },
  editChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    marginLeft: 90,
  },
  name: {
    marginTop: 14,
    fontFamily: 'SpaceMono',
    fontSize: 34,
    lineHeight: 38,
  },
  member: {
    fontSize: 27,
    marginTop: 4,
  },
  sectionKicker: {
    marginBottom: 10,
    fontSize: 16,
    fontFamily: 'SpaceMono',
    letterSpacing: 1.6,
  },
  groupCard: {
    paddingVertical: 8,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingCopy: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 25,
    fontWeight: '700',
  },
  settingSubtitle: {
    fontSize: 19,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    marginVertical: 4,
  },
  signOut: {
    marginTop: 14,
    marginBottom: 32,
    textAlign: 'center',
    color: '#ff4d83',
    fontFamily: 'SpaceMono',
    fontSize: 34,
    lineHeight: 38,
  },
  version: {
    textAlign: 'center',
    fontSize: 18,
  },
});
