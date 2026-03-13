import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

export function TopGradientBackground() {
  return (
    <View pointerEvents="none" style={styles.backgroundLayer}>
      <LinearGradient
        colors={['rgba(127,34,255,0.22)', 'rgba(127,34,255,0.05)', 'transparent']}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        style={styles.topGlow}
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
});
