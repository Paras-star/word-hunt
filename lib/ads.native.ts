import mobileAds, {
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

import { AdMobConfig, InterstitialRules } from '@/constants/ads';

let initialized = false;

export async function initAds(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    await mobileAds().initialize();
    loadInterstitial();
  } catch {
    // Ads are non-critical; ignore init failures (e.g. offline).
  }
}

// ---- Interstitial with frequency cap ----

let interstitial: InterstitialAd | null = null;
let interstitialLoaded = false;
let triggerCount = 0;
let lastShownAt = 0;

function loadInterstitial() {
  try {
    interstitial = InterstitialAd.createForAdRequest(AdMobConfig.INTERSTITIAL_AD_ID);
    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitialLoaded = true;
    });
    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialLoaded = false;
      loadInterstitial(); // preload the next one
    });
    interstitial.addAdEventListener(AdEventType.ERROR, () => {
      interstitialLoaded = false;
    });
    interstitial.load();
  } catch {
    interstitialLoaded = false;
  }
}

export function maybeShowInterstitial(): void {
  triggerCount += 1;
  // Show on every Nth eligible trigger only.
  if (triggerCount % InterstitialRules.everyNthTrigger !== 0) return;
  // Enforce the minimum interval between interstitials.
  if (Date.now() - lastShownAt < InterstitialRules.minIntervalMs) return;
  if (!interstitial || !interstitialLoaded) return;
  try {
    interstitial.show();
    lastShownAt = Date.now();
    interstitialLoaded = false;
  } catch {
    // ignore
  }
}

// ---- Rewarded (extra hints) ----

export async function showRewardedAd(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (earned: boolean) => {
      if (settled) return;
      settled = true;
      resolve(earned);
    };
    try {
      const rewarded = RewardedAd.createForAdRequest(AdMobConfig.REWARDED_AD_ID);
      let earned = false;
      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        try {
          rewarded.show();
        } catch {
          finish(false);
        }
      });
      rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      });
      rewarded.addAdEventListener(AdEventType.CLOSED, () => finish(earned));
      rewarded.addAdEventListener(AdEventType.ERROR, () => finish(false));
      rewarded.load();
      // Safety timeout so the UI never hangs waiting for an ad.
      setTimeout(() => finish(earned), 20_000);
    } catch {
      finish(false);
    }
  });
}

export function adsSupported(): boolean {
  return true;
}
