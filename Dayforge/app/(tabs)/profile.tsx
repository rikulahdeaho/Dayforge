/**
 * Profile Screen - Settings & User Information
 *
 * Overview:
 * - Displays user profile information and app preferences
 * - Provides access to settings and support links
 * - All interactive items that require backend are placeholder alerts
 *
 * Content:
 * 1. Settings header with back arrow and "Settings" title
 * 2. Profile block with avatar (initials), name, and membership tier:
 *    - Avatar: large circle with initials (e.g., "AR" for Alex Rivers)
 *    - Edit button (small purple chip on avatar)
 *    - User name and "Premium Member" label
 * 3. Account & Productivity section (grouped card):
 *    - Personal Goals row (tap → placeholder alert)
 *    - Reminders row (tap → placeholder alert)
 * 4. Preferences section (grouped card):
 *    - Dark Mode toggle (functional, session-only; no durable storage)
 *    - Export Data row (tap → placeholder alert "available in future version")
 * 5. Support section (grouped card):
 *    - About Dayforge App row (tap → placeholder alert)
 *    - GitHub Repository row (tap → placeholder alert)
 * 6. Centered "Sign Out" button (red text, tap → placeholder alert)
 * 7. Footer with app version "Version 2.4.0 (Build 108)"
 *
 * Interactions:
 * - Dark mode toggle → switches session appearance (visual only, no persistence)
 * - All settings/support items → show placeholder alerts ("available in future version")
 * - No backend/auth/persistence: all settings reset on app reload
 * - Profile data shown is from demo user (Alex Rivers, Premium Member)
 */

import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { DayforgePalette, SurfaceCard } from '@/components/dayforge/Primitives';
import { TopGradientBackground } from '@/components/dayforge/TopGradientBackground';
import { resolveSymbolName } from '@/components/dayforge/resolveSymbolName';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';

const accountRows = [
  {
    id: 'goals',
    title: 'Personal Goals',
    subtitle: 'Manage your weekly targets',
    icon: { ios: 'scope', android: 'track_changes', web: 'track_changes' },
  },
  {
    id: 'reminders',
    title: 'Reminders',
    subtitle: 'Daily habit and reflection alerts',
    icon: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
  },
];

const supportRows = [
  {
    id: 'about',
    title: 'About Dayforge App',
    icon: { ios: 'info.circle.fill', android: 'info', web: 'info' },
  },
  {
    id: 'github',
    title: 'GitHub Repository',
    icon: { ios: 'chevron.left.forwardslash.chevron.right', android: 'code', web: 'code' },
  },
];

function showPlaceholder(featureName: string) {
  Alert.alert(featureName, `${featureName} is available in a future version.`);
}

export default function ProfileScreen() {
  const { state, toggleDarkModeSession, resetAppData, loadMockData } = useAppState();
  const palette = (state.preferences.darkMode ? Colors.dark : Colors.light) as DayforgePalette;

  const confirmResetData = () => {
    Alert.alert('Clear All Data', 'This will remove all habits, tasks, goals, and reflections on this device. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await resetAppData();
              Alert.alert('Data cleared', 'All saved data has been removed.');
            } catch (error) {
              Alert.alert('Clear failed', 'Could not clear saved data. Please try again.');
            }
          })();
        },
      },
    ]);
  };

  const confirmLoadMockData = () => {
    Alert.alert('Load Mock Data', 'This will replace current data with demo data. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Load',
        onPress: () => {
          void (async () => {
            try {
              await loadMockData();
              Alert.alert('Mock data loaded', 'Demo data is now active.');
            } catch (error) {
              Alert.alert('Load failed', 'Could not load mock data. Please try again.');
            }
          })();
        },
      },
    ]);
  };

  return (
    <View style={[styles.safe, { backgroundColor: palette.background }]}>
      <TopGradientBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: palette.text }]}>Settings</Text>
          </View>
        </View>

        <Text style={[styles.sectionKicker, { color: palette.accent }]}>ACCOUNT & PRODUCTIVITY</Text>
        <SurfaceCard palette={palette} style={styles.groupCard}>
          {accountRows.map((row, idx) => (
            <View key={row.id}>
              <Pressable style={styles.settingRow} onPress={() => showPlaceholder(row.title)}>
                <View style={[styles.settingIcon, { backgroundColor: palette.cardStrong }]}>
                  <SymbolView name={resolveSymbolName(row.icon)} size={20} tintColor={palette.accent} />
                </View>
                <View style={styles.settingCopy}>
                  <Text style={[styles.settingTitle, { color: palette.text }]}>{row.title}</Text>
                  <Text style={[styles.settingSubtitle, { color: palette.mutedText }]}>{row.subtitle}</Text>
                </View>
                <SymbolView
                  name={resolveSymbolName({ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' })}
                  size={20}
                  tintColor={palette.mutedText}
                />
              </Pressable>
              {idx < accountRows.length - 1 ? (
                <View style={[styles.settingDivider, { backgroundColor: palette.border }]} />
              ) : null}
            </View>
          ))}
        </SurfaceCard>

        <Text style={[styles.sectionKicker, { color: palette.accent }]}>PREFERENCES</Text>
        <SurfaceCard palette={palette} style={styles.groupCard}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: palette.cardStrong }]}>
              <SymbolView
                name={resolveSymbolName({ ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' })}
                size={20}
                tintColor={palette.accent}
              />
            </View>
            <View style={styles.settingCopy}>
              <Text style={[styles.settingTitle, { color: palette.text }]}>Dark Mode</Text>
              <Text style={[styles.settingSubtitle, { color: palette.mutedText }]}>Session-only preference</Text>
            </View>
            <Switch
              value={state.preferences.darkMode}
              onValueChange={toggleDarkModeSession}
              trackColor={{ false: palette.border, true: palette.accent }}
              thumbColor="#ffffff"
            />
          </View>
          <View style={[styles.settingDivider, { backgroundColor: palette.border }]} />
          <Pressable style={styles.settingRow} onPress={() => showPlaceholder('Export Data')}>
            <View style={[styles.settingIcon, { backgroundColor: palette.cardStrong }]}>
              <SymbolView
                name={resolveSymbolName({ ios: 'square.and.arrow.up', android: 'ios_share', web: 'ios_share' })}
                size={20}
                tintColor={palette.accent}
              />
            </View>
            <View style={styles.settingCopy}>
              <Text style={[styles.settingTitle, { color: palette.text }]}>Export Data</Text>
              <Text style={[styles.settingSubtitle, { color: palette.mutedText }]}>Available in a future version</Text>
            </View>
            <SymbolView
              name={resolveSymbolName({ ios: 'arrow.down.circle', android: 'download', web: 'download' })}
              size={20}
              tintColor={palette.mutedText}
            />
          </Pressable>
        </SurfaceCard>

        <Text style={[styles.sectionKicker, { color: palette.accent }]}>SUPPORT</Text>
        <SurfaceCard palette={palette} style={styles.groupCard}>
          {supportRows.map((row, idx) => (
            <View key={row.id}>
              <Pressable style={styles.settingRow} onPress={() => showPlaceholder(row.title)}>
                <View style={[styles.settingIcon, { backgroundColor: palette.cardStrong }]}>
                  <SymbolView name={resolveSymbolName(row.icon)} size={20} tintColor={palette.accent} />
                </View>
                <View style={styles.settingCopy}>
                  <Text style={[styles.settingTitle, { color: palette.text }]}>{row.title}</Text>
                </View>
                <SymbolView
                  name={resolveSymbolName({ ios: 'arrow.up.forward.app', android: 'open_in_new', web: 'open_in_new' })}
                  size={20}
                  tintColor={palette.mutedText}
                />
              </Pressable>
              {idx < supportRows.length - 1 ? (
                <View style={[styles.settingDivider, { backgroundColor: palette.border }]} />
              ) : null}
            </View>
          ))}
        </SurfaceCard>

        <Pressable onPress={confirmResetData}>
          <Text style={styles.signOut}>Clear All Data</Text>
        </Pressable>
        <Pressable onPress={confirmLoadMockData}>
          <Text style={[styles.signOut, { color: palette.accent, marginTop: 8 }]}>Load Mock Data</Text>
        </Pressable>
        <Text style={[styles.version, { color: palette.mutedText }]}>Version 0.0.1 (Build 1 MVP)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 10,
    paddingTop: 65,
    paddingBottom: 124,
  },
  titleRow: {
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kicker: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#d3b08a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFace: {
    fontSize: 28,
    fontWeight: '700',
    color: '#301505',
  },
  editChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    marginLeft: 68,
  },
  name: {
    marginTop: 10,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  member: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionKicker: {
    marginBottom: 10,
    paddingHorizontal: 6,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  groupCard: {
    paddingVertical: 8,
    marginBottom: 20,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingCopy: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  settingSubtitle: {
    fontSize: 13,
    lineHeight: 18,
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
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
  },
});
