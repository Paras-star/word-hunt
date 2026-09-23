import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { alpha, darken, lighten } from '@/lib/color';
import type { Dumpling as DumplingType, DumplingExpression } from '@/types';

/**
 * Glossy, collectible-toy style dumpling rendered with layered Views + gradients
 * (no image assets). Layers: contact shadow → gradient body → crimped pleats →
 * belly sheen → soft specular highlight → sharp specular dot → rim light →
 * blush → face → optional topping. Supports silhouette mode + idle animation.
 */
export function Dumpling({
  dumpling,
  size = 160,
  silhouette = false,
  animate = false,
}: {
  dumpling: DumplingType;
  size?: number;
  silhouette?: boolean;
  animate?: boolean;
}) {
  const bounce = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const squish = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;
    const b = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -1, duration: 720, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 720, useNativeDriver: true }),
      ]),
    );
    const k = Animated.loop(
      Animated.sequence([
        Animated.delay(1800),
        Animated.timing(blink, { toValue: 0.1, duration: 80, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]),
    );
    const s = Animated.loop(
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(squish, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(squish, { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.delay(1200),
      ]),
    );
    b.start();
    k.start();
    s.start();
    return () => {
      b.stop();
      k.stop();
      s.stop();
    };
  }, [animate, bounce, blink, squish]);

  const translateY = bounce.interpolate({ inputRange: [-1, 0], outputRange: [-size * 0.05, 0] });
  const scaleX = squish.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const scaleY = squish.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] });

  const base = dumpling.color;
  const bodyTop = silhouette ? '#3a3a44' : lighten(base, 0.28);
  const bodyMid = silhouette ? '#2b2b33' : base;
  const bodyBot = silhouette ? '#1e1e25' : darken(base, 0.24);
  const pleatColor = silhouette ? '#33333d' : lighten(base, 0.12);
  const pleatShade = silhouette ? '#26262e' : darken(base, 0.12);

  const bodyW = size * 0.9;
  const bodyH = size * 0.82;

  const pleatCount = 5;
  const pleatW = (bodyW * 0.96) / pleatCount;

  return (
    <Animated.View
      style={{ width: size, height: size, transform: [{ translateY }, { scaleX }, { scaleY }] }}
    >
      {/* Contact shadow */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.04,
          alignSelf: 'center',
          width: bodyW * 0.8,
          height: size * 0.1,
          borderRadius: size,
          backgroundColor: 'rgba(0,0,0,0.18)',
        }}
      />

      {/* Crimped pleats along the top ridge */}
      <View style={[styles.pleatRow, { top: size * 0.05, width: bodyW * 0.96, left: (size - bodyW * 0.96) / 2 }]}>
        {Array.from({ length: pleatCount }).map((_, i) => (
          <LinearGradient
            key={i}
            colors={[pleatColor, pleatShade]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              width: pleatW * 0.9,
              height: size * 0.17,
              borderTopLeftRadius: pleatW,
              borderTopRightRadius: pleatW,
              borderBottomLeftRadius: pleatW * 0.3,
              borderBottomRightRadius: pleatW * 0.3,
            }}
          />
        ))}
      </View>

      {/* Body */}
      <View style={{ position: 'absolute', top: size * 0.16, left: (size - bodyW) / 2, width: bodyW, height: bodyH }}>
        <LinearGradient
          colors={[bodyTop, bodyMid, bodyBot]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={{ width: bodyW, height: bodyH, borderRadius: bodyW * 0.5, overflow: 'hidden' }}
        >
          {!silhouette && (
            <>
              {/* Belly sheen */}
              <View
                style={{
                  position: 'absolute',
                  top: bodyH * 0.14,
                  alignSelf: 'center',
                  width: bodyW * 0.6,
                  height: bodyH * 0.45,
                  borderRadius: bodyW * 0.4,
                  backgroundColor: alpha('#ffffff', 0.16),
                }}
              />
              {/* Soft specular highlight (upper-left) */}
              <View
                style={{
                  position: 'absolute',
                  top: bodyH * 0.1,
                  left: bodyW * 0.12,
                  width: bodyW * 0.34,
                  height: bodyH * 0.42,
                  borderRadius: bodyW * 0.3,
                  backgroundColor: alpha('#ffffff', 0.55),
                  transform: [{ rotate: '-20deg' }],
                }}
              />
              {/* Sharp specular dot */}
              <View
                style={{
                  position: 'absolute',
                  top: bodyH * 0.14,
                  left: bodyW * 0.2,
                  width: bodyW * 0.12,
                  height: bodyW * 0.12,
                  borderRadius: bodyW * 0.1,
                  backgroundColor: alpha('#ffffff', 0.9),
                }}
              />
              {/* Rim light (lower-right) */}
              <View
                style={{
                  position: 'absolute',
                  bottom: bodyH * 0.16,
                  right: bodyW * 0.08,
                  width: bodyW * 0.26,
                  height: bodyH * 0.3,
                  borderRadius: bodyW * 0.3,
                  backgroundColor: alpha(lighten(base, 0.5), 0.28),
                  transform: [{ rotate: '18deg' }],
                }}
              />
            </>
          )}
        </LinearGradient>

        {!silhouette && (
          <Face expression={dumpling.expression} bodyW={bodyW} bodyH={bodyH} accent={dumpling.accent} blink={blink} />
        )}
      </View>

      {!silhouette && <Topping dumpling={dumpling} size={size} />}
    </Animated.View>
  );
}

function Face({
  expression,
  bodyW,
  bodyH,
  accent,
  blink,
}: {
  expression: DumplingExpression;
  bodyW: number;
  bodyH: number;
  accent: string;
  blink: Animated.Value;
}) {
  const eye = bodyW * 0.1;
  const eyeGap = bodyW * 0.26;
  const closed = expression === 'sleepy';
  const winkRight = expression === 'wink';
  const big = expression === 'surprised';
  const cool = expression === 'cool';

  const renderEye = (isClosed: boolean, key: string) => {
    if (cool) {
      return <View key={key} style={{ width: eye * 1.5, height: eye * 0.5, borderRadius: 4, backgroundColor: '#2a2a2a' }} />;
    }
    if (isClosed) {
      return <View key={key} style={{ width: eye * 1.1, height: 3.5, borderRadius: 2, backgroundColor: '#2a2a2a' }} />;
    }
    return (
      <Animated.View
        key={key}
        style={{
          width: big ? eye * 1.3 : eye,
          height: big ? eye * 1.3 : eye,
          borderRadius: eye,
          backgroundColor: '#2a2a2a',
          transform: [{ scaleY: blink }],
        }}
      >
        <View style={{ position: 'absolute', top: 1.5, right: 1.5, width: eye * 0.34, height: eye * 0.34, borderRadius: eye, backgroundColor: '#fff' }} />
      </Animated.View>
    );
  };

  return (
    <View style={{ position: 'absolute', top: bodyH * 0.42, alignItems: 'center', width: '100%' }}>
      <View style={{ flexDirection: 'row', gap: eyeGap }}>
        {renderEye(closed, 'l')}
        {renderEye(closed || winkRight, 'r')}
      </View>
      <View style={{ flexDirection: 'row', gap: eyeGap * 1.7, marginTop: 3 }}>
        <View style={{ width: eye * 1.1, height: eye * 0.66, borderRadius: eye, backgroundColor: accent, opacity: 0.75 }} />
        <View style={{ width: eye * 1.1, height: eye * 0.66, borderRadius: eye, backgroundColor: accent, opacity: 0.75 }} />
      </View>
      <Mouth expression={expression} bodyW={bodyW} />
    </View>
  );
}

function Mouth({ expression, bodyW }: { expression: DumplingExpression; bodyW: number }) {
  const w = bodyW * 0.15;
  if (expression === 'surprised') {
    return <View style={{ marginTop: 3, width: w * 0.6, height: w * 0.6, borderRadius: w, backgroundColor: '#9c4a4a' }} />;
  }
  if (expression === 'sleepy') {
    return <View style={{ marginTop: 5, width: w * 0.5, height: 3, borderRadius: 2, backgroundColor: '#9c4a4a' }} />;
  }
  return (
    <View
      style={{
        marginTop: 3,
        width: w,
        height: w / 2,
        borderBottomLeftRadius: w,
        borderBottomRightRadius: w,
        backgroundColor: '#c96a6a',
      }}
    />
  );
}

/** Small rarity/character-flavored topping for extra collectible variety. */
function Topping({ dumpling, size }: { dumpling: DumplingType; size: number }) {
  const r = dumpling.rarity;
  if (r === 'GOLDEN') {
    return <View style={[styles.crownDot, { top: size * 0.02, backgroundColor: '#ffd23f', borderColor: '#e0a80f' }]} />;
  }
  if (r === 'RAINBOW') {
    return (
      <View style={{ position: 'absolute', top: size * 0.02, alignSelf: 'center', flexDirection: 'row', gap: 2 }}>
        {['#ff5f6d', '#ffc371', '#47e5bc', '#4facfe'].map((c) => (
          <View key={c} style={{ width: size * 0.045, height: size * 0.045, borderRadius: size, backgroundColor: c }} />
        ))}
      </View>
    );
  }
  if (r === 'LEGENDARY') {
    return <View style={[styles.leaf, { top: size * 0.03, backgroundColor: '#7ad67a' }]} />;
  }
  if (dumpling.expression === 'love') {
    return <View style={{ position: 'absolute', top: size * 0.06, right: size * 0.16, width: size * 0.07, height: size * 0.07, borderRadius: size, backgroundColor: '#ff8fb3' }} />;
  }
  return null;
}

const styles = StyleSheet.create({
  pleatRow: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  crownDot: {
    position: 'absolute',
    alignSelf: 'center',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    zIndex: 3,
  },
  leaf: {
    position: 'absolute',
    alignSelf: 'center',
    width: 12,
    height: 18,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    transform: [{ rotate: '15deg' }],
    zIndex: 3,
  },
});
