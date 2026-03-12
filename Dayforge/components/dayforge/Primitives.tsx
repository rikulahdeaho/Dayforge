import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

export type DayforgePalette = {
  background: string;
  text: string;
  mutedText: string;
  card: string;
  cardStrong: string;
  border: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  shadow: string;
};

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  palette: DayforgePalette;
};

export function SectionTitle({
  title,
  action,
  palette,
}: {
  title: string;
  action?: string;
  palette: DayforgePalette;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text>
      {action ? <Text style={[styles.sectionAction, { color: palette.accent }]}>{action}</Text> : null}
    </View>
  );
}

export function SurfaceCard({ children, style, palette }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
          shadowColor: palette.shadow,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function GradientCard({
  children,
  palette,
  style,
  colors,
}: CardProps & { colors?: [string, string, string] }) {
  return (
    <LinearGradient
      colors={colors ?? [palette.accentStrong, palette.accent, '#7f22ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        {
          borderColor: 'rgba(255,255,255,0.12)',
          shadowColor: palette.accentStrong,
        },
        style,
      ]}>
      {children}
    </LinearGradient>
  );
}

export function GlowButton({
  label,
  palette,
  style,
  textStyle,
}: {
  label: string;
  palette: DayforgePalette;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <LinearGradient
      colors={[palette.accentStrong, palette.accent, '#9f4dff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.glowButton, { shadowColor: palette.accentStrong }, style]}>
      <Text style={[styles.glowButtonText, { color: '#fff' }, textStyle]}>{label}</Text>
    </LinearGradient>
  );
}

export function DashedAction({
  label,
  icon,
  palette,
  style,
}: {
  label: string;
  icon?: ReactNode;
  palette: DayforgePalette;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      style={[
        styles.dashed,
        {
          borderColor: palette.border,
          backgroundColor: 'rgba(27, 16, 48, 0.35)',
        },
        style,
      ]}>
      <View style={styles.dashedInner}>
        {icon}
        <Text style={[styles.dashedLabel, { color: palette.mutedText }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function ProgressTrack({
  value,
  palette,
  style,
  tint,
}: {
  value: number;
  palette: DayforgePalette;
  style?: StyleProp<ViewStyle>;
  tint?: string;
}) {
  return (
    <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.14)' }, style]}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${Math.max(0, Math.min(100, value * 100))}%`,
            backgroundColor: tint ?? '#ffffff',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 6,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 38,
    fontFamily: 'SpaceMono',
    lineHeight: 42,
  },
  sectionAction: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  glowButton: {
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  glowButtonText: {
    fontSize: 20,
    fontFamily: 'SpaceMono',
    lineHeight: 24,
  },
  dashed: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 24,
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dashedLabel: {
    fontSize: 20,
    fontWeight: '600',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});
