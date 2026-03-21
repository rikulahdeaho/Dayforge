import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';

export function TopGradientBackground() {
  const { state } = useAppState();
  const palette = state.preferences.darkMode ? Colors.dark : Colors.light;
  return (
    <View pointerEvents="none" style={styles.backgroundLayer}>
      <LinearGradient
        colors={[palette.topGlowStart, palette.topGlowMid, 'transparent']}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        style={styles.topGlow}
      />
      <LinearGradient
        colors={[palette.sideGlowStart, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.sideGlow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  topGlow: {
    position: 'absolute',
    top: -80,
    right: -90,
    width: 380,
    height: 380,
    borderRadius: 999,
  },
  sideGlow: {
    position: 'absolute',
    bottom: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 999,
  },
});
