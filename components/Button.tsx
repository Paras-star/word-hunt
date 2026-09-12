import { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { playSound } from '@/lib/sound';

type Variant = 'primary' | 'accent' | 'pink' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const VARIANT_BG: Record<Variant, string> = {
  primary: Colors.blue,
  accent: Colors.orange,
  pink: Colors.pink,
  secondary: Colors.surface,
  ghost: 'transparent',
};

const VARIANT_FG: Record<Variant, string> = {
  primary: '#ffffff',
  accent: '#ffffff',
  pink: '#ffffff',
  secondary: Colors.textDark,
  ghost: Colors.textDark,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  silent = false,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  silent?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  const paddingV = size === 'lg' ? Spacing.lg : size === 'sm' ? Spacing.sm : Spacing.md;
  const fontSize = size === 'lg' ? FontSize.lg : size === 'sm' ? FontSize.sm : FontSize.md;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        disabled={disabled}
        onPressIn={() => animate(0.96)}
        onPressOut={() => animate(1)}
        onPress={() => {
          if (!silent) playSound('tap');
          onPress();
        }}
        style={[
          styles.base,
          {
            backgroundColor: VARIANT_BG[variant],
            paddingVertical: paddingV,
            borderWidth: variant === 'secondary' ? 1 : 0,
            borderColor: Colors.gridBorder,
          },
          variant !== 'ghost' && variant !== 'secondary' ? Shadow.card : null,
          disabled && styles.disabled,
        ]}
      >
        <Text style={[styles.label, { color: VARIANT_FG[variant], fontSize }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.45,
  },
});
