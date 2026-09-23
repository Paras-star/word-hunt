import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

export function CoinPill({ coins }: { coins: number }) {
  return (
    <View style={styles.pill}>
      <View style={styles.coin}>
        <Text style={styles.coinGlyph}>$</Text>
      </View>
      <Text style={styles.count}>{coins}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.gridBorder,
  },
  coin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f5b301',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinGlyph: {
    color: '#7a5200',
    fontWeight: '900',
    fontSize: FontSize.sm,
  },
  count: {
    fontWeight: '800',
    color: Colors.textDark,
    fontSize: FontSize.md,
    marginRight: Spacing.xs,
  },
});
