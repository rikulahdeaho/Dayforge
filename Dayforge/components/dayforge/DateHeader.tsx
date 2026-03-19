import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { DayforgePalette } from './types';
import { resolveSymbolName } from './resolveSymbolName';

type DateHeaderProps = {
  palette: DayforgePalette;
  dateText: string;
  title: string;
  subtitle?: string;
};

export function DateHeader({ palette, dateText, title, subtitle }: DateHeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifications = [
    'Dayforge update: smarter weekly insights are coming soon.',
    'Tip: Complete 3 tasks today to keep your streak alive.',
    'Reminder: Evening reflection unlocks better weekly trends.',
  ];

  return (
    <>
      <View style={styles.header}>
        <View>
          <View style={styles.dateRow}>
            <SymbolView
              name={resolveSymbolName({ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' })}
              size={16}
              tintColor={palette.accent}
            />
            <Text style={[styles.dateText, { color: palette.accent }]}>{dateText}</Text>
          </View>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: palette.mutedText }]}>{subtitle}</Text> : null}
          </View>
        </View>
        <Pressable
          onPress={() => setIsNotificationsOpen(true)}
          style={[styles.bellWrap, { backgroundColor: palette.cardStrong, borderColor: palette.border }]}>
          <SymbolView
            name={resolveSymbolName({ ios: 'bell.fill', android: 'notifications', web: 'notifications' })}
            size={22}
            tintColor={palette.accent}
          />
        </Pressable>
      </View>

      <Modal visible={isNotificationsOpen} transparent animationType="fade" onRequestClose={() => setIsNotificationsOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: palette.cardStrong, borderColor: palette.border }]}>
            <Text style={[styles.modalTitle, { color: palette.text }]}>Notifications</Text>
            {notifications.map((item) => (
              <View key={item} style={[styles.notificationRow, { borderColor: palette.border }]}>
                <Text style={[styles.notificationText, { color: palette.text }]}>{item}</Text>
              </View>
            ))}
            <Pressable
              onPress={() => setIsNotificationsOpen(false)}
              style={[styles.closeButton, { backgroundColor: palette.accent }]}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  bellWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  notificationRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 8,
    borderRadius: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
