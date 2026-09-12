import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { BambooSteamer } from '@/components/BambooSteamer';
import { Button } from '@/components/Button';
import { Dumpling } from '@/components/Dumpling';
import { RisingSparkles, SparkleBurst, Sunburst } from '@/components/Sparkles';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { RARITY } from '@/constants/rarity';
import { getDumpling } from '@/data/dumplings';
import { usePlayer } from '@/hooks/usePlayer';
import { maybeShowInterstitial } from '@/lib/ads';
import { alpha } from '@/lib/color';
import { playSound, startMusic } from '@/lib/sound';
import type { UnboxingState } from '@/types';

const PEEL_THRESHOLD = 90;
const STAGE = 320;
const BASKET_W = 188;

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
  const jiggle = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const claimedRef = useRef(false);
  const jiggleLoop = useRef<Animated.CompositeAnimation | null>(null);

  const goHomeIfNoReward = !reward || !dumpling;

  useEffect(() => {
    if (goHomeIfNoReward) router.replace('/');
  }, [goHomeIfNoReward, router]);

  // Soothing ambient music for the reward moment. It continues into menus/results
  // and is paused only when a puzzle starts (see the game screen).
  useEffect(() => {
    startMusic();
  }, []);

  useEffect(() => {
    if (reward && reward.status === 'PENDING') void updateRewardStatus('UNBOXING');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advance = useCallback((from: UnboxingState, to: UnboxingState) => {
    if (stateRef.current !== from) return;
    setState(to);
  }, []);

  const startJiggle = useCallback(
    (intensity: number) => {
      jiggleLoop.current?.stop();
      jiggle.setValue(0);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(jiggle, { toValue: intensity, duration: 60, useNativeDriver: true }),
          Animated.timing(jiggle, { toValue: -intensity, duration: 60, useNativeDriver: true }),
        ]),
      );
      jiggleLoop.current = loop;
      loop.start();
    },
    [jiggle],
  );

  const stopJiggle = useCallback(() => {
    jiggleLoop.current?.stop();
    Animated.timing(jiggle, { toValue: 0, duration: 80, useNativeDriver: true }).start();
  }, [jiggle]);

  const completePeel = useCallback(() => {
    if (stateRef.current !== 'PEELING_WRAPPER') return;
    playSound('peel');
    Animated.parallel([
      Animated.timing(wrapperY, { toValue: -420, duration: 380, useNativeDriver: true }),
      Animated.timing(wrapperOpacity, { toValue: 0, duration: 380, useNativeDriver: true }),
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
        Animated.spring(enter, { toValue: 1, useNativeDriver: true, bounciness: 9 }).start();
        startJiggle(0.35);
        timer = setTimeout(() => advance('STEAMER_PRESENT', 'PEELING_WRAPPER'), 1000);
        break;
      case 'PEELING_WRAPPER':
        stopJiggle();
        timer = setTimeout(() => completePeel(), 4500);
        break;
      case 'LID_READY':
        startJiggle(0.5);
        timer = setTimeout(() => openLid(), 4500);
        break;
      case 'OPENING_LID':
        playSound('lid');
        startJiggle(2.4); // building anticipation shake
        timer = setTimeout(() => {
          stopJiggle();
          Animated.timing(lidY, {
            toValue: -260,
            duration: 520,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start(() => advance('OPENING_LID', 'STEAM_REVEAL'));
        }, 1200);
        break;
      case 'STEAM_REVEAL':
        playSound('steam');
        timer = setTimeout(() => advance('STEAM_REVEAL', 'SILHOUETTE_REVEAL'), 700);
        break;
      case 'SILHOUETTE_REVEAL':
        playSound('suspense');
        timer = setTimeout(() => advance('SILHOUETTE_REVEAL', 'FINAL_REVEAL'), 1000);
        break;
      case 'FINAL_REVEAL':
        playSound('reveal');
        playSound('sparkle');
        void updateRewardStatus('REVEALED');
        revealScale.setValue(0);
        shimmer.setValue(0);
        Animated.spring(revealScale, { toValue: 1, useNativeDriver: true, bounciness: 14, speed: 5 }).start();
        Animated.timing(shimmer, { toValue: 1, duration: 900, delay: 200, useNativeDriver: true }).start();
        timer = setTimeout(() => advance('FINAL_REVEAL', 'RARITY_REVEAL'), 1050);
        break;
      case 'RARITY_REVEAL':
        playSound('rarity');
        if (rarityCfg.intensity >= 3) playSound('sparkle');
        revealScale.setValue(1);
        Animated.loop(
          Animated.sequence([
            Animated.timing(glow, { toValue: 1, duration: 550, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 0.45, duration: 550, useNativeDriver: true }),
          ]),
          { iterations: 2 },
        ).start();
        timer = setTimeout(() => advance('RARITY_REVEAL', 'CHARACTER_ANIMATION'), 1150);
        break;
      case 'CHARACTER_ANIMATION':
        timer = setTimeout(() => advance('CHARACTER_ANIMATION', 'COLLECTION_UPDATE'), 1150);
        break;
      case 'COLLECTION_UPDATE':
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

  useEffect(() => () => jiggleLoop.current?.stop(), []);

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

  const enterTranslate = enter.interpolate({ inputRange: [0, 1], outputRange: [50, 0] });
  const jiggleTranslate = jiggle.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] });

  const preReveal = ['STEAMER_PRESENT', 'PEELING_WRAPPER', 'LID_READY', 'OPENING_LID'].includes(state);
  const showDumpling = ['STEAM_REVEAL', 'SILHOUETTE_REVEAL', 'FINAL_REVEAL', 'RARITY_REVEAL', 'CHARACTER_ANIMATION', 'COLLECTION_UPDATE', 'COMPLETE'].includes(state);
  const showSilhouette = state === 'STEAM_REVEAL' || state === 'SILHOUETTE_REVEAL';
  const showRarity = ['RARITY_REVEAL', 'CHARACTER_ANIMATION', 'COLLECTION_UPDATE', 'COMPLETE'].includes(state);
  const showCollection = state === 'COLLECTION_UPDATE' || state === 'COMPLETE';
  const showSunburst = ['OPENING_LID', 'STEAM_REVEAL', 'SILHOUETTE_REVEAL', 'FINAL_REVEAL', 'RARITY_REVEAL', 'CHARACTER_ANIMATION', 'COLLECTION_UPDATE'].includes(state);
  const showRising = ['LID_READY', 'OPENING_LID', 'STEAM_REVEAL', 'SILHOUETTE_REVEAL'].includes(state);
  const burstColors = rarityCfg.colors;

  const shimmerX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-STAGE * 0.5, STAGE * 0.5] });

  return (
    <LinearGradient colors={['#3a2a52', '#241a33', '#161020']} style={styles.root}>
      <Text style={styles.header}>Mystery Dumpling</Text>
      <Text style={styles.subHeader}>{promptForState(state)}</Text>

      <View style={styles.stage}>
        {/* Rarity glow backdrop */}
        {showRarity && (
          <Animated.View
            style={[
              styles.glow,
              { opacity: glow, backgroundColor: rarityCfg.color, shadowColor: rarityCfg.color },
            ]}
          />
        )}

        {/* Sunburst rays behind */}
        {showSunburst && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.center}>
              <Sunburst size={STAGE * 1.15} color={rarityCfg.color} rays={18} />
            </View>
          </View>
        )}

        {/* Rising ambient sparkles */}
        {showRising && <RisingSparkles width={STAGE} height={STAGE} count={12} />}

        {/* Steamer basket (persists) with lid and emerging dumpling */}
        <Animated.View
          style={[
            styles.steamerAnchor,
            { transform: [{ translateY: enterTranslate }, { translateX: jiggleTranslate }] },
          ]}
        >
          {/* Dumpling emerging from the basket */}
          {showDumpling && (
            <Animated.View
              style={[
                styles.dumplingHolder,
                {
                  transform: [
                    { scale: state === 'STEAM_REVEAL' ? 0.9 : revealScale },
                    {
                      rotate: revealScale.interpolate({ inputRange: [0, 1], outputRange: ['-10deg', '0deg'] }),
                    },
                  ],
                },
              ]}
            >
              <Dumpling
                dumpling={dumpling}
                size={150}
                silhouette={showSilhouette}
                animate={state === 'CHARACTER_ANIMATION' || showCollection}
              />
              {/* Reflective shimmer sweep on reveal */}
              {state === 'FINAL_REVEAL' && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.shimmer,
                    { transform: [{ translateX: shimmerX }, { rotate: '18deg' }] },
                  ]}
                />
              )}
            </Animated.View>
          )}

          <BambooSteamer
            width={BASKET_W}
            lidTranslateY={lidY}
            showLid={preReveal}
            showInterior={showDumpling}
          />
        </Animated.View>

        {/* Reveal glitter burst */}
        {state === 'FINAL_REVEAL' && (
          <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
            <SparkleBurst size={STAGE} count={22} colors={burstColors} />
          </View>
        )}
        {showRarity && rarityCfg.intensity >= 4 && (
          <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
            <SparkleBurst size={STAGE * 1.1} count={14} colors={burstColors} duration={1300} />
          </View>
        )}

        {/* Wrapper overlay (peel interaction) */}
        {state === 'PEELING_WRAPPER' && (
          <GestureDetector gesture={peelPan}>
            <Animated.View
              style={[styles.wrapper, { transform: [{ translateY: wrapperY }], opacity: wrapperOpacity }]}
            >
              <Pressable style={styles.wrapperInner} onPress={completePeel}>
                <View style={styles.wrapperFoldTop} />
                <Text style={styles.wrapperTitle}>MYSTERY{'\n'}DUMPLING</Text>
                <View style={styles.wrapperDashed} />
                <Text style={styles.wrapperHint}>swipe up to peel ↑</Text>
              </Pressable>
            </Animated.View>
          </GestureDetector>
        )}

        {state === 'LID_READY' && (
          <Pressable style={styles.tapHint} onPress={openLid}>
            <Text style={styles.tapHintText}>tap to open</Text>
          </Pressable>
        )}
      </View>

      {/* Rarity label */}
      {showRarity && (
        <View style={[styles.rarityBadge, { borderColor: rarityCfg.color, backgroundColor: alpha(rarityCfg.color, 0.16) }]}>
          <Text style={[styles.rarityText, { color: rarityCfg.color }]}>{rarityCfg.label.toUpperCase()}</Text>
        </View>
      )}

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
    </LinearGradient>
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
      return 'Here it comes…';
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

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', paddingTop: 64, paddingHorizontal: Spacing.lg },
  header: { color: '#fff', fontSize: FontSize.xl, fontWeight: '900', letterSpacing: 0.5 },
  subHeader: { color: '#c8bfe0', fontSize: FontSize.md, marginTop: 6, marginBottom: Spacing.md, minHeight: 20 },
  stage: { width: STAGE, height: STAGE, alignItems: 'center', justifyContent: 'flex-end' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    alignSelf: 'center',
    top: STAGE * 0.2,
    width: 230,
    height: 230,
    borderRadius: 115,
    shadowOpacity: 0.9,
    shadowRadius: 45,
    shadowOffset: { width: 0, height: 0 },
    elevation: 22,
  },
  steamerAnchor: { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 10 },
  dumplingHolder: { position: 'absolute', bottom: BASKET_W * 0.32, alignItems: 'center', overflow: 'hidden', zIndex: 2 },
  shimmer: {
    position: 'absolute',
    top: 0,
    width: 26,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  wrapper: {
    position: 'absolute',
    top: STAGE * 0.14,
    width: BASKET_W + 26,
    height: BASKET_W + 20,
    zIndex: 5,
  },
  wrapperInner: {
    flex: 1,
    backgroundColor: '#fdf1c9',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f2d98a',
    overflow: 'hidden',
  },
  wrapperFoldTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  wrapperTitle: {
    color: '#e07a2a',
    fontWeight: '900',
    fontSize: FontSize.lg,
    textAlign: 'center',
    letterSpacing: 1,
  },
  wrapperDashed: {
    marginVertical: 14,
    width: '86%',
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d9b25a',
  },
  wrapperHint: { color: '#a9843f', fontWeight: '700', fontSize: FontSize.sm },
  tapHint: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    zIndex: 6,
  },
  tapHintText: { color: '#fff', fontWeight: '800' },
  rarityBadge: { marginTop: Spacing.md, borderWidth: 2, borderRadius: Radius.pill, paddingHorizontal: Spacing.lg, paddingVertical: 6 },
  rarityText: { fontWeight: '900', letterSpacing: 2, fontSize: FontSize.md },
  dumplingName: { color: '#fff', fontSize: FontSize.xl, fontWeight: '900', marginTop: Spacing.sm },
  footer: { alignItems: 'center', gap: Spacing.md, marginTop: Spacing.md, width: '100%' },
  discoveryPill: { paddingHorizontal: Spacing.lg, paddingVertical: 6, borderRadius: Radius.pill },
  newPill: { backgroundColor: 'rgba(72,187,120,0.28)' },
  dupPill: { backgroundColor: 'rgba(255,255,255,0.16)' },
  discoveryText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
  dumplingDesc: { color: '#cfc7de', textAlign: 'center', fontSize: FontSize.sm, paddingHorizontal: Spacing.lg },
});
