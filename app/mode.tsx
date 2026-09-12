import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { getCategory } from '@/data/categories';
import { playSound } from '@/lib/sound';
import type { GameMode } from '@/types';

export default function ModeScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const cat = getCategory(category ?? '');

  const start = (mode: GameMode) => {
    playSound('tap');
    router.push({ pathname: '/game', params: { category: category ?? '', mode } });
  };

  return (
    <Screen banner>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backText}>‹  Back</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.kicker}>{cat ? `${cat.emoji}  ${cat.name}` : 'Puzzle'}</Text>
        <Text style={styles.title}>Choose a Mode</Text>

        <ModeCard
          title="Classic"
          emoji="🧩"
          desc="Relax and solve at your own pace. Timer counts up."
          color={Colors.blue}
          onPress={() => start('classic')}
        />
        <ModeCard
          title="Time Mode"
          emoji="⏱️"
          desc="Beat the clock! 2:00 countdown with a time bonus."
          color={Colors.orange}
          onPress={() => start('time')}
        />
      </View>
    </Screen>
  );
}

function ModeCard({
  title,
  emoji,
  desc,
  color,
  onPress,
}: {
  title: string;
  emoji: string;
  desc: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, { color }]}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.sm },
  backText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.blue },
  body: { flex: 1, justifyContent: 'center', gap: Spacing.lg, paddingBottom: Spacing.xxl },
  kicker: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textMuted, textAlign: 'center' },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderLeftWidth: 6,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.card,
  },
  cardEmoji: { fontSize: 34 },
  cardTitle: { fontSize: FontSize.xl, fontWeight: '900' },
  cardDesc: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 30, color: Colors.textMuted, fontWeight: '300' },
});
