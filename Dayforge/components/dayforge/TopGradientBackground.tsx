import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

export function TopGradientBackground() {
  return (
    <View pointerEvents="none" style={styles.backgroundLayer}>
      <LinearGradient
        colors={['rgba(111,75,184,0.14)', 'rgba(111,75,184,0.04)', 'transparent']}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        style={styles.topGlow}
      />
      <LinearGradient
        colors={['rgba(54,38,82,0.12)', 'transparent']}
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
