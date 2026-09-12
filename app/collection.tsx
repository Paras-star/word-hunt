import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Dumpling } from '@/components/Dumpling';
import { Screen } from '@/components/Screen';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { RARITY, RARITY_ORDER } from '@/constants/rarity';
import { DUMPLINGS_BY_RARITY, TOTAL_DUMPLINGS, getDumpling } from '@/data/dumplings';
import { usePlayer } from '@/hooks/usePlayer';
import { playSound } from '@/lib/sound';

export default function CollectionScreen() {
  const router = useRouter();
  const { collection } = usePlayer();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const discovered = Object.keys(collection).length;
  const selected = selectedId ? getDumpling(selectedId) : undefined;
  const selectedEntry = selectedId ? collection[selectedId] : undefined;

  return (
    <Screen banner>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backText}>‹  Back</Text>
        </Pressable>
        <View style={styles.progressPill}>
          <Text style={styles.progressText}>
            {discovered} / {TOTAL_DUMPLINGS} discovered
          </Text>
        </View>
      </View>
      <Text style={styles.title}>Dumpling Collection</Text>

      {discovered === 0 && (
        <Text style={styles.empty}>
          No dumplings yet! Solve a puzzle to unbox your first mystery dumpling. 🥟
        </Text>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        {RARITY_ORDER.map((rarity) => {
          const items = DUMPLINGS_BY_RARITY[rarity] ?? [];
          if (items.length === 0) return null;
          const ownedInTier = items.filter((d) => collection[d.id]).length;
          return (
            <View key={rarity} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.rarityDot, { backgroundColor: RARITY[rarity].color }]} />
                <Text style={styles.sectionTitle}>{RARITY[rarity].label}</Text>
                <Text style={styles.sectionCount}>
                  {ownedInTier}/{items.length}
                </Text>
              </View>
              <View style={styles.grid}>
                {items.map((d) => {
                  const entry = collection[d.id];
                  const owned = !!entry;
                  return (
                    <Pressable
                      key={d.id}
                      style={styles.slot}
                      onPress={() => {
                        if (owned) {
                          playSound('tap');
                          setSelectedId(d.id);
                        } else {
                          playSound('wrong');
                        }
                      }}
                    >
                      <Dumpling dumpling={d} size={64} silhouette={!owned} />
                      <Text style={styles.slotName} numberOfLines={1}>
                        {owned ? d.name : '???'}
                      </Text>
                      {owned && entry.count > 1 && (
                        <View style={styles.countBadge}>
                          <Text style={styles.countBadgeText}>×{entry.count}</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Detail modal */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelectedId(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedId(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {selected && (
              <>
                <Dumpling dumpling={selected} size={130} animate />
                <Text style={styles.modalName}>{selected.name}</Text>
                <View style={[styles.rarityTag, { backgroundColor: RARITY[selected.rarity].color }]}>
                  <Text style={styles.rarityTagText}>{RARITY[selected.rarity].label}</Text>
                </View>
                <Text style={styles.modalDesc}>{selected.description}</Text>
                {selectedEntry && selectedEntry.count > 1 && (
                  <Text style={styles.modalOwned}>Owned ×{selectedEntry.count}</Text>
                )}
                <Button label="Close" variant="secondary" onPress={() => setSelectedId(null)} />
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  backText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.blue },
  progressPill: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.gridBorder,
  },
  progressText: { fontWeight: '800', color: Colors.textDark, fontSize: FontSize.sm },
  title: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textDark, marginBottom: Spacing.md },
  empty: { color: Colors.textMuted, fontSize: FontSize.md, textAlign: 'center', marginTop: Spacing.xl, paddingHorizontal: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  rarityDot: { width: 12, height: 12, borderRadius: 6 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.textDark },
  sectionCount: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '700', marginLeft: 'auto' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  slot: {
    width: 78,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    ...Shadow.card,
  },
  slotName: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textDark, marginTop: 4, maxWidth: 70 },
  countBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.blue,
    borderRadius: Radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countBadgeText: { color: '#fff', fontWeight: '900', fontSize: 10 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
    maxWidth: 340,
    ...Shadow.raised,
  },
  modalName: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textDark, marginTop: Spacing.sm },
  rarityTag: { borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 3 },
  rarityTagText: { color: '#fff', fontWeight: '900', fontSize: FontSize.xs, letterSpacing: 1 },
  modalDesc: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  modalOwned: { fontSize: FontSize.sm, color: Colors.blue, fontWeight: '800' },
});
