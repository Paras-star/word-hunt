import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BannerSlot } from '@/components/BannerSlot';
import { Colors, Spacing } from '@/constants/theme';

/**
 * Themed, safe-area page wrapper. Set `banner` to show the persistent bottom
 * banner ad on eligible screens (omitted during the full-screen unboxing).
 */
export function Screen({
  children,
  banner = false,
  padded = true,
}: {
  children: ReactNode;
  banner?: boolean;
  padded?: boolean;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={[styles.content, padded && styles.padded]}>{children}</View>
      {banner ? <BannerSlot /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
});
