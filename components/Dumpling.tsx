import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import type { Dumpling as DumplingType, DumplingExpression } from '@/types';

/**
 * Original vector-style dumpling character rendered purely with Views (no image
 * assets required). Supports a silhouette mode and a short idle animation.
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

  useEffect(() => {
    if (!animate) return;
    const b = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -1, duration: 700, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    const k = Animated.loop(
      Animated.sequence([
        Animated.delay(1600),
        Animated.timing(blink, { toValue: 0.1, duration: 90, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 90, useNativeDriver: true }),
      ]),
    );
    b.start();
    k.start();
    return () => {
      b.stop();
      k.stop();
    };
  }, [animate, bounce, blink]);

  const body = silhouette ? '#2b2b33' : dumpling.color;
  const accent = silhouette ? '#2b2b33' : dumpling.accent;
  const translateY = bounce.interpolate({ inputRange: [-1, 0], outputRange: [-size * 0.05, 0] });

  const pleatCount = 5;
  const pleatW = (size * 0.82) / pleatCount;

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ translateY }] }}>
      {/* Steam-side ears / pleats along the top ridge */}
      <View style={[styles.pleatRow, { top: size * 0.06, width: size * 0.82, left: size * 0.09 }]}>
        {Array.from({ length: pleatCount }).map((_, i) => (
          <View
            key={i}
            style={{
              width: pleatW * 0.86,
              height: size * 0.16,
              borderTopLeftRadius: pleatW,
              borderTopRightRadius: pleatW,
              backgroundColor: body,
              borderWidth: silhouette ? 0 : 1.5,
              borderColor: 'rgba(0,0,0,0.06)',
            }}
          />
        ))}
      </View>

      {/* Body */}
      <View
        style={[
          styles.bodyBase,
          {
            top: size * 0.16,
            left: size * 0.06,
            width: size * 0.88,
            height: size * 0.74,
            borderRadius: size * 0.4,
            backgroundColor: body,
          },
        ]}
      >
        {!silhouette && (
          <>
            {/* Belly highlight */}
            <View
              style={{
                position: 'absolute',
                top: size * 0.1,
                width: size * 0.5,
                height: size * 0.4,
                borderRadius: size * 0.3,
                backgroundColor: 'rgba(255,255,255,0.25)',
              }}
            />
            <Face
              expression={dumpling.expression}
              size={size}
              accent={accent}
              blink={blink}
            />
          </>
        )}
        {silhouette && (
          <View
            style={{
              position: 'absolute',
              bottom: size * 0.12,
              width: size * 0.3,
              height: size * 0.04,
              borderRadius: size * 0.02,
              backgroundColor: 'rgba(255,255,255,0.12)',
            }}
          />
        )}
      </View>
    </Animated.View>
  );
}

function Face({
  expression,
  size,
  accent,
  blink,
}: {
  expression: DumplingExpression;
  size: number;
  accent: string;
  blink: Animated.Value;
}) {
  const eye = size * 0.09;
  const eyeGap = size * 0.24;
  const eyeTop = size * 0.3;

  const closed = expression === 'sleepy';
  const winkRight = expression === 'wink';
  const big = expression === 'surprised';
  const cool = expression === 'cool';

  const renderEye = (isClosed: boolean, key: string) => {
    if (cool) {
      return <View key={key} style={{ width: eye * 1.4, height: eye * 0.5, borderRadius: 4, backgroundColor: '#1a1a1a' }} />;
    }
    if (isClosed) {
      return <View key={key} style={{ width: eye, height: 3, borderRadius: 2, backgroundColor: '#1a1a1a' }} />;
    }
    return (
      <Animated.View
        key={key}
        style={{
          width: big ? eye * 1.3 : eye,
          height: big ? eye * 1.3 : eye,
          borderRadius: eye,
          backgroundColor: '#1a1a1a',
          transform: [{ scaleY: blink }],
        }}
      >
        <View style={{ position: 'absolute', top: 2, right: 2, width: eye * 0.3, height: eye * 0.3, borderRadius: eye, backgroundColor: '#fff' }} />
      </Animated.View>
    );
  };

  return (
    <View style={{ position: 'absolute', top: eyeTop, alignItems: 'center', width: '100%' }}>
      <View style={{ flexDirection: 'row', gap: eyeGap }}>
        {renderEye(closed, 'l')}
        {renderEye(closed || winkRight, 'r')}
      </View>

      {/* Cheeks */}
      <View style={{ flexDirection: 'row', gap: eyeGap * 1.5, marginTop: 4 }}>
        <View style={{ width: eye, height: eye * 0.6, borderRadius: eye, backgroundColor: accent, opacity: 0.7 }} />
        <View style={{ width: eye, height: eye * 0.6, borderRadius: eye, backgroundColor: accent, opacity: 0.7 }} />
      </View>

      {/* Mouth */}
      <Mouth expression={expression} size={size} />
    </View>
  );
}

function Mouth({ expression, size }: { expression: DumplingExpression; size: number }) {
  const w = size * 0.14;
  if (expression === 'surprised') {
    return <View style={{ marginTop: 4, width: w * 0.6, height: w * 0.6, borderRadius: w, backgroundColor: '#8a3b3b' }} />;
  }
  if (expression === 'sleepy') {
    return <View style={{ marginTop: 6, width: w * 0.5, height: 3, borderRadius: 2, backgroundColor: '#8a3b3b' }} />;
  }
  // Smile: bottom half-circle
  return (
    <View
      style={{
        marginTop: 4,
        width: w,
        height: w / 2,
        borderBottomLeftRadius: w,
        borderBottomRightRadius: w,
        backgroundColor: '#c96a6a',
      }}
    />
  );
}

const styles = StyleSheet.create({
  pleatRow: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  bodyBase: {
    position: 'absolute',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
