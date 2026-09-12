import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { CoinPill } from '@/components/CoinPill';
import { Dumpling } from '@/components/Dumpling';
import { Screen } from '@/components/Screen';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { getDumpling } from '@/data/dumplings';
import { usePlayer } from '@/hooks/usePlayer';

export default function HomeScreen() {
  const router = useRouter();
  const { coins, collection } = usePlayer();
  const pulse = useRef(new Animated.Value(1)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -1, duration: 1400, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse, float]);

  const discovered = Object.keys(collection).length;
  const mascot = getDumpling('dumpling_034')!; // Phoenix Puff as the friendly mascot
  const translateY = float.interpolate({ inputRange: [-1, 0], outputRange: [-10, 0] });

  return (
    <Screen banner>
      <View style={styles.topBar}>
        <View />
        <CoinPill coins={coins} />
      </View>

      <View style={styles.hero}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Dumpling dumpling={mascot} size={150} animate />
        </Animated.View>
        <Text style={styles.title}>Word Hunt</Text>
        <View style={styles.subtitleRow}>
          <Text style={styles.subtitleAccent}>Mystery </Text>
          <Text style={styles.subtitle}>Dumplings</Text>
        </View>
        <Text style={styles.tagline}>Solve the puzzle. Unbox a dumpling. Collect them all.</Text>
      </View>

      <View style={styles.actions}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Button label="▶  Play" size="lg" onPress={() => router.push('/category')} />
        </Animated.View>
        <Button
          label={`Collection  ${discovered}/40`}
          variant="secondary"
          onPress={() => router.push('/collection')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSize.huge,
    fontWeight: '900',
    color: Colors.textDark,
    marginTop: Spacing.md,
    letterSpacing: 0.5,
  },
  subtitleRow: {
    flexDirection: 'row',
  },
  subtitleAccent: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Colors.pink,
  },
  subtitle: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Colors.orange,
  },
  tagline: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  actions: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});
