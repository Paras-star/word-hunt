import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Button } from '@/components/Button';
import { Dumpling } from '@/components/Dumpling';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { RARITY } from '@/constants/rarity';
import { getDumpling } from '@/data/dumplings';
import { usePlayer } from '@/hooks/usePlayer';
import { maybeShowInterstitial } from '@/lib/ads';
import { playSound } from '@/lib/sound';
import type { UnboxingState } from '@/types';

const PEEL_THRESHOLD = 90;

export default function UnboxingScreen() {
  const router = useRouter();
  const { activeReward, updateRewardStatus, claimReward } = usePlayer();

  const reward = activeReward;
  const dumpling = reward ? getDumpling(reward.dumplingId) : undefined;
  const rarityCfg = reward ? RARITY[reward.rarity] : RARITY.COMMON;

  const initialState: UnboxingState = useMemo(() => {
    if (!reward) return 'IDLE';
    if (reward.status === 'REVEALED') return 'RARITY_REVEAL';
    if (reward.status === 'CLAIMED') return 'COLLECTION_UPDATE';
    return 'STEAMER_PRESENT';
  }, [reward]);

  const [state, setState] = useState<UnboxingState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Animated values
  const enter = useRef(new Animated.Value(0)).current;
  const wrapperY = useRef(new Animated.Value(0)).current;
  const wrapperOpacity = useRef(new Animated.Value(1)).current;
  const lidY = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const steam = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const claimedRef = useRef(false);

  const goHomeIfNoReward = !reward || !dumpling;

  useEffect(() => {
    if (goHomeIfNoReward) {
      router.replace('/');
    }
  }, [goHomeIfNoReward, router]);

  // Mark UNBOXING as soon as the interactive sequence begins.
  useEffect(() => {
    if (reward && reward.status === 'PENDING') {
      void updateRewardStatus('UNBOXING');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advance = useCallback((from: UnboxingState, to: UnboxingState) => {
    // Guard: only advance if still in the expected state (prevents double-fire).
    if (stateRef.current !== from) return;
    setState(to);
  }, []);

  const completePeel = useCallback(() => {
    if (stateRef.current !== 'PEELING_WRAPPER') return;
    playSound('peel');
    Animated.parallel([
      Animated.timing(wrapperY, { toValue: -400, duration: 350, useNativeDriver: true }),
      Animated.timing(wrapperOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => advance('PEELING_WRAPPER', 'LID_READY'));
  }, [advance, wrapperY, wrapperOpacity]);

  const openLid = useCallback(() => {
    advance('LID_READY', 'OPENING_LID');
  }, [advance]);

  // ---- Per-state side effects / auto transitions ----
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    switch (state) {
      case 'STEAMER_PRESENT':
        playSound('steamer');
        Animated.spring(enter, { toValue: 1, useNativeDriver: true, bounciness: 8 }).start();
        timer = setTimeout(() => advance('STEAMER_PRESENT', 'PEELING_WRAPPER'), 900);
        break;
      case 'PEELING_WRAPPER':
        // Fallback so the sequence can never hard-block if a gesture is missed.
        timer = setTimeout(() => completePeel(), 4000);
        break;
      case 'LID_READY':
        timer = setTimeout(() => openLid(), 4000);
        break;
      case 'OPENING_LID':
        playSound('lid');
        Animated.timing(lidY, {
          toValue: -160,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => advance('OPENING_LID', 'STEAM_REVEAL'));
        // subtle resistance shake
        Animated.sequence([
          Animated.timing(shake, { toValue: 1, duration: 80, useNativeDriver: true }),
          Animated.timing(shake, { toValue: -1, duration: 80, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 0, duration: 80, useNativeDriver: true }),
        ]).start();
        break;
      case 'STEAM_REVEAL':
        playSound('steam');
        Animated.timing(steam, { toValue: 1, duration: 700, useNativeDriver: true }).start();
        timer = setTimeout(() => advance('STEAM_REVEAL', 'SILHOUETTE_REVEAL'), 750);
        break;
      case 'SILHOUETTE_REVEAL':
        playSound('suspense');
        timer = setTimeout(() => advance('SILHOUETTE_REVEAL', 'FINAL_REVEAL'), 1000);
        break;
      case 'FINAL_REVEAL':
        playSound('reveal');
        void updateRewardStatus('REVEALED');
        revealScale.setValue(0);
        Animated.spring(revealScale, { toValue: 1, useNativeDriver: true, bounciness: 12, speed: 6 }).start();
        timer = setTimeout(() => advance('FINAL_REVEAL', 'RARITY_REVEAL'), 950);
        break;
      case 'RARITY_REVEAL':
        playSound('rarity');
        if (revealScale) revealScale.setValue(1);
        Animated.loop(
          Animated.sequence([
            Animated.timing(glow, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 0.4, duration: 600, useNativeDriver: true }),
          ]),
          { iterations: 2 },
        ).start();
        timer = setTimeout(() => advance('RARITY_REVEAL', 'CHARACTER_ANIMATION'), 1100);
        break;
      case 'CHARACTER_ANIMATION':
        timer = setTimeout(() => advance('CHARACTER_ANIMATION', 'COLLECTION_UPDATE'), 1100);
        break;
      case 'COLLECTION_UPDATE':
        // Apply to collection exactly once (idempotent even if this fires twice).
        if (!claimedRef.current) {
          claimedRef.current = true;
          playSound(reward?.isNewDiscovery ? 'new_discovery' : 'duplicate');
          void claimReward().then(() => playSound('collection'));
        }
        break;
      default:
        break;
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Wrapper peel gesture
  const peelPan = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          const dy = Math.min(0, e.translationY);
          wrapperY.setValue(dy);
          wrapperOpacity.setValue(Math.max(0.2, 1 - Math.abs(dy) / (PEEL_THRESHOLD * 2)));
        })
        .onEnd((e) => {
          if (Math.abs(e.translationY) > PEEL_THRESHOLD) {
            completePeel();
          } else {
            Animated.spring(wrapperY, { toValue: 0, useNativeDriver: true }).start();
            Animated.spring(wrapperOpacity, { toValue: 1, useNativeDriver: true }).start();
          }
        }),
    [completePeel, wrapperY, wrapperOpacity],
  );

  const goToResults = useCallback(() => {
    maybeShowInterstitial();
    router.replace('/results');
  }, [router]);

  if (goHomeIfNoReward || !reward || !dumpling) {
    return <View style={styles.root} />;
  }

  const enterTranslate = enter.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const shakeTranslate = shake.interpolate({ inputRange: [-1, 1], outputRange: [-4, 4] });
  const showDumplingArea = ['STEAM_REVEAL', 'SILHOUETTE_REVEAL', 'FINAL_REVEAL', 'RARITY_REVEAL', 'CHARACTER_ANIMATION', 'COLLECTION_UPDATE', 'COMPLETE'].includes(state);
  const showSilhouette = state === 'STEAM_REVEAL' || state === 'SILHOUETTE_REVEAL';
  const showRarity = ['RARITY_REVEAL', 'CHARACTER_ANIMATION', 'COLLECTION_UPDATE', 'COMPLETE'].includes(state);
  const showCollection = state === 'COLLECTION_UPDATE' || state === 'COMPLETE';

  return (
    <View style={[styles.root, { backgroundColor: '#141018' }]}>
      <Text style={styles.header}>Mystery Dumpling</Text>
      <Text style={styles.subHeader}>{promptForState(state)}</Text>

      <View style={styles.stage}>
        {/* Rarity glow backdrop */}
        {showRarity && (
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: glow,
                backgroundColor: rarityCfg.color,
                shadowColor: rarityCfg.color,
              },
            ]}
          />
        )}

        {/* Steam particles */}
        {(state === 'STEAM_REVEAL' || state === 'SILHOUETTE_REVEAL' || state === 'OPENING_LID') && (
          <SteamParticles progress={steam} />
        )}

        {/* Dumpling reveal area */}
        {showDumplingArea && (
          <Animated.View
            style={{
              transform: [
                {
                  scale: state === 'FINAL_REVEAL' || showRarity ? revealScale : 1,
                },
                {
                  rotate: revealScale.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '0deg'] }),
                },
              ],
            }}
          >
            <Dumpling
              dumpling={dumpling}
              size={170}
              silhouette={showSilhouette}
              animate={state === 'CHARACTER_ANIMATION' || showCollection}
            />
          </Animated.View>
        )}

        {/* Steamer + lid + wrapper (pre-reveal) */}
        {!showDumplingArea && (
          <Animated.View style={{ transform: [{ translateY: enterTranslate }] }}>
            <Animated.View style={{ transform: [{ translateX: shakeTranslate }] }}>
              <Steamer lidY={lidY} />
            </Animated.View>

            {state === 'PEELING_WRAPPER' && (
              <GestureDetector gesture={peelPan}>
                <Animated.View
                  style={[
                    styles.wrapper,
                    { transform: [{ translateY: wrapperY }], opacity: wrapperOpacity },
                  ]}
                >
                  <Pressable style={styles.wrapperPressable} onPress={completePeel}>
                    <Text style={styles.wrapperText}>Swipe up to peel ✋</Text>
                  </Pressable>
                </Animated.View>
              </GestureDetector>
            )}

            {state === 'LID_READY' && (
              <Pressable style={styles.tapHint} onPress={openLid}>
                <Text style={styles.tapHintText}>Tap to open the lid</Text>
              </Pressable>
            )}
          </Animated.View>
        )}
      </View>

      {/* Rarity label */}
      {showRarity && (
        <View style={[styles.rarityBadge, { borderColor: rarityCfg.color }]}>
          <Text style={[styles.rarityText, { color: rarityCfg.color }]}>
            {rarityCfg.label.toUpperCase()}
          </Text>
        </View>
      )}

      {/* Dumpling name */}
      {['FINAL_REVEAL', 'RARITY_REVEAL', 'CHARACTER_ANIMATION', 'COLLECTION_UPDATE', 'COMPLETE'].includes(state) && (
        <Text style={styles.dumplingName}>{dumpling.name}</Text>
      )}

      {/* Collection confirmation + actions */}
      {showCollection && (
        <View style={styles.footer}>
          <View style={[styles.discoveryPill, reward.isNewDiscovery ? styles.newPill : styles.dupPill]}>
            <Text style={styles.discoveryText}>
              {reward.isNewDiscovery ? '✨ NEW DISCOVERY' : `DUPLICATE ×${reward.quantityAfter}`}
            </Text>
          </View>
          <Text style={styles.dumplingDesc}>{dumpling.description}</Text>
          <Button label="Continue" size="lg" onPress={goToResults} />
        </View>
      )}
    </View>
  );
}

function promptForState(state: UnboxingState): string {
  switch (state) {
    case 'STEAMER_PRESENT':
      return 'A fresh steamer arrives…';
    case 'PEELING_WRAPPER':
      return 'Peel the wrapper';
    case 'LID_READY':
      return 'Something is inside…';
    case 'OPENING_LID':
      return 'Lifting the lid…';
    case 'STEAM_REVEAL':
      return 'Steam rises…';
    case 'SILHOUETTE_REVEAL':
      return 'Who could it be?';
    case 'FINAL_REVEAL':
      return 'You discovered…';
    case 'RARITY_REVEAL':
      return 'Rarity revealed!';
    case 'CHARACTER_ANIMATION':
      return 'Say hello!';
    case 'COLLECTION_UPDATE':
    case 'COMPLETE':
      return 'Added to your collection';
    default:
      return '';
  }
}

function Steamer({ lidY }: { lidY: Animated.Value }) {
  return (
    <View style={styles.steamer}>
      {/* Lid */}
      <Animated.View style={[styles.lid, { transform: [{ translateY: lidY }] }]}>
        <View style={styles.lidKnob} />
        <View style={styles.lidBand} />
      </Animated.View>
      {/* Basket bands */}
      <View style={styles.basket}>
        <View style={styles.basketBand} />
        <View style={styles.basketBand} />
        <View style={styles.basketBand} />
      </View>
    </View>
  );
}

function SteamParticles({ progress }: { progress: Animated.Value }) {
  const puffs = [0, 1, 2, 3, 4];
  return (
    <View pointerEvents="none" style={styles.steamLayer}>
      {puffs.map((i) => {
        const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [20, -90 - i * 12] });
        const opacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.5, 0] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.puff,
              {
                left: 60 + i * 22,
                transform: [{ translateY }, { scale: 1 + i * 0.15 }],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.lg },
  header: { color: '#fff', fontSize: FontSize.xl, fontWeight: '900', letterSpacing: 0.5 },
  subHeader: { color: '#b9b3c7', fontSize: FontSize.md, marginTop: 6, marginBottom: Spacing.lg, minHeight: 20 },
  stage: {
    width: 260,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    shadowOpacity: 0.9,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  steamer: { alignItems: 'center' },
  lid: {
    width: 190,
    height: 46,
    backgroundColor: '#d9a86b',
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#b6863f',
    zIndex: 3,
  },
  lidKnob: { width: 34, height: 14, borderRadius: 8, backgroundColor: '#b6863f', marginBottom: 3 },
  lidBand: { width: 150, height: 4, borderRadius: 2, backgroundColor: '#c69455' },
  basket: {
    width: 200,
    height: 150,
    backgroundColor: '#e7bd86',
    borderRadius: 18,
    marginTop: -6,
    paddingTop: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 3,
    borderColor: '#c69455',
    overflow: 'hidden',
  },
  basketBand: { width: 176, height: 26, borderRadius: 6, backgroundColor: '#d9a86b' },
  wrapper: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    height: 250,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  wrapperPressable: { padding: Spacing.lg },
  wrapperText: { color: '#6b6b76', fontWeight: '800', fontSize: FontSize.md },
  tapHint: {
    marginTop: Spacing.lg,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  tapHintText: { color: '#fff', fontWeight: '800' },
  steamLayer: { position: 'absolute', top: 40, width: 260, height: 200 },
  puff: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  rarityBadge: {
    marginTop: Spacing.md,
    borderWidth: 2,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
  },
  rarityText: { fontWeight: '900', letterSpacing: 2, fontSize: FontSize.md },
  dumplingName: { color: '#fff', fontSize: FontSize.xl, fontWeight: '900', marginTop: Spacing.sm },
  footer: { alignItems: 'center', gap: Spacing.md, marginTop: Spacing.md, width: '100%' },
  discoveryPill: { paddingHorizontal: Spacing.lg, paddingVertical: 6, borderRadius: Radius.pill },
  newPill: { backgroundColor: 'rgba(72,187,120,0.25)' },
  dupPill: { backgroundColor: 'rgba(255,255,255,0.14)' },
  discoveryText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
  dumplingDesc: {
    color: '#c9c4d4',
    textAlign: 'center',
    fontSize: FontSize.sm,
    paddingHorizontal: Spacing.lg,
  },
});
