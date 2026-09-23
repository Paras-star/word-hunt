import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { PlayerProvider, usePlayer } from '@/hooks/usePlayer';
import { initAds } from '@/lib/ads';

/**
 * On launch, resume any interrupted reward so the player never loses (or
 * duplicates) a dumpling. A leftover CLAIMED reward is simply cleared.
 */
function RewardRecovery() {
  const { ready, activeReward, finalizeReward } = usePlayer();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!ready || !activeReward) return;
    const current = segments[segments.length - 1];
    if (activeReward.status === 'CLAIMED') {
      // Finished previously but not cleared — clear it so it isn't shown again.
      void finalizeReward();
      return;
    }
    // PENDING / UNBOXING / REVEALED → resume the unboxing sequence.
    if (current !== 'unboxing') {
      router.replace('/unboxing');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    void initAds();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PlayerProvider>
          <StatusBar style="dark" />
          <RewardRecovery />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
              animation: 'slide_from_right',
            }}
          />
        </PlayerProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
