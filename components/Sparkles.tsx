import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const STAR_GLYPHS = ['✦', '✧', '★', '✨', '·'];
const DEFAULT_COLORS = ['#ffffff', '#ffe066', '#ff9ecb', '#a0e7ff'];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * One-shot radial burst of star particles from the center of its container.
 * Remounting (via a changing `key`) replays the burst.
 */
export function SparkleBurst({
  size = 240,
  count = 16,
  colors = DEFAULT_COLORS,
  duration = 900,
}: {
  size?: number;
  count?: number;
  colors?: string[];
  duration?: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map(() => {
        const angle = rand(0, Math.PI * 2);
        const dist = rand(size * 0.22, size * 0.5);
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          glyph: STAR_GLYPHS[Math.floor(rand(0, STAR_GLYPHS.length - 1))],
          color: colors[Math.floor(rand(0, colors.length))],
          fontSize: rand(size * 0.05, size * 0.11),
          rot: rand(-90, 90),
        };
      }),
    [count, size, colors],
  );

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration, useNativeDriver: true }).start();
  }, [progress, duration]);

  return (
    <View pointerEvents="none" style={[styles.center, { width: size, height: size }]}>
      {particles.map((p, i) => {
        const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] });
        const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.dy] });
        const scale = progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.2, 1.2, 0.6] });
        const opacity = progress.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] });
        const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rot}deg`] });
        return (
          <Animated.Text
            key={i}
            style={{
              position: 'absolute',
              color: p.color,
              fontSize: p.fontSize,
              transform: [{ translateX }, { translateY }, { scale }, { rotate }],
              opacity,
            }}
          >
            {p.glyph}
          </Animated.Text>
        );
      })}
    </View>
  );
}

/** Continuous gentle stars rising within a box (suspense / ambient). */
export function RisingSparkles({
  width = 240,
  height = 260,
  count = 10,
  colors = DEFAULT_COLORS,
}: {
  width?: number;
  height?: number;
  count?: number;
  colors?: string[];
}) {
  const specs = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        x: rand(0.1, 0.9) * width,
        glyph: STAR_GLYPHS[Math.floor(rand(0, STAR_GLYPHS.length - 1))],
        color: colors[Math.floor(rand(0, colors.length))],
        fontSize: rand(width * 0.04, width * 0.08),
        delay: rand(0, 1400),
        dur: rand(1400, 2400),
      })),
    [count, width, colors],
  );

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {specs.map((s, i) => (
        <RisingStar key={i} spec={s} height={height} />
      ))}
    </View>
  );
}

function RisingStar({
  spec,
  height,
}: {
  spec: { x: number; glyph: string; color: string; fontSize: number; delay: number; dur: number };
  height: number;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(spec.delay),
        Animated.timing(v, { toValue: 1, duration: spec.dur, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, spec.delay, spec.dur]);

  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [height * 0.9, height * 0.15] });
  const opacity = v.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] });
  const scale = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1, 0.7] });

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: spec.x,
        color: spec.color,
        fontSize: spec.fontSize,
        transform: [{ translateY }, { scale }],
        opacity,
      }}
    >
      {spec.glyph}
    </Animated.Text>
  );
}

/** Rotating sunburst rays behind the reveal. */
export function Sunburst({
  size = 300,
  rays = 16,
  color = '#fff3b0',
  spin = true,
}: {
  size?: number;
  rays?: number;
  color?: string;
  spin?: boolean;
}) {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!spin) return;
    const loop = Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: 14000, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [rot, spin]);

  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.center, { width: size, height: size, transform: [{ rotate }] }]}
    >
      {Array.from({ length: rays }).map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: size * 0.09,
            height: size,
            backgroundColor: color,
            opacity: i % 2 === 0 ? 0.28 : 0.12,
            transform: [{ rotate: `${(180 / rays) * i}deg` }],
          }}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
