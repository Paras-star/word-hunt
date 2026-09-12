import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Dumpling } from '@/components/Dumpling';
import { Screen } from '@/components/Screen';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { RARITY } from '@/constants/rarity';
import { CATEGORIES, getCategory, getCategoryIndex } from '@/data/categories';
import { getDumpling } from '@/data/dumplings';
import { usePlayer } from '@/hooks/usePlayer';
import { maybeShowInterstitial } from '@/lib/ads';
import type { GameMode } from '@/types';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    outcome?: string;
    score?: string;
    time?: string;
    category?: string;
    mode?: string;
  }>();
  const { activeReward, finalizeReward } = usePlayer();

  const isTimeout = params.outcome === 'timeout';
  const win = !isTimeout && !!activeReward;

  const reward = win ? activeReward : null;
  const dumpling = reward ? getDumpling(reward.dumplingId) : undefined;

  const categoryId = reward?.categoryId ?? params.category ?? '';
  const mode: GameMode = (reward?.mode ?? (params.mode === 'time' ? 'time' : 'classic')) as GameMode;
  const category = getCategory(categoryId);

  const score = reward?.summary.score ?? Number(params.score ?? 0);
  const timeTaken = reward?.summary.timeTakenSec ?? Number(params.time ?? 0);
  const coinsEarned = reward?.summary.coinsEarned ?? 0;

  const catIndex = getCategoryIndex(categoryId);
  const nextCategory = catIndex >= 0 && catIndex < CATEGORIES.length - 1 ? CATEGORIES[catIndex + 1] : null;

  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, bounciness: 10, speed: 5 }).start();
  }, [pop]);

  const leave = async (go: () => void) => {
    await finalizeReward();
    maybeShowInterstitial();
    go();
  };

  return (
    <Screen banner>
      <View style={styles.body}>
        <Animated.View style={{ transform: [{ scale: pop }], alignItems: 'center' }}>
          <Text style={styles.title}>{isTimeout ? "Time's Up!" : 'Puzzle Solved!'}</Text>
          <Text style={styles.subtitle}>
            {category ? `${category.emoji} ${category.name}` : ''} · {mode === 'time' ? 'Time Mode' : 'Classic'}
          </Text>
        </Animated.View>

        {win && dumpling && reward && (
          <View style={styles.rewardCard}>
            <Dumpling dumpling={dumpling} size={96} animate />
            <View style={{ flex: 1 }}>
              <Text style={styles.rewardLabel}>
                {reward.isNewDiscovery ? '✨ New Discovery' : `Duplicate ×${reward.quantityAfter}`}
              </Text>
              <Text style={styles.rewardName}>{dumpling.name}</Text>
              <View style={[styles.rarityTag, { backgroundColor: RARITY[reward.rarity].color }]}>
                <Text style={styles.rarityTagText}>{RARITY[reward.rarity].label}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.statsCard}>
          <StatRow label="Score" value={String(score)} />
          <StatRow label="Time" value={formatTime(timeTaken)} />
          <StatRow label="Coins earned" value={coinsEarned > 0 ? `+${coinsEarned}` : '—'} />
        </View>
      </View>

      <View style={styles.actions}>
        {win && (
          <Button label="View Collection" variant="secondary" onPress={() => router.push('/collection')} />
        )}
        <View style={styles.actionRow}>
          <Button
            label="Play Again"
            variant="accent"
            style={styles.flex}
            onPress={() =>
              leave(() =>
                router.replace({ pathname: '/game', params: { category: categoryId, mode } }),
              )
            }
          />
          {nextCategory && (
            <Button
              label="Next Level"
              style={styles.flex}
              onPress={() =>
                leave(() =>
                  router.replace({ pathname: '/game', params: { category: nextCategory.id, mode } }),
                )
              }
            />
          )}
        </View>
        <Button label="Home" variant="ghost" onPress={() => leave(() => router.replace('/'))} />
      </View>
    </Screen>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.textDark },
  subtitle: { fontSize: FontSize.md, color: Colors.textMuted, marginTop: 4, fontWeight: '700' },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  rewardLabel: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.pink },
  rewardName: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textDark, marginVertical: 2 },
  rarityTag: { alignSelf: 'flex-start', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3, marginTop: 2 },
  rarityTagText: { color: '#fff', fontWeight: '900', fontSize: FontSize.xs, letterSpacing: 1 },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { fontSize: FontSize.md, color: Colors.textMuted, fontWeight: '700' },
  statValue: { fontSize: FontSize.md, color: Colors.textDark, fontWeight: '900' },
  actions: { gap: Spacing.md, paddingBottom: Spacing.lg },
  actionRow: { flexDirection: 'row', gap: Spacing.md },
  flex: { flex: 1 },
});
