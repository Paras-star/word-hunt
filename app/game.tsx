import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { BannerSlot } from '@/components/BannerSlot';
import { CoinPill } from '@/components/CoinPill';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { highlightColorAt, toCellBg } from '@/constants/highlightColors';
import { getCategory } from '@/data/categories';
import { isBonusWord } from '@/data/bonusWords';
import { usePlayer } from '@/hooks/usePlayer';
import { generatePuzzle } from '@/lib/puzzle';
import { showRewardedAd, adsSupported } from '@/lib/ads';
import { playSound, stopMusic } from '@/lib/sound';
import { cellsSignature, lineBetween, posKey, wordFromCells } from '@/lib/wordSearch';
import type { GameMode, GridPosition } from '@/types';

const TIME_LIMIT = 120;
const START_HINTS = 3;

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category: string; mode: GameMode }>();
  const mode: GameMode = params.mode === 'time' ? 'time' : 'classic';
  const category = getCategory(params.category ?? '');

  const { coins, completePuzzle } = usePlayer();

  // Generate the puzzle exactly once for this play instance.
  const [puzzle] = useState(() => (category ? generatePuzzle(category, mode) : null));

  const [foundWords, setFoundWords] = useState<Record<string, number>>({});
  const [foundCellColors, setFoundCellColors] = useState<Record<string, string>>({});
  const [bonusWords, setBonusWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(START_HINTS);
  const [hintCells, setHintCells] = useState<GridPosition[]>([]);
  const [selection, setSelection] = useState<GridPosition[]>([]);
  const [gridWidth, setGridWidth] = useState(0);
  const [loadingAd, setLoadingAd] = useState(false);

  const hintAnim = useRef(new Animated.Value(0)).current;
  const anchor = useRef<GridPosition | null>(null);
  const lastSelection = useRef<GridPosition[]>([]);
  const completed = useRef(false);

  const size = puzzle?.size ?? 8;
  const cellSize = gridWidth > 0 ? gridWidth / size : 0;
  const timeLeft = Math.max(0, TIME_LIMIT - elapsed);

  // Pause ambient music during focused puzzle solving.
  useEffect(() => {
    stopMusic();
  }, []);

  // ---- Timer ----
  useEffect(() => {
    if (!puzzle) return;
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [puzzle]);

  // Countdown tick sound + game over for Time Mode.
  useEffect(() => {
    if (!puzzle || mode !== 'time' || completed.current) return;
    if (timeLeft <= 30 && timeLeft > 0) playSound('tick');
    if (timeLeft === 0) {
      completed.current = true;
      playSound('game_over');
      router.replace({
        pathname: '/results',
        params: {
          outcome: 'timeout',
          score: String(score),
          time: String(TIME_LIMIT),
          category: category?.id ?? '',
          mode,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, mode, puzzle]);

  const wordsRemaining = useMemo(
    () => (puzzle ? puzzle.words.filter((w) => foundWords[w] === undefined) : []),
    [puzzle, foundWords],
  );

  // ---- Completion ----
  useEffect(() => {
    if (!puzzle || completed.current) return;
    if (Object.keys(foundWords).length !== puzzle.words.length) return;
    completed.current = true;
    const timeBonus = mode === 'time' ? timeLeft * 2 : 0;
    const finalScore = score + timeBonus;
    playSound('level_complete');
    const timeTaken = mode === 'time' ? TIME_LIMIT - timeLeft : elapsed;
    (async () => {
      await completePuzzle(puzzle, {
        score: finalScore,
        coinsEarned: 50,
        timeTakenSec: timeTaken,
        bonusWords: bonusWords.size,
        puzzleWordsFound: puzzle.words.length,
      });
      router.replace('/unboxing');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundWords, puzzle]);

  const evaluateSelection = useCallback(
    (cells: GridPosition[]) => {
      if (!puzzle || cells.length < 2) {
        setSelection([]);
        return;
      }
      const word = wordFromCells(puzzle.grid, cells);
      const reversed = word.split('').reverse().join('');
      const sig = cellsSignature(cells);

      // Match against a placed puzzle word (either orientation).
      const match = puzzle.placements.find(
        (p) =>
          foundWords[p.word] === undefined &&
          cellsSignature(p.cells) === sig &&
          (p.word === word || p.word === reversed),
      );
      if (match) {
        const colorIndex = Object.keys(foundWords).length;
        const color = highlightColorAt(colorIndex);
        setFoundWords((prev) => ({ ...prev, [match.word]: colorIndex }));
        setFoundCellColors((prev) => {
          const next = { ...prev };
          match.cells.forEach((c) => {
            next[posKey(c)] = color;
          });
          return next;
        });
        setScore((s) => s + 10);
        playSound('correct');
        setSelection([]);
        return;
      }

      // Bonus word: valid common English word (>=3), not a puzzle word.
      const candidate = word.length >= 3 ? word : '';
      const bonusHit =
        (isBonusWord(word) && !puzzle.words.includes(word)) ||
        (isBonusWord(reversed) && !puzzle.words.includes(reversed));
      const bonusKey = isBonusWord(word) ? word : reversed;
      if (candidate && bonusHit && !bonusWords.has(bonusKey)) {
        setBonusWords((prev) => new Set(prev).add(bonusKey));
        setScore((s) => s + 5);
        playSound('bonus');
        setSelection([]);
        return;
      }

      // No match.
      playSound('wrong');
      setSelection([]);
    },
    [puzzle, foundWords, bonusWords],
  );

  const posFromXY = useCallback(
    (x: number, y: number): GridPosition | null => {
      if (cellSize <= 0) return null;
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);
      if (row < 0 || col < 0 || row >= size || col >= size) return null;
      return { row, col };
    },
    [cellSize, size],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin((e) => {
          const p = posFromXY(e.x, e.y);
          if (p) {
            anchor.current = p;
            lastSelection.current = [p];
            setSelection([p]);
          }
        })
        .onUpdate((e) => {
          if (!anchor.current) return;
          const p = posFromXY(e.x, e.y);
          if (!p) return;
          const line = lineBetween(anchor.current, p);
          if (line) {
            lastSelection.current = line;
            setSelection(line);
          }
        })
        .onEnd(() => {
          const cells = lastSelection.current;
          anchor.current = null;
          lastSelection.current = [];
          evaluateSelection(cells);
        })
        .onFinalize(() => {
          anchor.current = null;
        }),
    [posFromXY, evaluateSelection],
  );

  const useHint = useCallback(() => {
    if (!puzzle || hintsLeft <= 0 || wordsRemaining.length === 0) return;
    playSound('tap');
    const word = wordsRemaining[Math.floor(Math.random() * wordsRemaining.length)];
    const placement = puzzle.placements.find((p) => p.word === word);
    if (!placement) return;
    setHintCells(placement.cells);
    setHintsLeft((h) => h - 1);
    hintAnim.setValue(0);
    Animated.sequence([
      ...Array.from({ length: 3 }).flatMap(() => [
        Animated.timing(hintAnim, { toValue: 1, duration: 250, useNativeDriver: false }),
        Animated.timing(hintAnim, { toValue: 0, duration: 250, useNativeDriver: false }),
      ]),
    ]).start(() => setHintCells([]));
  }, [puzzle, hintsLeft, wordsRemaining, hintAnim]);

  const watchAdForHint = useCallback(async () => {
    setLoadingAd(true);
    const earned = await showRewardedAd();
    setLoadingAd(false);
    if (earned) setHintsLeft((h) => h + 1);
  }, []);

  if (!puzzle || !category) {
    return (
      <View style={styles.centerFill}>
        <Text style={styles.errText}>Could not load this puzzle.</Text>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.link}>Go Home</Text>
        </Pressable>
      </View>
    );
  }

  const selectionSet = new Set(selection.map(posKey));
  const hintSet = new Set(hintCells.map(posKey));
  const timeWarn = mode === 'time' && timeLeft < 30;
  const timerLabel =
    mode === 'time' ? formatTime(timeLeft) : formatTime(elapsed);

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.replace('/category')} hitSlop={12}>
            <Text style={styles.backText}>‹ Quit</Text>
          </Pressable>
          <Text style={styles.catTitle}>
            {category.emoji} {category.name}
          </Text>
          <CoinPill coins={coins} />
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>SCORE</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
          <View style={[styles.timerPill, timeWarn && styles.timerPillWarn]}>
            <Text style={[styles.timerText, timeWarn && styles.timerTextWarn]}>{timerLabel}</Text>
          </View>
          <Pressable
            style={[styles.hintBtn, (hintsLeft === 0 || wordsRemaining.length === 0) && styles.hintBtnDisabled]}
            onPress={useHint}
            disabled={hintsLeft === 0 || wordsRemaining.length === 0}
          >
            <Text style={styles.hintGlyph}>💡</Text>
            {hintsLeft > 0 && (
              <View style={styles.hintBadge}>
                <Text style={styles.hintBadgeText}>{hintsLeft}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Grid */}
        <GestureDetector gesture={pan}>
          <View
            style={styles.gridWrap}
            onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
          >
            {puzzle.grid.map((row, r) => (
              <View key={r} style={styles.gridRow}>
                {row.map((letter, c) => {
                  const key = `${r},${c}`;
                  const foundColor = foundCellColors[key];
                  const isSel = selectionSet.has(key);
                  const isHint = hintSet.has(key);
                  return (
                    <View
                      key={key}
                      style={[
                        styles.cell,
                        { width: cellSize, height: cellSize },
                        foundColor ? { backgroundColor: toCellBg(foundColor) } : null,
                        isSel ? styles.cellSelected : null,
                      ]}
                    >
                      {isHint && (
                        <Animated.View
                          style={[
                            StyleSheet.absoluteFill,
                            styles.hintOverlay,
                            { opacity: hintAnim },
                          ]}
                        />
                      )}
                      <Text
                        style={[
                          styles.cellText,
                          { fontSize: Math.max(11, cellSize * 0.42) },
                          isSel && styles.cellTextSelected,
                        ]}
                      >
                        {letter}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </GestureDetector>

        {/* Progress + hint-ad */}
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {Object.keys(foundWords).length}/{puzzle.words.length} words
            {bonusWords.size > 0 ? `  ·  ${bonusWords.size} bonus` : ''}
          </Text>
          {hintsLeft === 0 && adsSupported() && (
            <Pressable onPress={watchAdForHint} disabled={loadingAd}>
              <Text style={styles.adHint}>{loadingAd ? 'Loading…' : '🎬 +1 Hint'}</Text>
            </Pressable>
          )}
        </View>

        {/* Word list */}
        <ScrollView style={styles.wordPanel} contentContainerStyle={styles.wordPanelContent}>
          {puzzle.words.map((w) => {
            const found = foundWords[w] !== undefined;
            const color = found ? highlightColorAt(foundWords[w]) : undefined;
            return (
              <View
                key={w}
                style={[styles.wordChip, found && { backgroundColor: toCellBg(color!) }]}
              >
                <Text style={[styles.wordChipText, found && styles.wordChipFound]}>{w}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <BannerSlot />
    </View>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Colors.background },
  errText: { color: Colors.textDark, fontSize: FontSize.lg, fontWeight: '700' },
  link: { color: Colors.blue, fontSize: FontSize.md, fontWeight: '700' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText: { color: Colors.blue, fontWeight: '800', fontSize: FontSize.md, width: 70 },
  catTitle: { fontWeight: '900', color: Colors.textDark, fontSize: FontSize.md },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statBox: { alignItems: 'flex-start', width: 70 },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '800', letterSpacing: 1 },
  statValue: { fontSize: FontSize.xl, color: Colors.textDark, fontWeight: '900' },
  timerPill: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.gridBorder,
  },
  timerPillWarn: { backgroundColor: 'rgba(239,68,68,0.3)', borderColor: 'transparent' },
  timerText: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.textDark, fontVariant: ['tabular-nums'] },
  timerTextWarn: { color: '#c0182b' },
  hintBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gridBorder,
  },
  hintBtnDisabled: { opacity: 0.4 },
  hintGlyph: { fontSize: 22 },
  hintBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  hintBadgeText: { color: '#fff', fontWeight: '900', fontSize: FontSize.xs },
  gridWrap: {
    aspectRatio: 1,
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 2,
    overflow: 'hidden',
    ...(Colors ? {} : {}),
  },
  gridRow: { flexDirection: 'row', flex: 1 },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.gridBorder,
  },
  cellSelected: { backgroundColor: 'rgba(47,128,237,0.4)' },
  cellText: { fontWeight: '800', color: Colors.textDark },
  cellTextSelected: { color: '#fff' },
  hintOverlay: { backgroundColor: 'rgba(234,179,8,0.75)' },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  progressText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '700' },
  adHint: { fontSize: FontSize.sm, color: Colors.orange, fontWeight: '900' },
  wordPanel: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    maxHeight: 120,
  },
  wordPanelContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  wordChip: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.gridBorder,
  },
  wordChipText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textDark },
  wordChipFound: { color: Colors.foundWord, textDecorationLine: 'line-through' },
});
