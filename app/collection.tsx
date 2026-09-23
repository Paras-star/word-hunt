import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Dumpling } from '@/components/Dumpling';
import { Screen } from '@/components/Screen';
import { SparkleBurst } from '@/components/Sparkles';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { RARITY } from '@/constants/rarity';
import { ROOMS, roomForDumpling } from '@/constants/rooms';
import { DUMPLINGS, TOTAL_DUMPLINGS, getDumpling } from '@/data/dumplings';
import { usePlayer } from '@/hooks/usePlayer';
import { alpha } from '@/lib/color';
import { playSound, startMusic } from '@/lib/sound';
import type { Dumpling as DumplingType } from '@/types';

export default function CollectionScreen() {
  const router = useRouter();
  const { collection } = usePlayer();
  const [roomIndex, setRoomIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const room = ROOMS[roomIndex];

  useEffect(() => {
    startMusic();
  }, []);

  const dumplingsByRoom = useMemo(() => {
    const map: Record<string, DumplingType[]> = {};
    for (const d of DUMPLINGS) {
      (map[roomForDumpling(d)] ??= []).push(d);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.collectionOrder - b.collectionOrder);
    }
    return map;
  }, []);

  const roomDumplings = dumplingsByRoom[room.id] ?? [];
  const ownedInRoom = roomDumplings.filter((d) => collection[d.id]).length;
  const totalDiscovered = Object.keys(collection).length;

  const selected = selectedId ? getDumpling(selectedId) : undefined;
  const selectedEntry = selectedId ? collection[selectedId] : undefined;

  const changeRoom = (dir: 1 | -1) => {
    playSound('tap');
    setRoomIndex((i) => (i + dir + ROOMS.length) % ROOMS.length);
  };

  return (
    <Screen banner>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backText}>‹  Back</Text>
        </Pressable>
        <View style={styles.progressPill}>
          <Text style={styles.progressText}>{totalDiscovered} / {TOTAL_DUMPLINGS} collected</Text>
        </View>
      </View>
      <Text style={styles.title}>Dumpling Collection</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.lg }}>
        {/* Jar / diorama */}
        <View style={styles.jar}>
          {/* Cork lid */}
          <View style={styles.cork}>
            <View style={styles.corkInner} />
          </View>

          {/* Glass body */}
          <View style={styles.glass}>
            <LinearGradient colors={room.backdrop} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.scene}>
              {/* Hanging room tag */}
              <View style={styles.tagWrap}>
                <View style={styles.tagString} />
                <View style={[styles.tag, { backgroundColor: '#fff7ea', borderColor: room.accent }]}>
                  <Text style={styles.tagEmoji}>{room.emoji}</Text>
                  <Text style={[styles.tagName, { color: room.accent }]}>{room.name}</Text>
                </View>
              </View>

              {/* Floor line */}
              <View style={[styles.floor, { backgroundColor: alpha(room.accent, 0.35) }]} />

              {/* Dumplings placed in the room */}
              <View style={styles.slots}>
                {roomDumplings.map((d) => {
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
                      <View style={styles.slotArt}>
                        <Dumpling dumpling={d} size={62} silhouette={!owned} animate={owned} />
                        {!owned && (
                          <Text style={styles.mysteryQ}>?</Text>
                        )}
                      </View>
                      <Text style={styles.slotName} numberOfLines={1}>
                        {owned ? d.name : 'Undiscovered'}
                      </Text>
                      {owned && (
                        <View style={[styles.rarityDotSm, { backgroundColor: RARITY[d.rarity].color }]} />
                      )}
                      {owned && entry.count > 1 && (
                        <View style={styles.countBadge}>
                          <Text style={styles.countBadgeText}>×{entry.count}</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </LinearGradient>

            {/* Glass sheen overlay */}
            <View pointerEvents="none" style={styles.glassSheen}>
              <LinearGradient
                colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.7, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.glassStripe} />
            </View>
          </View>

          {/* Room progress */}
          <View style={styles.roomProgress}>
            <Text style={styles.roomProgressText}>
              {ownedInRoom} / {roomDumplings.length} collected
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${roomDumplings.length ? (ownedInRoom / roomDumplings.length) * 100 : 0}%`,
                    backgroundColor: room.accent,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Room navigation */}
        <View style={styles.nav}>
          <Button label="‹ Prev" variant="secondary" size="sm" onPress={() => changeRoom(-1)} style={styles.navBtn} />
          <View style={styles.roomDots}>
            {ROOMS.map((r, i) => (
              <View
                key={r.id}
                style={[styles.roomDot, i === roomIndex && { backgroundColor: Colors.blue, width: 18 }]}
              />
            ))}
          </View>
          <Button label="Next Box ›" size="sm" onPress={() => changeRoom(1)} style={styles.navBtn} />
        </View>
      </ScrollView>

      {/* Detail modal */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelectedId(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedId(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {selected && (
              <>
                <LinearGradient
                  colors={[alpha(RARITY[selected.rarity].color, 0.35), alpha(RARITY[selected.rarity].color, 0.05)]}
                  style={styles.modalGlow}
                />
                <View style={styles.modalDumpling}>
                  <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
                    <SparkleBurst size={190} count={10} colors={RARITY[selected.rarity].colors} duration={1400} />
                  </View>
                  <View style={styles.center}>
                    <Dumpling dumpling={selected} size={118} animate />
                  </View>
                </View>
                <Text style={styles.modalName}>{selected.name}</Text>
                <View style={styles.modalTags}>
                  <View style={[styles.rarityTag, { backgroundColor: RARITY[selected.rarity].color }]}>
                    <Text style={styles.rarityTagText}>{RARITY[selected.rarity].label}</Text>
                  </View>
                  <View style={styles.roomTag}>
                    <Text style={styles.roomTagText}>
                      {getRoomName(selected)} 
                    </Text>
                  </View>
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

function getRoomName(d: DumplingType): string {
  const roomId = roomForDumpling(d);
  return ROOMS.find((r) => r.id === roomId)?.name ?? '';
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  backText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.blue },
  progressPill: { backgroundColor: Colors.surface, borderRadius: Radius.pill, paddingHorizontal: Spacing.md, paddingVertical: 6, borderWidth: 1, borderColor: Colors.gridBorder },
  progressText: { fontWeight: '800', color: Colors.textDark, fontSize: FontSize.sm },
  title: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textDark, marginBottom: Spacing.md },

  jar: { alignItems: 'center' },
  cork: { width: 210, height: 34, backgroundColor: '#cf9d5c', borderTopLeftRadius: 14, borderTopRightRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#b5813f' },
  corkInner: { width: 190, height: 16, borderRadius: 8, backgroundColor: '#dcae6f' },
  glass: {
    width: 300,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    borderTopWidth: 0,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.4)',
    ...Shadow.card,
  },
  scene: { minHeight: 300, padding: Spacing.md, paddingTop: Spacing.lg },
  glassSheen: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, overflow: 'hidden' },
  glassStripe: { position: 'absolute', top: 0, bottom: 0, left: '14%', width: 10, backgroundColor: 'rgba(255,255,255,0.35)' },
  tagWrap: { position: 'absolute', top: 6, right: 10, alignItems: 'center', zIndex: 3 },
  tagString: { width: 2, height: 14, backgroundColor: '#b5813f' },
  tag: { transform: [{ rotate: '6deg' }], borderWidth: 2, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center' },
  tagEmoji: { fontSize: 16 },
  tagName: { fontWeight: '900', fontSize: FontSize.sm },
  floor: { position: 'absolute', bottom: 40, left: 0, right: 0, height: 3 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.xl },
  slot: {
    width: 78,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  slotArt: { alignItems: 'center', justifyContent: 'center' },
  mysteryQ: { position: 'absolute', color: 'rgba(255,255,255,0.85)', fontSize: 26, fontWeight: '900' },
  slotName: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textDark, marginTop: 2, maxWidth: 70 },
  rarityDotSm: { position: 'absolute', top: 6, left: 6, width: 8, height: 8, borderRadius: 4 },
  countBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: Colors.blue, borderRadius: Radius.pill, paddingHorizontal: 6, paddingVertical: 1 },
  countBadgeText: { color: '#fff', fontWeight: '900', fontSize: 10 },
  roomProgress: { width: 300, marginTop: Spacing.md, alignItems: 'center', gap: 6 },
  roomProgressText: { fontWeight: '800', color: Colors.textDark, fontSize: FontSize.md },
  progressTrack: { width: '80%', height: 8, borderRadius: 4, backgroundColor: Colors.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },

  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.lg },
  navBtn: { minWidth: 96 },
  roomDots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  roomDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gridBorder },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  modalCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, width: '100%', maxWidth: 340, overflow: 'hidden', ...Shadow.raised },
  modalGlow: { position: 'absolute', top: -40, alignSelf: 'center', width: 260, height: 200, borderRadius: 130 },
  modalDumpling: { width: 190, height: 168, alignItems: 'center', justifyContent: 'center' },
  modalName: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textDark, marginTop: Spacing.sm },
  modalTags: { flexDirection: 'row', gap: Spacing.sm },
  rarityTag: { borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 3 },
  rarityTagText: { color: '#fff', fontWeight: '900', fontSize: FontSize.xs, letterSpacing: 1 },
  roomTag: { borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 3, backgroundColor: Colors.surfaceAlt },
  roomTagText: { color: Colors.textMuted, fontWeight: '800', fontSize: FontSize.xs },
  modalDesc: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  modalOwned: { fontSize: FontSize.sm, color: Colors.blue, fontWeight: '800' },
});
