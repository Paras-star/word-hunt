import { LinearGradient } from 'expo-linear-gradient';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

// Warm natural bamboo palette.
const BAMBOO_LIGHT = '#f0cf9a';
const BAMBOO = '#e0b06a';
const BAMBOO_MID = '#d19a52';
const BAMBOO_DARK = '#b97f38';
const BAMBOO_RIM = '#a86f2e';
const WEAVE = 'rgba(120,80,30,0.16)';

type AnimatedNumber = Animated.Value | Animated.AnimatedInterpolation<number> | number;

/** Woven criss-cross overlay used on the lid and basket bands. */
function Weave({ width, height, opacity = 1 }: { width: number; height: number; opacity?: number }) {
  const lines = [];
  const step = width / 7;
  for (let i = -1; i < 8; i++) {
    lines.push(
      <View
        key={`a${i}`}
        style={{
          position: 'absolute',
          left: i * step,
          top: -height,
          width: 2,
          height: height * 3,
          backgroundColor: WEAVE,
          transform: [{ rotate: '35deg' }],
        }}
      />,
      <View
        key={`b${i}`}
        style={{
          position: 'absolute',
          left: i * step,
          top: -height,
          width: 2,
          height: height * 3,
          backgroundColor: WEAVE,
          transform: [{ rotate: '-35deg' }],
        }}
      />,
    );
  }
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity, overflow: 'hidden' }]}>
      {lines}
    </View>
  );
}

/** The steamer basket (base) with woven bands and rim highlights. */
export function SteamerBasket({ width, style }: { width: number; style?: StyleProp<ViewStyle> }) {
  const h = width * 0.62;
  return (
    <View style={[{ width, height: h }, style]}>
      <LinearGradient
        colors={[BAMBOO, BAMBOO_MID, BAMBOO_DARK]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ width, height: h, borderRadius: width * 0.1, overflow: 'hidden' }}
      >
        <Weave width={width} height={h} opacity={0.9} />
        {/* Woven bands */}
        <View style={[styles.band, { top: h * 0.16, width, height: h * 0.2 }]} />
        <View style={[styles.band, { top: h * 0.5, width, height: h * 0.2 }]} />
        {/* Top rim highlight */}
        <LinearGradient
          colors={[BAMBOO_LIGHT, BAMBOO]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', top: 0, width, height: h * 0.1 }}
        />
      </LinearGradient>
    </View>
  );
}

/** The steamer interior (visible when the lid lifts). */
export function SteamerInterior({ width, children }: { width: number; children?: React.ReactNode }) {
  const h = width * 0.5;
  return (
    <View style={{ width, height: h, alignItems: 'center', justifyContent: 'flex-end' }}>
      <LinearGradient
        colors={['#5b3d1e', '#7a5227']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', width: width * 0.86, height: h, borderRadius: width * 0.12 }}
      />
      {children}
    </View>
  );
}

/** The dimensional lid with woven top, rim band, and center handle. */
export function SteamerLid({
  width,
  translateY = 0,
  style,
}: {
  width: number;
  translateY?: AnimatedNumber;
  style?: StyleProp<ViewStyle>;
}) {
  const h = width * 0.34;
  return (
    <Animated.View
      style={[
        { width, height: h, transform: [{ translateY: translateY as Animated.AnimatedInterpolation<number> }] },
        style,
      ]}
    >
      {/* Rim band under the dome */}
      <LinearGradient
        colors={[BAMBOO_MID, BAMBOO_DARK]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', bottom: 0, width, height: h * 0.34, borderRadius: width * 0.08 }}
      />
      {/* Dome */}
      <LinearGradient
        colors={[BAMBOO_LIGHT, BAMBOO, BAMBOO_MID]}
        start={{ x: 0.35, y: 0 }}
        end={{ x: 0.65, y: 1 }}
        style={{
          width,
          height: h * 0.82,
          borderTopLeftRadius: width * 0.55,
          borderTopRightRadius: width * 0.55,
          borderBottomLeftRadius: width * 0.14,
          borderBottomRightRadius: width * 0.14,
          overflow: 'hidden',
        }}
      >
        <Weave width={width} height={h} opacity={0.8} />
        {/* dome sheen */}
        <View
          style={{
            position: 'absolute',
            top: h * 0.1,
            left: width * 0.16,
            width: width * 0.3,
            height: h * 0.34,
            borderRadius: width,
            backgroundColor: 'rgba(255,255,255,0.28)',
            transform: [{ rotate: '-16deg' }],
          }}
        />
        {/* Handle knob */}
        <LinearGradient
          colors={[BAMBOO, BAMBOO_RIM]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            position: 'absolute',
            alignSelf: 'center',
            top: h * 0.14,
            width: width * 0.24,
            height: h * 0.28,
            borderRadius: width * 0.12,
          }}
        />
      </LinearGradient>
    </Animated.View>
  );
}

/**
 * Assembled steamer: basket at the bottom, an inner dark rim when open, and the
 * dimensional lid resting on the rim (slides up via `lidTranslateY`).
 */
export function BambooSteamer({
  width,
  lidTranslateY = 0,
  showLid = true,
  showInterior = false,
}: {
  width: number;
  lidTranslateY?: AnimatedNumber;
  showLid?: boolean;
  showInterior?: boolean;
}) {
  const basketH = width * 0.62;
  const lidW = width * 1.08;
  const lidH = lidW * 0.34;
  const containerH = basketH + lidH * 0.8;

  return (
    <View style={{ width: lidW, height: containerH, alignItems: 'center' }}>
      {/* Inner dark rim, visible once the lid is off */}
      {showInterior && (
        <LinearGradient
          colors={['#4a3016', '#6e4a24']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            position: 'absolute',
            bottom: basketH * 0.72,
            width: width * 0.82,
            height: basketH * 0.4,
            borderTopLeftRadius: width * 0.4,
            borderTopRightRadius: width * 0.4,
          }}
        />
      )}
      {/* Basket */}
      <View style={{ position: 'absolute', bottom: 0 }}>
        <SteamerBasket width={width} />
      </View>
      {/* Lid resting on the basket rim */}
      {showLid && (
        <View style={{ position: 'absolute', bottom: basketH * 0.82, zIndex: 4 }}>
          <SteamerLid width={lidW} translateY={lidTranslateY} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    backgroundColor: 'rgba(120,80,30,0.14)',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: 'rgba(255,240,210,0.25)',
  },
});
