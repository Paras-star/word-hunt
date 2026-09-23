import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CoinPill } from '@/components/CoinPill';
import { Screen } from '@/components/Screen';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { CATEGORIES, isCategoryUnlocked } from '@/data/categories';
import { usePlayer } from '@/hooks/usePlayer';
import { playSound } from '@/lib/sound';

export default function CategoryScreen() {
  const router = useRouter();
  const { coins, completedLevels } = usePlayer();

  return (
    <Screen banner>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={12}>
          <Text style={styles.backText}>‹  Back</Text>
        </Pressable>
        <CoinPill coins={coins} />
      </View>
      <Text style={styles.title}>Choose a Category</Text>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map((cat, index) => {
          const unlocked = isCategoryUnlocked(index, completedLevels);
          const done = completedLevels.includes(cat.id);
          return (
            <Pressable
              key={cat.id}
              style={[styles.card, !unlocked && styles.cardLocked]}
              onPress={() => {
                if (!unlocked) {
                  playSound('wrong');
                  return;
                }
                playSound('tap');
                router.push({ pathname: '/mode', params: { category: cat.id } });
              }}
            >
              {done && (
                <View style={styles.doneBadge}>
                  <Text style={styles.doneText}>✓</Text>
                </View>
              )}
              <Text style={[styles.emoji, !unlocked && styles.dim]}>{unlocked ? cat.emoji : '🔒'}</Text>
              <Text style={[styles.name, !unlocked && styles.dim]} numberOfLines={1}>
                {cat.name}
              </Text>
              <Text style={styles.count}>{cat.words.length} words</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  back: { paddingVertical: 4 },
  backText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.blue },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Colors.textDark,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  card: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadow.card,
  },
  cardLocked: {
    backgroundColor: Colors.surfaceAlt,
    opacity: 0.75,
  },
  doneBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: { color: '#fff', fontWeight: '900', fontSize: FontSize.sm },
  emoji: { fontSize: 40 },
  dim: { opacity: 0.6 },
  name: {
    marginTop: Spacing.sm,
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.textDark,
  },
  count: {
    marginTop: 2,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
});
