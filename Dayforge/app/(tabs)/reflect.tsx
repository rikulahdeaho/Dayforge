import { SymbolView } from 'expo-symbols';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { DayforgePalette, GlowButton, SectionTitle, SurfaceCard } from '@/components/dayforge/Primitives';

const moods = [
  { id: 'sad', emoji: '😔', label: 'Sad' },
  { id: 'neutral', emoji: '😐', label: 'Neutral' },
  { id: 'good', emoji: '😊', label: 'Good', selected: true },
  { id: 'happy', emoji: '🤩', label: 'Happy' },
];

const history = [
  { id: '1', mood: '🤩', date: 'Yesterday, Oct 22', preview: 'Had an amazing dinner with t...' },
  { id: '2', mood: '😊', date: 'Oct 21', preview: 'Finally finished reading that ...' },
  { id: '3', mood: '😐', date: 'Oct 20', preview: 'A productive but very busy F...' },
];

type PlatformIconName = {
  ios: string;
  android: string;
  web: string;
};

function resolveSymbolName(icon: PlatformIconName) {
  return (
    Platform.select({
      ios: icon.ios,
      android: icon.android,
      default: icon.web,
    }) ?? icon.web
  );
}

export default function ReflectionScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme] as DayforgePalette;

  const handleSaveReflection = () => {
    Alert.alert('Save Reflection', 'Handler toimii. Tallennusta ei ole vielä käytössä.');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View>
            <Text style={[styles.dateText, { color: palette.accent }]}>Monday, Oct 23</Text>
            <SectionTitle title="Daily Reflection" palette={palette} />
          </View>
          <View style={[styles.settings, { backgroundColor: palette.cardStrong }]}> 
            <SymbolView
              name={resolveSymbolName({ ios: 'gearshape.fill', android: 'settings', web: 'settings' })}
              size={20}
              tintColor={palette.accent}
            />
          </View>
        </View>

        <Text style={[styles.prompt, { color: palette.text }]}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          {moods.map((mood) => (
            <View
              key={mood.id}
              style={[
                styles.moodCard,
                {
                  backgroundColor: palette.card,
                  borderColor: mood.selected ? palette.accent : palette.border,
                  shadowColor: mood.selected ? palette.accentStrong : 'transparent',
                },
              ]}>
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  {
                    color: mood.selected ? palette.accent : palette.text,
                    fontWeight: mood.selected ? '700' : '500',
                  },
                ]}>
                {mood.label}
              </Text>
            </View>
          ))}
        </View>

        <SectionTitle title="Today's Prompts" palette={palette} />

        <SurfaceCard palette={palette} style={styles.entryCard}>
          <Text style={[styles.entryHeading, { color: palette.accent }]}>What went well today?</Text>
          <TextInput
            multiline
            numberOfLines={4}
            placeholder="I completed the design project ahead of schedule..."
            placeholderTextColor={palette.mutedText}
            style={[
              styles.textArea,
              {
                backgroundColor: palette.cardStrong,
                color: palette.text,
              },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard palette={palette} style={styles.entryCard}>
          <Text style={[styles.entryHeading, { color: palette.accent }]}>What are you grateful for?</Text>
          <TextInput
            multiline
            numberOfLines={4}
            placeholder="A warm cup of coffee and morning sunlight..."
            placeholderTextColor={palette.mutedText}
            style={[
              styles.textArea,
              {
                backgroundColor: palette.cardStrong,
                color: palette.text,
              },
            ]}
          />
        </SurfaceCard>

        <GlowButton
          label="Save Reflection"
          palette={palette}
          style={styles.saveButton}
          textStyle={styles.saveButtonText}
          onPress={handleSaveReflection}
        />

        <SectionTitle title="History" action="View All" palette={palette} />
        {history.map((entry) => (
          <SurfaceCard key={entry.id} palette={palette} style={styles.historyItem}>
            <View style={[styles.historyEmoji, { backgroundColor: palette.cardStrong }]}>
              <Text style={styles.moodEmoji}>{entry.mood}</Text>
            </View>
            <View style={styles.historyCopy}>
              <Text style={[styles.historyDate, { color: palette.mutedText }]}>{entry.date}</Text>
              <Text style={[styles.historyPreview, { color: palette.text }]}>{entry.preview}</Text>
            </View>
            <SymbolView
              name={resolveSymbolName({ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' })}
              size={20}
              tintColor={palette.mutedText}
            />
          </SurfaceCard>
        ))}
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
    paddingBottom: 128,
  },
  topRow: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateText: {
    marginBottom: 8,
    fontSize: 20,
  },
  settings: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prompt: {
    fontSize: 22,
    marginBottom: 14,
    fontWeight: '700',
  },
  moodRow: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  moodCard: {
    flex: 1,
    minHeight: 110,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.42,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  moodEmoji: {
    fontSize: 34,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 22,
  },
  entryCard: {
    marginBottom: 14,
  },
  entryHeading: {
    fontSize: 28,
    fontFamily: 'SpaceMono',
    lineHeight: 32,
    marginBottom: 10,
  },
  textArea: {
    borderRadius: 18,
    minHeight: 138,
    padding: 14,
    fontSize: 18,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginVertical: 8,
  },
  saveButtonText: {
    fontSize: 24,
    lineHeight: 28,
  },
  historyItem: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
  },
  historyEmoji: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyCopy: {
    flex: 1,
  },
  historyDate: {
    fontSize: 18,
  },
  historyPreview: {
    fontSize: 26,
    lineHeight: 30,
  },
});
